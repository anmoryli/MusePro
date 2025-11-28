package com.anmory.musepro.task;

import com.anmory.musepro.mapper.SongsMapper;
import com.anmory.musepro.model.Songs;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import javax.net.ssl.*;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.security.cert.X509Certificate;
import java.util.List;
import java.util.Map;

@Component
@EnableScheduling
public class SongDownloadTask {

    private static final Logger log = LoggerFactory.getLogger(SongDownloadTask.class);

    @Autowired private SongsMapper songsMapper;
    @Autowired private RestTemplate restTemplate;

    private static final String LOCAL_DIR = "/usr/local/nginx/files/mo-face-swap";
    private static final String PUBLIC_BASE = "https://175.24.205.213:100/mo-face-swap";
    private static final String API_KEY = System.getenv("YUNWU_API_KEY") != null
            ? System.getenv("YUNWU_API_KEY") : "your-key-here";

    static {
        File dir = new File(LOCAL_DIR);
        if (!dir.exists()) {
            boolean created = dir.mkdirs();
            log.info("创建本地存储目录 {}: {}", LOCAL_DIR, created ? "成功" : "失败");
        }

        // SSL 绕过（只信任你的服务器）
        try {
            TrustManager[] trustAllCerts = new TrustManager[]{
                    new X509TrustManager() {
                        public X509Certificate[] getAcceptedIssuers() { return null; }
                        public void checkClientTrusted(X509Certificate[] certs, String authType) {}
                        public void checkServerTrusted(X509Certificate[] certs, String authType) {}
                    }
            };
            SSLContext sc = SSLContext.getInstance("SSL");
            sc.init(null, trustAllCerts, new java.security.SecureRandom());
            HttpsURLConnection.setDefaultSSLSocketFactory(sc.getSocketFactory());
            HttpsURLConnection.setDefaultHostnameVerifier((hostname, session) ->
                    "175.24.205.213".equals(hostname) || hostname.endsWith(".yunwu.ai"));
        } catch (Exception e) {
            log.error("SSL 绕过配置失败", e);
        }
    }

    // 每 5 秒轮询一次（比 8 秒更快响应）
    @Scheduled(fixedDelay = 5000, initialDelay = 5000)
    public void run() {
        List<Songs> tasks = songsMapper.getGeneratingTasks();
        if (tasks.isEmpty()) {
            return;
        }

        log.info("检测到 {} 个待处理的生成任务，开始分配线程处理", tasks.size());

        for (Songs task : tasks) {
            processTaskAsync(task); // 异步处理，互不卡顿！
        }
    }

    // 每个任务独立线程执行
    @Async
    public void processTaskAsync(Songs task) {
        try {
            if (processTask(task)) {
                songsMapper.markTaskCompleted(task.getTaskId());
                log.info("任务 {} 处理完成，已标记为 completed", task.getTaskId());
            }
        } catch (Exception e) {
            log.error("异步处理任务 {} 失败", task.getTaskId(), e);
        }
    }

    @SuppressWarnings("unchecked")
    public boolean processTask(Songs task) throws Exception {
        String taskId = task.getTaskId();
        Integer userId = task.getUserId();

        log.info("正在查询 task_id = {} 的生成状态...", taskId);

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + API_KEY);
        HttpEntity<?> entity = new HttpEntity<>(headers);

        ResponseEntity<Map> response;
        try {
            response = restTemplate.exchange(
                    "https://yunwu.ai/suno/fetch/" + taskId,
                    HttpMethod.GET,
                    entity,
                    Map.class
            );
        } catch (Exception e) {
            log.warn("查询任务状态失败 task_id={}，稍后重试", taskId);
            return false;
        }

        Map<String, Object> body = response.getBody();
        if (body == null || !"success".equals(body.get("code"))) {
            log.warn("task_id={} 返回非 success", taskId);
            return false;
        }

        Map<String, Object> data = (Map<String, Object>) body.get("data");
        String status = (String) data.get("status");

        if (!"SUCCESS".equalsIgnoreCase(status)) {
            log.info("task_id={} 仍在生成中，状态：{}", taskId, status);
            return false;
        }

        List<Map<String, Object>> songList = (List<Map<String, Object>>) data.get("data");
        if (songList == null || songList.isEmpty()) {
            log.error("task_id={} 返回空歌曲列表", taskId);
            return false;
        }

        log.info("task_id={} 生成成功！共 {} 首，开始, 开始下载入库", taskId, songList.size());

        int successCount = 0;
        for (int i = 0; i < songList.size(); i++) {
            Map<String, Object> s = songList.get(i);

            String clipId = (String) s.get("clip_id");
            String title = (String) s.get("title");
            String audioUrl = (String) s.get("audio_url");
            String imageLargeUrl = (String) s.get("image_url");
            String prompt = (String) s.get("prompt");
            String tags = (String) s.get("tags");
            Object durationObj = s.get("duration");
            Integer duration = (durationObj instanceof Number) ? ((Number) durationObj).intValue() : null;
            String lyrics = (String) s.get("lyrics");

            if (title == null || title.trim().isEmpty()) {
                title = task.getTitle() + " #" + (i + 1);
            }

            // 下载音频
            String audioFileName = clipId + ".mp3";
            String audioPath = LOCAL_DIR + "/" + audioFileName;
            String audioPublicUrl = PUBLIC_BASE + "/" + audioFileName;

            if (!new File(audioPath).exists()) {
                try {
                    downloadFileWithTimeout(audioUrl, audioPath, 60000); // 60秒超时
                    log.info("第{}首 音频下载成功 → {}", i + 1, audioPublicUrl);
                } catch (Exception e) {
                    log.error("第{}首 音频下载失败 clip_id={}", i + 1, clipId, e);
                    continue;
                }
            }

            String coverImageUrl = imageLargeUrl;

            try {
                songsMapper.insertCompletedSong(
                        userId, taskId, clipId, title, prompt,
                        tags != null ? tags : "",
                        task.getMvVersion(),
                        task.getMakeInstrumental() != null && task.getMakeInstrumental(),
                        audioPublicUrl, null, duration,
                        lyrics != null ? lyrics : prompt,
                        coverImageUrl
                );
                successCount++;
            } catch (Exception e) {
                if (e.getCause() instanceof java.sql.SQLIntegrityConstraintViolationException) {
                    log.info("第{}首 已存在，跳过 clip_id={}", i + 1, clipId);
                } else {
                    log.error("第{}首 入库失败", i + 1, e);
                }
            }
        }

        log.info("任务 {} 本次成功入库 {} 首", taskId, successCount);
        return successCount > 0;
    }

    // 带超时的下载方法（防止卡死）
    private void downloadFileWithTimeout(String fileUrl, String savePath, int timeout) throws Exception {
        URL url = new URL(fileUrl);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setConnectTimeout(10000);
        conn.setReadTimeout(timeout);

        try (InputStream in = conn.getInputStream();
             FileOutputStream out = new FileOutputStream(savePath)) {
            byte[] buffer = new byte[8192];
            int len;
            while ((len = in.read(buffer)) != -1) {
                out.write(buffer, 0, len);
            }
        } finally {
            conn.disconnect();
        }
    }
}
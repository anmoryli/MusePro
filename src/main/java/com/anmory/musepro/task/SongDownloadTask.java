// src/main/java/com/anmory/musepro/task/SongDownloadTask.java
package com.anmory.musepro.task;

import com.anmory.musepro.mapper.SongsMapper;
import com.anmory.musepro.model.Songs;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
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

    // 本地存储目录（Nginx 静态资源目录）
    private static final String LOCAL_DIR = "/usr/local/nginx/files/mo-face-swap";
    // 对外访问前缀
    private static final String PUBLIC_BASE = "https://175.24.205.213:100/mo-face-swap";
    // 云雾 API Key
    private static final String API_KEY = System.getenv("YUNWU_API_KEY") != null
            ? System.getenv("YUNWU_API_KEY") : "your-key-here";

    static {
        // 确保目录存在
        File dir = new File(LOCAL_DIR);
        if (!dir.exists()) {
            boolean created = dir.mkdirs();
            log.info("创建本地存储目录 {}: {}", LOCAL_DIR, created ? "成功" : "失败");
        }
    }

    // 绕过你自己服务器的 SSL 证书校验（仅对 175.24.205.213:100 生效）
    static {
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
                    "175.24.205.213".equals(hostname) || hostname.endsWith(".yunwu.ai")
            );
        } catch (Exception e) {
            log.error("SSL 绕过配置失败", e);
        }
    }

    @Scheduled(fixedDelay = 8000, initialDelay = 8000)
    public void run() {
        List<Songs> tasks = songsMapper.getGeneratingTasks();
        if (tasks.isEmpty()) {
            return;
        }

        log.info("检测到 {} 个待处理的生成任务", tasks.size());

        for (Songs task : tasks) {
            try {
                if (processTask(task)) {
                    songsMapper.markTaskCompleted(task.getTaskId());
                    log.info("任务 {} 已全部处理完成并标记为 completed", task.getTaskId());
                }
            } catch (Exception e) {
                log.error("处理任务 {} 时发生未知异常", task.getTaskId(), e);
            }
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
            log.warn("查询任务状态失败 task_id={}，网络波动，稍后重试", taskId);
            return false;
        }

        Map<String, Object> body = response.getBody();
        if (body == null || !"success".equals(body.get("code"))) {
            log.warn("task_id={} 返回非 success 或无数据", taskId);
            return false;
        }

        Map<String, Object> data = (Map<String, Object>) body.get("data");
        String status = (String) data.get("status");

        if (!"SUCCESS".equalsIgnoreCase(status)) {
            log.info("task_id={} 仍在生成中，当前状态：{}", taskId, status);
            return false;
        }

        List<Map<String, Object>> songList = (List<Map<String, Object>>) data.get("data");
        if (songList == null || songList.isEmpty()) {
            log.error("task_id={} 返回了空歌曲列表", taskId);
            return false;
        }

        log.info("task_id={} 生成成功！共 {} 首歌曲，开始处理入库", taskId, songList.size());

        int successCount = 0;

        for (int i = 0; i < songList.size(); i++) {
            Map<String, Object> s = songList.get(i);

            String clipId = (String) s.get("clip_id");
            String title = (String) s.get("title");
            String audioUrl = (String) s.get("audio_url");
            String imageLargeUrl = (String) s.get("image_url");  // 直接用官方封面链接
            String prompt = (String) s.get("prompt");
            String tags = (String) s.get("tags");
            Object durationObj = s.get("duration");
            Integer duration = (durationObj instanceof Number) ? ((Number) durationObj).intValue() : null;
            String lyrics = (String) s.get("lyrics");

            if (title == null || title.trim().isEmpty()) {
                title = task.getTitle() + " #" + (i + 1);
            }

            // ========= 音频：必须下载到本地服务器 =========
            String audioFileName = clipId + ".mp3";
            String audioPath = LOCAL_DIR + "/" + audioFileName;
            String audioPublicUrl = PUBLIC_BASE + "/" + audioFileName;

            if (!new File(audioPath).exists()) {
                try {
                    downloadFile(audioUrl, audioPath);
                    log.info("第{}首 音频下载成功 → {}", i + 1, audioPublicUrl);
                } catch (Exception e) {
                    log.error("第{}首 音频下载失败 clip_id={}", i + 1, clipId, e);
                    continue; // 音频失败就跳过这首
                }
            } else {
                log.info("第{}首 音频已存在，跳过下载", i + 1);
            }

            // ========= 封面：直接使用官方原始链接，不下载 =========
            String coverImageUrl = imageLargeUrl; // 直接存官方链接
            if (coverImageUrl == null || coverImageUrl.trim().isEmpty()) {
                coverImageUrl = null; // 明确为 null，方便前端判断
                log.info("第{}首 无封面链接，使用默认占位图", i + 1);
            } else {
                log.info("第{}首 使用官方封面链接 → {}", i + 1, coverImageUrl);
            }

            // ========= 入库 =========
            try {
                songsMapper.insertCompletedSong(
                        userId,
                        taskId,
                        clipId,
                        title,
                        prompt,
                        tags != null ? tags : "",
                        task.getMvVersion(),
                        task.getMakeInstrumental() != null && task.getMakeInstrumental(),
                        audioPublicUrl,
                        null,                    // video_url 云雾暂不返回
                        duration,
                        lyrics != null ? lyrics : prompt,
                        coverImageUrl            // 直接存官方链接
                );
                log.info("第{}首 歌曲入库成功 clip_id={}", i + 1, clipId);
                successCount++;
            } catch (Exception e) {
                if (e.getCause() instanceof java.sql.SQLIntegrityConstraintViolationException) {
                    log.info("第{}首 歌曲已存在，跳过重复入库 clip_id={}", i + 1, clipId);
                } else {
                    log.error("第{}首 歌曲入库失败 clip_id={}", i + 1, clipId, e);
                }
            }
        }

        log.info("任务 {} 处理完毕，本次成功入库 {} 首", taskId, successCount);
        return successCount > 0;
    }

    private void downloadFile(String fileUrl, String savePath) throws Exception {
        if (fileUrl == null || fileUrl.trim().isEmpty()) {
            throw new IllegalArgumentException("下载链接为空");
        }
        try (InputStream in = new URL(fileUrl).openStream();
             FileOutputStream out = new FileOutputStream(savePath)) {
            byte[] buffer = new byte[8192];
            int len;
            while ((len = in.read(buffer)) != -1) {
                out.write(buffer, 0, len);
            }
        }
    }
}
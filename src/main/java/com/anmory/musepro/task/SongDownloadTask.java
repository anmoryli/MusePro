package com.anmory.musepro.task;

import com.anmory.musepro.mapper.SongsMapper;
import com.anmory.musepro.model.Songs;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.*;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Component
@EnableScheduling
public class SongDownloadTask {

    private static final Logger log = LoggerFactory.getLogger(SongDownloadTask.class);

    @Autowired private SongsMapper songsMapper;
    @Autowired private RestTemplate restTemplate;

    private static final OkHttpClient client = new OkHttpClient.Builder()
            .connectTimeout(10, TimeUnit.SECONDS)
            .readTimeout(90, TimeUnit.SECONDS)
            .build();

    private static final String LOCAL_DIR = "/usr/local/nginx/files/mo-face-swap";
    private static final String PUBLIC_BASE = "https://175.24.205.213:100/mo-face-swap";
    private static final String API_KEY = System.getenv("YUNWU_API_KEY") != null
            ? System.getenv("YUNWU_API_KEY") : "your-key-here";

    /**
     * 定时扫描未完成任务，每 8 秒执行一次
     */
    @Scheduled(fixedDelay = 8000)
    public void schedule() {
        List<Songs> list = songsMapper.listPendingTasks();
        if (list.isEmpty()) return;

        for (Songs task : list) {
            processTask(task);
        }
    }

    /**
     * service 会调这里，这里我们直接异步处理
     */
    public void processTask(Songs task) {
        asyncHandle(task);
    }

    /**
     * 异步线程执行任务
     */
    @Async("songTaskExecutor")
    public void asyncHandle(Songs task) {
        try {
            boolean done = handleAndSaveAll(task);
            if (done) {
                songsMapper.markTaskCompleted(task.getTaskId());
                log.info("task {} 已标记完成（两首均已成功下载与入库）", task.getTaskId());
            }
        } catch (Exception e) {
            log.error("任务执行异常 task_id={}", task.getTaskId(), e);
            // 保持任务为 pending，定时器会继续重试
        }
    }

    /**
     * 一次只处理一首，事务独立，避免阻塞后面的歌
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public boolean handleAndSaveAll(Songs task) throws Exception {
        String taskId = task.getTaskId();
        Integer userId = task.getUserId();

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + API_KEY);
        HttpEntity<?> entity = new HttpEntity<>(headers);

        ResponseEntity<Map> resp = restTemplate.exchange(
                "https://yunwu.ai/suno/fetch/" + taskId,
                HttpMethod.GET, entity, Map.class);

        Map<String, Object> body = resp.getBody();
        if (body == null || !"success".equals(body.get("code"))) {
            log.info("task {} 远程状态不可用，等待下次重试", taskId);
            return false;
        }

        Map<String, Object> data = (Map<String, Object>) body.get("data");

        String status = (String) data.get("status");
        if (!"SUCCESS".equalsIgnoreCase(status)) {
            log.info("task {} 当前状态={}，继续等待生成", taskId, status);
            return false;
        }

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> songList = (List<Map<String, Object>>) data.get("data");

        if (songList == null || songList.isEmpty()) {
            log.info("task {} 虽成功但歌曲为空，等待重试", taskId);
            return false;
        }

        // Suno 一次请求生成 2 首，但可能第一次只返回 1 首，必须等待两首都齐了
        if (songList.size() < 2) {
            log.info("task {} 目前仅生成 {} 首，等待全部生成后再入库", taskId, songList.size());
            return false;
        }

        log.info("task {} 成功生成两首歌曲，开始执行下载与入库", taskId);

        // 按顺序处理两首
        for (int i = 0; i < songList.size(); i++) {
            Map<String, Object> s = songList.get(i);

            String clipId = (String) s.get("clip_id");
            String title = (String) s.get("title");
            if (title == null || title.trim().isEmpty()) {
                title = task.getTitle() + " #" + (i + 1);
            }

            String audioUrl = (String) s.get("audio_url");
            String imageUrl = (String) s.get("image_url");
            String prompt = (String) s.get("prompt");
            String tags = (String) s.get("tags");
            Integer duration = s.get("duration") instanceof Number ? ((Number) s.get("duration")).intValue() : null;
            String lyrics = (String) s.get("lyrics");

            String fileName = clipId + ".mp3";
            String path = LOCAL_DIR + "/" + fileName;
            String publicUrl = PUBLIC_BASE + "/" + fileName;

            // 没下载过才下载，避免重复下载
            if (!new File(path).exists()) {
                download(audioUrl, path);
                log.info("task {} 第 {} 首下载成功 clipId={}", taskId, i + 1, clipId);
            }

            songsMapper.insertCompletedSong(
                    userId, taskId, clipId, title, prompt,
                    tags != null ? tags : "",
                    task.getMvVersion(),
                    task.getMakeInstrumental() != null && task.getMakeInstrumental(),
                    publicUrl, null, duration,
                    lyrics != null ? lyrics : prompt,
                    imageUrl
            );

            log.info("task {} 第 {} 首入库成功 clipId={}", taskId, i + 1, clipId);
        }

        return true;
    }

    /**
     * 下载文件
     */
    private void download(String url, String path) throws Exception {
        Request request = new Request.Builder().url(url).build();
        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) throw new RuntimeException("下载失败 " + url);

            try (InputStream in = response.body().byteStream();
                 FileOutputStream out = new FileOutputStream(path)) {

                byte[] buf = new byte[8192];
                int len;
                while ((len = in.read(buf)) != -1) {
                    out.write(buf, 0, len);
                }
            }
        }
    }
}

// src/main/java/com/anmory/musepro/service/SongsService.java
// 完整终极版 - 零省略 - 直接覆盖即可使用
package com.anmory.musepro.service;

import com.anmory.musepro.mapper.SongsMapper;
import com.anmory.musepro.model.Songs;
import com.anmory.musepro.task.SongDownloadTask;
import com.anmory.musepro.utils.MidiConverter;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.File;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class SongsService {

    private static final Logger log = LoggerFactory.getLogger(SongsService.class);

    @Autowired private SongsMapper songsMapper;
    @Autowired private UsersService usersService;
    @Autowired private RestTemplate restTemplate;
    @Autowired private MidiConverter midiConverter;
    @Autowired private SongDownloadTask songDownloadTask;

    @Value("${yunwu.api.key}")
    private String API_KEY;

    private static final String BASE_URL = "https://yunwu.ai";
    private static final String LOCAL_DIR = "/usr/local/nginx/files/mo-face-swap";

    // ==================== 统一扣积分 ====================
    private boolean deductCreditIfNotVip(Integer userId) {
        var user = usersService.getUserById(userId);
        if (user.getIsVip()) {
            log.info("用户 {} 为VIP，免扣积分", userId);
            return true;
        }
        boolean ok = usersService.deductCredit(userId);
        log.info("用户 {} 扣积分结果: {}", userId, ok ? "成功" : "失败");
        return ok;
    }

    // ==================== 统一提交到云雾并获取真实 taskId ====================
    private String submitToYunwuAndGetTaskId(Map<String, Object> body) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + API_KEY);

        try {
            ResponseEntity<Map> resp = restTemplate.postForEntity(
                    BASE_URL + "/suno/submit/music",
                    new HttpEntity<>(body, headers),
                    Map.class
            );

            Map<String, Object> result = resp.getBody();
            log.info("云雾提交返回: {}", result);

            if ("success".equals(result.get("code"))) {
                String realTaskId = (String) result.get("data");
                log.info("提交成功，获得真实 taskId = {}", realTaskId);
                return realTaskId;
            }
        } catch (Exception e) {
            log.error("调用云雾提交接口异常", e);
        }
        return null;
    }

    // 1. 灵感模式
    public Map<String, Object> inspiration(Integer userId, String title, String prompt,
                                           String mv, Boolean instrumental) throws Exception {
        if (!deductCreditIfNotVip(userId)) {
            return Map.of("code", 402, "msg", "积分不足");
        }

        Map<String, Object> body = new HashMap<>();
        body.put("gpt_description_prompt", prompt);
        body.put("mv", mv != null ? mv : "chirp-v4");
        body.put("make_instrumental", instrumental != null && instrumental);

        String taskId = submitToYunwuAndGetTaskId(body);
        if (taskId == null) {
            return Map.of("code", 500, "msg", "提交失败");
        }

        songsMapper.insertTask(
                userId, taskId, title, prompt, null, null,
                mv != null ? mv : "chirp-v4", instrumental, null, null
        );
        Songs task = songsMapper.getLastSong();
        songDownloadTask.processTask(task);

        return Map.of("code", 200, "msg", "提交成功", "taskId", taskId);
    }

    // 2. 自定义模式
    public Map<String, Object> custom(Integer userId, String title, String prompt,
                                      String tags, String mv, Boolean instrumental) throws Exception {
        if (!deductCreditIfNotVip(userId)) {
            return Map.of("code", 402, "msg", "积分不足");
        }

        Map<String, Object> body = new HashMap<>();
        body.put("prompt", prompt);
        body.put("title", title);
        if (tags != null) body.put("tags", tags);
        body.put("mv", mv != null ? mv : "chirp-v4");
        body.put("make_instrumental", instrumental != null && instrumental);

        String taskId = submitToYunwuAndGetTaskId(body);
        if (taskId == null) {
            return Map.of("code", 500, "msg", "提交失败");
        }

        songsMapper.insertTask(
                userId, taskId, title, null, prompt, tags,
                mv != null ? mv : "chirp-v4", instrumental, null, null
        );
        Songs task = songsMapper.getLastSong();
        songDownloadTask.processTask(task);

        return Map.of("code", 200, "msg", "提交成功", "taskId", taskId);
    }

    // 3. 续写模式
    public Map<String, Object> extend(Integer userId, String continueClipId,
                                      BigDecimal continueAt, String mv, String taskId) throws Exception {
        if (!deductCreditIfNotVip(userId)) {
            return Map.of("code", 402, "msg", "积分不足");
        }

        Map<String, Object> body = new HashMap<>();
        body.put("continue_clip_id", continueClipId);
        body.put("continue_at", continueAt);
        body.put("task_id", taskId);
        body.put("mv", mv != null ? mv : "chirp-v4");
        body.put("make_instrumental", false);

        if (taskId == null) {
            return Map.of("code", 500, "msg", "taskId不能为空");
        }

        songsMapper.insertTask(
                userId, taskId, "续写歌曲", null, null, null,
                mv != null ? mv : "chirp-v4", false, continueClipId, continueAt
        );
        Songs task = songsMapper.getLastSong();
        songDownloadTask.processTask(task);

        return Map.of("code", 200, "msg", "提交成功", "taskId", taskId);
    }

    // 4. 歌手风格模式
    public Map<String, Object> artistStyle(Integer userId, String title, String prompt,
                                           String personaId, String artistClipId, String mv) throws Exception {
        if (!deductCreditIfNotVip(userId)) {
            return Map.of("code", 402, "msg", "积分不足");
        }

        Map<String, Object> body = new HashMap<>();
        body.put("task", "artist_consistency");
        body.put("persona_id", personaId);
        body.put("artist_clip_id", artistClipId);
        body.put("prompt", prompt);
        body.put("title", title);
        body.put("mv", mv != null ? mv : "chirp-v4-tau");
        body.put("make_instrumental", false);

        String taskId = submitToYunwuAndGetTaskId(body);
        if (taskId == null) {
            return Map.of("code", 500, "msg", "提交失败");
        }

        songsMapper.insertTask(
                userId, taskId, title, null, prompt, null,
                mv != null ? mv : "chirp-v4-tau", false, null, null
        );
        Songs task = songsMapper.getLastSong();
        songDownloadTask.processTask(task);

        return Map.of("code", 200, "msg", "提交成功", "taskId", taskId);
    }

    // 5. 生成歌词
    public Map<String, Object> generateLyrics(String prompt) {
        log.info("正在生成歌词...");
        Map<String, Object> body = Map.of("prompt", prompt);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + API_KEY);
        try {
            ResponseEntity<Map> resp = restTemplate.postForEntity(
                    BASE_URL + "/suno/submit/lyrics",
                    new HttpEntity<>(body, headers), Map.class);
            log.info("生成歌词结果: {}", resp);
            return resp.getBody() != null ? resp.getBody() : Map.of("code", 500);
        } catch (Exception e) {
            return Map.of("code", 500, "msg", e.getMessage());
        }
    }

    // 6. 查询我的歌曲（只返回真实完成的歌曲）
    public List<Songs> getMySongs(Integer userId) {
        return songsMapper.getMySongs(userId);
    }

    // 7. 根据 taskId 查询该任务下的所有歌曲（前端轮询用）
    public Map<String, Object> getTaskResult(String taskId) {
        List<Songs> songs = songsMapper.getSongsByTaskId(taskId);
        boolean finished = !songs.isEmpty();
        return Map.of(
                "code", 200,
                "finished", finished,
                "data", songs
        );
    }

    // ==================== 以下是新增完整功能 ====================

    // 删除歌曲（含本地文件）
    public Map<String, Object> deleteSong(Integer userId, String clipId) {
        Songs song = songsMapper.getByClipId(clipId);
        if (song == null || !song.getUserId().equals(userId)) {
            return Map.of("code", 403, "msg", "无权限或歌曲不存在");
        }

        deleteFileIfExists(song.getAudioUrl());
        deleteFileIfExists(song.getCoverImage());
        deleteFileIfExists(song.getMidiUrl());

        songsMapper.deleteByClipId(clipId);
        log.info("用户 {} 已删除歌曲 clip_id={}", userId, clipId);
        return Map.of("code", 200, "msg", "删除成功");
    }

    // 切换公开/私密
    public Map<String, Object> togglePublic(Integer userId, String clipId) {
        Songs song = songsMapper.getByClipId(clipId);
        if (song == null || !song.getUserId().equals(userId)) {
            return Map.of("code", 403, "msg", "无权限");
        }
        int newStatus = song.getIsPublic() == 1 ? 0 : 1;
        songsMapper.updatePublicStatus(clipId, newStatus);
        return Map.of("code", 200, "data", Map.of("isPublic", newStatus));
    }

    // 播放量+1
    public void incrementPlayCount(String clipId) {
        songsMapper.incrementPlayCount(clipId);
    }

    // 点赞+1
    public void incrementLikeCount(String clipId) {
        songsMapper.incrementLikeCount(clipId);
    }

    // 一键转MIDI（异步）
    public Map<String, Object> convertToMidi(Integer userId, String clipId) {
        Songs song = songsMapper.getByClipId(clipId);
        log.info("用户 {} 请求一键转MIDI: clip_id={}", userId, clipId);
        log.info("歌曲信息: {}", song);
        if (song == null || !song.getUserId().equals(userId) || song.getAudioUrl() == null) {
            return Map.of("code", 400, "msg", "歌曲无效或无音频");
        }
        if (song.getMidiUrl() != null) {
            return Map.of("code", 200, "msg", "已存在MIDI", "midiUrl", song.getMidiUrl());
        }

        new Thread(() -> {
            String midiUrl = midiConverter.convertToMidi(song.getAudioUrl());
            log.info("clip_id={} MIDI转换开始: {}", clipId, midiUrl);
            if (midiUrl != null) {
                songsMapper.updateMidiUrl(clipId, midiUrl);
                log.info("clip_id={} MIDI转换完成: {}", clipId, midiUrl);
            } else {
                log.error("clip_id={} MIDI转换失败", clipId);
            }
        }).start();

        return Map.of("code", 200, "msg", "MIDI转换已启动，稍后刷新可见");
    }

    // 删除本地文件工具方法
    private void deleteFileIfExists(String url) {
        if (url == null) return;
        try {
            String fileName = url.substring(url.lastIndexOf("/") + 1);
            File file = new File(LOCAL_DIR + "/" + fileName);
            if (file.exists()) {
                file.delete();
                log.info("已删除本地文件: {}", file.getAbsolutePath());
            }
        } catch (Exception e) {
            log.warn("删除文件失败: {}", url);
        }
    }

    public List<Songs> getAllSongs() {
        List<Songs> songs = songsMapper.getAllPublicSongs();

        return songsMapper.getAllPublicSongs();
    }
}
// src/main/java/com/anmory/musepro/controller/SongsController.java
package com.anmory.musepro.controller;

import com.anmory.musepro.service.SongsService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/songs")
@CrossOrigin(origins = "*")
@Slf4j
public class SongsController {
    @Value("${yunwu.api.key}")
    private String API_KEY;

    @Autowired private RestTemplate restTemplate;
    @Autowired private SongsService songsService;

    @RequestMapping("/all")
    public Map<String, Object> all() {
        return Map.of("code", 200, "data", songsService.getAllSongs());
    }

    @PostMapping("/inspiration")
    public Map<String, Object> inspiration(@RequestParam Integer userId,
                                           @RequestParam String title,
                                           @RequestParam String prompt,
                                           @RequestParam(required = false) String mv,
                                           @RequestParam(required = false) Boolean instrumental) throws Exception {
        return songsService.inspiration(userId, title, prompt, mv, instrumental);
    }

    @PostMapping("/custom")
    public Map<String, Object> custom(@RequestParam Integer userId,
                                      @RequestParam String title,
                                      @RequestParam String prompt,
                                      @RequestParam(required = false) String tags,
                                      @RequestParam(required = false) String mv,
                                      @RequestParam(required = false) Boolean instrumental) throws Exception {
        return songsService.custom(userId, title, prompt, tags, mv, instrumental);
    }

    @PostMapping("/extend")
    public Map<String, Object> extend(@RequestParam Integer userId,
                                      @RequestParam String continueClipId,
                                      @RequestParam BigDecimal continueAt,
                                      @RequestParam(required = false) String mv,
                                      @RequestParam String taskId) throws Exception {
        return songsService.extend(userId, continueClipId, continueAt, mv,taskId);
    }

    @PostMapping("/artist")
    public Map<String, Object> artist(@RequestParam Integer userId,
                                      @RequestParam String title,
                                      @RequestParam String prompt,
                                      @RequestParam String personaId,
                                      @RequestParam String artistClipId,
                                      @RequestParam(required = false) String mv) throws Exception {
        return songsService.artistStyle(userId, title, prompt, personaId, artistClipId, mv);
    }

    @PostMapping("/lyrics")
    public Map<String, Object> lyrics(@RequestParam String prompt) {
        if (prompt == null || prompt.trim().isEmpty()) {
            return Map.of("code", 400, "msg", "提示词不能为空");
        }

        final String SUBMIT_URL = "https://yunwu.ai/suno/submit/lyrics";
        final String FETCH_URL  = "https://yunwu.ai/suno/fetch/";

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + API_KEY);
        headers.set("Content-Type", "application/json");
        headers.set("Accept", "application/json");

        try {
            // Step 1: 提交任务
            Map<String, String> body = Map.of("prompt", prompt.trim());
            HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);

            ResponseEntity<Map> submitResp = restTemplate.postForEntity(SUBMIT_URL, request, Map.class);
            Map<String, Object> submitResult = submitResp.getBody();

            if (submitResult == null || !"success".equals(submitResult.get("code"))) {
                String msg = submitResult != null ? (String) submitResult.get("message") : "未知错误";
                return Map.of("code", 500, "msg", "提交失败：" + msg);
            }

            // 关键修复：云雾这里 data 字段是个纯字符串！不是对象！
            Object dataObj = submitResult.get("data");
            String taskId;
            if (dataObj instanceof String) {
                taskId = (String) dataObj;
            } else if (dataObj instanceof Map) {
                taskId = (String) ((Map<?, ?>) dataObj).get("task_id");
            } else {
                return Map.of("code", 500, "msg", "task_id 解析失败");
            }

            log.info("歌词任务提交成功 → {}", taskId);

            // Step 2: 轮询，最多等 5 分钟
            for (int i = 0; i < 100; i++) {
                Thread.sleep(3000);

                ResponseEntity<Map> fetchResp = restTemplate.exchange(
                        FETCH_URL + taskId,
                        HttpMethod.GET,
                        new HttpEntity<>(headers),
                        Map.class
                );

                Map<String, Object> result = fetchResp.getBody();
                if (result == null || result.get("data") == null) continue;

                Map<String, Object> data = (Map<String, Object>) result.get("data");
                String status = (String) data.get("status");

                if ("SUCCESS".equalsIgnoreCase(status)) {
                    Map<String, Object> real = (Map<String, Object>) data.get("data");
                    if (real != null) {
                        String lyrics = (String) real.get("text");
                        String title = (String) real.get("title");

                        return Map.of(
                                "code", 200,
                                "lyrics", lyrics != null ? lyrics.trim() : "",
                                "title", title != null ? title.trim() : "未命名歌曲"
                        );
                    }
                }

                if ("FAIL".equalsIgnoreCase(status)) {
                    return Map.of("code", 500, "msg", "生成失败：" + data.get("fail_reason"));
                }
            }

            return Map.of("code", 500, "msg", "生成超时（5分钟），请简化提示词");

        } catch (Exception e) {
            log.error("歌词生成彻底炸了", e);
            return Map.of("code", 500, "msg", "服务器异常：" + e.getMessage());
        }
    }

    // 新增：前端轮询这个接口
    @GetMapping("/task")
    public Map<String, Object> task(@RequestParam String taskId) {
        return songsService.getTaskResult(taskId);
    }

    @GetMapping("/my")
    public Map<String, Object> my(@RequestParam Integer userId) {
        return Map.of("code", 200, "data", songsService.getMySongs(userId));
    }
}
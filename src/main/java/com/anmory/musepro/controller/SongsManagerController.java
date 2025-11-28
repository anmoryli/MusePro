// src/main/java/com/anmory/musepro/controller/SongsManageController.java
package com.anmory.musepro.controller;

import com.anmory.musepro.service.SongsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/songs/manage")
@CrossOrigin(origins = "*")
public class SongsManagerController {

    @Autowired private SongsService songsService;

    // 删除歌曲（同时删除本地文件）
    @PostMapping("/delete")
    public Map<String, Object> delete(@RequestParam Integer userId, @RequestParam String clipId) {
        return songsService.deleteSong(userId, clipId);
    }

    // 切换公开/私密
    @PostMapping("/togglePublic")
    public Map<String, Object> togglePublic(@RequestParam Integer userId, @RequestParam String clipId) {
        return songsService.togglePublic(userId, clipId);
    }

    // 播放量+1（前端每次播放调用）
    @PostMapping("/play")
    public Map<String, Object> play(@RequestParam String clipId) {
        songsService.incrementPlayCount(clipId);
        return Map.of("code", 200, "msg", "播放统计成功");
    }

    // 点赞（可重复点，前端做防刷）
    @PostMapping("/like")
    public Map<String, Object> like(@RequestParam String clipId) {
        songsService.incrementLikeCount(clipId);
        return Map.of("code", 200, "msg", "谢谢点赞~");
    }

    // 一键转MIDI（你最关心的这个！）
    @PostMapping("/convertMidi")
    public Map<String, Object> convertMidi(@RequestParam Integer userId, @RequestParam String clipId) {
        return songsService.convertToMidi(userId, clipId);
    }
}
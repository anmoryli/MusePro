// src/main/java/com/anmory/musepro/model/Songs.java
package com.anmory.musepro.model;

import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;

@Data
public class Songs {
    private Integer songId;
    private Integer userId;

    // 云雾任务字段
    private String taskId;
    private String clipId;

    // 用户输入
    private String title;
    private String customPrompt;           // 自定义歌词
    private String tags;
    private String mvVersion;
    private Boolean makeInstrumental;
    private String continueClipId;
    private BigDecimal continueAt;
    private String gptDescriptionPrompt;   // 灵感模式提示词
    private String notifyHook;

    // 生成结果
    private String status;                 // pending/generating/completed/failed
    private String audioUrl;
    private String videoUrl;
    private Integer duration;
    private String lyrics;
    private String coverImage;

    // 增强字段
    private String midiUrl;
    private String stems;
    private String safePrompt;
    private String mergedAudioUrl;

    // 权限统计
    private Integer isPublic;
    private Integer playCount;
    private Integer likeCount;

    private Date createdAt;
    private Date finishedAt;
}
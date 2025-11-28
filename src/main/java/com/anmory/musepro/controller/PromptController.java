package com.anmory.musepro.controller;

import com.anmory.musepro.service.AiPromptService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.Map;

/**
 * @author Anmory
 * @description 用于调用大模型去获取歌手的相关信息，避免出现歌手的直接的名字和歌名
 * @date 2025-11-27 下午7:29
 */

@RestController
@RequestMapping("/api")
public class PromptController {
    @Autowired
    private AiPromptService aiPromptService;
    @RequestMapping("/prompt")
    public String prompt(String prompt) throws IOException {
        Map<String, String> requestMap = Map.of("userInput", prompt);
        return aiPromptService.chat(requestMap);
    }
}

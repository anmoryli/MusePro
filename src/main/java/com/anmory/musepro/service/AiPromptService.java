package com.anmory.musepro.service;

import com.anmory.musepro.model.Users;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;

/**
 * @author Anmory
 * @description TODO
 * @date 2025-11-27 下午7:15
 */

@Service
public class AiPromptService {
    private static final String BASE_URL = "https://api.deepseek.com/v1/chat/completions";
    private static final String API_KEY = "sk-792025c6193c4f53afdcfddbaa1041e5";

    @Autowired
    RagService ragService;;
    @RequestMapping("/ds_chat")
    public String chat(@RequestBody Map<String, String> requestMap) throws IOException {
        String userInput = requestMap.get("userInput");
//        String relevant = ragService.getRelevant(userInput);
        String systemPrompt = String.format("""
                    <角色>
                    你是一名资深的音乐制作人，擅长为AI音乐生成器编写精准且富有创意的提示词。
                    
                    </角色>
                    
                    <任务目标>
                    根据“用户原始指令”，生成一个高质量、无版权风险的音乐生成提示词。
                    
                    </任务目标>
                    
                    <输入数据>
                    - 用户原始指令: "%s"
                    
                    </输入数据>
                    
                    <核心约束>
                    1. **版权规避**: 严禁直接提及任何歌手、乐队、歌曲或专辑的具体名称。
                    2. **创造性转化**: 你必须分析和吸收推荐风格的音乐元素（如：嗓音特点、演唱技巧、标志性乐器、节奏型、和声进行、制作风格、整体情绪等），并将其转化为描述性的语言。
                    3. **无缝融合**: 将分析出的风格特质与用户指令所表达的主题、情绪和场景无缝地融合成一个连贯的整体。
                    4. **语言一致**: 最终输出的提示词语言必须与用户输入的语言完全相同。
                    5. **补充信息**: 当用户的信息不够时，你需要自己去搜索相关的信息来补充。
                    6. **限制**: 生成的提示词的字数严禁超过80词，否则会被限制，根本就发不过去，必须严格限制
                    
                    </核心约束>
                    
                    <输出指令>
                    只输出最终生成的、可直接使用的音乐提示词文本，无需任何其他内容。
                    
                    </输出指令>
                    """, userInput);

        Instant start = Instant.now();
        System.out.println(userInput);
        // 创建请求体
        var requestBody = new JsonObject();
        requestBody.addProperty("model", "deepseek-chat");
        requestBody.addProperty("stream", false);

        // 添加消息
        JsonObject systemMessage = new JsonObject();
        systemMessage.addProperty("role", "system");
        systemMessage.addProperty("content", systemPrompt);

        JsonObject userMessage = new JsonObject();
        userMessage.addProperty("role", "user");
        userMessage.addProperty("content", userInput);

        JsonArray messages = new JsonArray();
        messages.add(systemMessage);
        messages.add(userMessage);
        requestBody.add("messages", messages);

        // 记录请求体
        System.out.println("Request Body" + requestBody);

        // 发送HTTP POST请求
        URL url = new URL(BASE_URL);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Authorization", "Bearer " + API_KEY);
        conn.setRequestProperty("Content-Type", "application/json"); // 修正 Content-Type
        conn.setDoOutput(true);

        // 记录请求头
        System.out.println("Request Headers:" + conn.getRequestProperties());
        try (OutputStream os = conn.getOutputStream()) {
            byte[] input = requestBody.toString().getBytes("utf-8");
            os.write(input, 0, input.length);
        }

        String reply = "";
        int responseCode = conn.getResponseCode();
        System.out.println("Response Code: " + responseCode);
        if (responseCode == HttpURLConnection.HTTP_OK) { // success
            BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream(), "utf-8"));
            String inputLine;
            StringBuilder response = new StringBuilder();

            while ((inputLine = in.readLine()) != null) {
                response.append(inputLine);
            }
            in.close();

            // 记录响应内容
            System.out.println("Response Body: " + response.toString());

            // 解析并打印响应内容
            Gson gson = new Gson();
            JsonObject jsonResponse = gson.fromJson(response.toString(), JsonObject.class);
            String replyContent = jsonResponse.getAsJsonArray("choices")
                    .get(0).getAsJsonObject()
                    .get("message").getAsJsonObject()
                    .get("content").getAsString();
            return replyContent;

        } else {
            // 记录错误响应内容
            BufferedReader errorReader = new BufferedReader(new InputStreamReader(conn.getErrorStream(), "utf-8"));
            String errorLine;
            StringBuilder errorResponse = new StringBuilder();
            while ((errorLine = errorReader.readLine()) != null) {
                errorResponse.append(errorLine);
            }
            errorReader.close();
        }
        Instant end = Instant.now();
        return "访问出错";
    }
}

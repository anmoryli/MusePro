package com.anmory.musepro.service;

import com.google.gson.*;
import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
public class RagService {

    private static final String BASE_URL = "http://127.0.0.1:8004";
    private static final OkHttpClient CLIENT = new OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(120, TimeUnit.SECONDS)
            .build();

    // 使用 Gson + JsonParser 更强的容错能力
    private static final Gson GSON = new Gson();
    private static final JsonParser JSON_PARSER = new JsonParser();

    /**
     * 获取最相关的原文（前3条已去噪、去页眉，拼接成一个字符串返回）
     * 完全免疫 source 为 null、任意字段为 null 的情况
     */
    public String getRelevant(String question) throws IOException {
        String url = BASE_URL + "/api/v1/query?question=" +
                URLEncoder.encode(question, StandardCharsets.UTF_8) + "&top_k=3";

        Request request = new Request.Builder().url(url).get().build();

        try (Response response = CLIENT.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                log.warn("RAG 接口调用失败，状态码: {}", response.code());
                return "抱歉，政策检索服务暂时不可用（HTTP " + response.code() + "）。";
            }

            String body = response.body().string();
            log.info("RAG 完整响应体: {}", body);   // 关键日志！出现问题直接看这行

            // ---------- 安全解析 JSON（彻底防炸） ----------
            JsonObject root;
            try {
                JsonElement parsed = JSON_PARSER.parse(body);
                if (!parsed.isJsonObject()) {
                    log.warn("RAG 返回体不是 JSON 对象");
                    return "政策检索服务异常（返回格式错误）";
                }
                root = parsed.getAsJsonObject();
            } catch (Exception e) {
                log.error("RAG 返回体无法解析为 JSON", e);
                return "政策检索服务异常（JSON 解析失败）";
            }

            if (!root.has("code") || root.get("code").getAsInt() != 200) {
                log.warn("RAG 返回 code 非 200");
                return "政策检索服务异常";
            }

            JsonObject data = root.getAsJsonObject("data");
            if (data == null || !data.has("hits")) {
                log.warn("RAG 返回缺少 data.hits 字段");
                return "未找到相关政策内容（接口结构异常）";
            }

            // ---------- 安全提取 hits 数组（关键防护） ----------
            JsonArray hits = new JsonArray();
            try {
                JsonElement hitsElement = data.get("hits");
                if (hitsElement != null && hitsElement.isJsonArray()) {
                    hits = hitsElement.getAsJsonArray();
                }
            } catch (Exception e) {
                log.error("解析 hits 数组失败，可能是字段为 null 导致", e);
            }

            if (hits.size() == 0) {
                log.info("RAG 检索命中 0 条，问题：{}", question);
                return "根据您的提问，暂未找到直接匹配的政策内容。";
            }

            // ---------- 正常处理命中结果 ----------
            List<String> contexts = new ArrayList<>();
            int rank = 1;
            for (JsonElement elem : hits) {
                if (!elem.isJsonObject()) continue;

                JsonObject hit = elem.getAsJsonObject();

                // 安全取 context
                String context = "（空内容）";
                if (hit.has("context") && !hit.get("context").isJsonNull()) {
                    context = hit.get("context").getAsString().trim();
                }

                // 安全取相似度
                double score = 0.0;
                if (hit.has("similarity_score") && !hit.get("similarity_score").isJsonNull()) {
                    score = hit.get("similarity_score").getAsDouble();
                }

                contexts.add("【相关政策片段 " + rank + "，相似度：" + String.format("%.4f", score) + "】\n" + context);
                log.info("RAG 命中第{}条，相似度: {:.4f}，长度: {}", rank, score, context.length());
                rank++;
            }

            // 用分隔线拼接，返回一个字符串
            return String.join("\n\n========================================\n\n", contexts);

        } catch (Exception e) {
            log.error("RAG 调用出现未知异常", e);
            return "政策检索出现异常，请稍后重试。";
        }
    }

    /** 触发向量库重建（保持不变） */
    public boolean triggerBuild() {
        String url = BASE_URL + "/api/v1/policy/upload";
        Request request = new Request.Builder()
                .url(url)
                .post(RequestBody.create(null, new byte[0]))
                .build();

        try (Response response = CLIENT.newCall(request).execute()) {
            boolean ok = response.isSuccessful();
            log.info("向量库构建请求结果: {}", ok ? "成功" : "失败");
            return ok;
        } catch (Exception e) {
            log.error("向量库构建失败", e);
            return false;
        }
    }
}
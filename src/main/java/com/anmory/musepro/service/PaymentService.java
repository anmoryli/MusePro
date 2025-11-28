// src/main/java/com/anmory/musepro/service/PaymentService.java
package com.anmory.musepro.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.HashMap;
import java.util.Map;

@Service
public class PaymentService {

    private static final String CREEM_API_KEY = "creem_test_6vX0QQ2G8HzKoIbuj4A6KW";
    private static final String CREEM_BASE_URL = "https://test-api.creem.io";

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper mapper = new ObjectMapper();

    private static final Map<String, String> PRODUCT_MAP = new HashMap<>();
    static {
        PRODUCT_MAP.put("monthly", "prod_2RMibVV6nMcDinlwkLy5mN");
        PRODUCT_MAP.put("yearly",  "prod_2iYv73K3sTEhSeD7VVGqXZ");
    }

    public String createCreemCheckout(Integer userId, String plan) throws Exception {
        String productId = PRODUCT_MAP.get(plan);
        if (productId == null) {
            throw new RuntimeException("无效套餐");
        }

        String requestId = "museflow_" + System.currentTimeMillis() + "_" + userId;

        // 极简请求体，只传这两个字段，别的什么都不传！
        Map<String, String> payload = new HashMap<>();
        payload.put("request_id", requestId);
        payload.put("product_id", productId);

        String json = mapper.writeValueAsString(payload);
        System.out.println("【发送Creem】" + json);

        HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(CREEM_BASE_URL + "/v1/checkouts"))
                .header("Content-Type", "application/json")
                .header("x-api-key", CREEM_API_KEY)
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();

        HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());

        System.out.println("【Creem返回】HTTP " + response.statusCode());
        System.out.println(response.body());

        if (response.statusCode() != 200) {
            return null;
        }

        JsonNode root = mapper.readTree(response.body());
        return root.path("checkout_url").asText("");
    }
}
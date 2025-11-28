// src/main/java/com/anmory/musepro/controller/PaymentController.java
package com.anmory.musepro.controller;

import com.anmory.musepro.mapper.UsersMapper;
import com.anmory.musepro.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;
    @Autowired
    private UsersMapper usersMapper;

    @PostMapping("/create-checkout")
    public Map<String, Object> createCheckout(@RequestBody Map<String, Object> body) {
        Map<String, Object> result = new HashMap<>();

        try {
            Integer userId = Integer.parseInt(body.get("userId").toString());
            String plan = (String) body.get("plan");
            if(plan.equals("monthly")) {
                usersMapper.activeMonthlyVip(userId);
                usersMapper.addCredits(userId, 200);
            }
            if(plan.equals("yearly")) {
                usersMapper.activeYearlyVip(userId);
                usersMapper.addCredits(userId, 10000);
            }

            String url = paymentService.createCreemCheckout(userId, plan);

            if (url != null && !url.isEmpty()) {
                result.put("success", true);
                result.put("checkout_url", url);
            } else {
                result.put("success", false);
                result.put("message", "Creem返回失败，看日志");
            }
        } catch (Exception e) {
            e.printStackTrace();
            result.put("success", false);
            result.put("message", e.getMessage());
        }
        return result;
    }
}
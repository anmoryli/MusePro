// ==================== 3. UsersController.java ====================
package com.anmory.musepro.controller;

import com.anmory.musepro.mapper.UsersMapper;
import com.anmory.musepro.model.Users;
import com.anmory.musepro.service.UsersService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
@Slf4j
public class UsersController {

    @Autowired
    private UsersService usersService;
    @Autowired
    private UsersMapper usersMapper;

    // 注册
    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody Map<String, String> body) {
        Map<String, Object> r = new HashMap<>();
        String email = body.get("email");
        String password = body.get("password");
        String nickname = body.get("nickname");

        if (email == null || password == null) {
            r.put("code", 400); r.put("msg", "参数错误"); return r;
        }

        Users user = usersService.register(email, password, nickname);
        Users finalUser = usersMapper.getLastUser();
        log.info("用户注册成功：" + finalUser);
        r.put("code", 200);
        r.put("msg", "注册成功");
        r.put("data", Map.of("userId", finalUser.getUserId(), "credits", finalUser.getCredits()));
        return r;
    }

    // 登录
    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> body) {
        Map<String, Object> r = new HashMap<>();
        Users user = usersService.login(body.get("email"), body.get("password"));
        if (user == null) {
            r.put("code", 401); r.put("msg", "邮箱或密码错误"); return r;
        }
        r.put("code", 200);
        r.put("msg", "登录成功");
        r.put("data", Map.of(
                "userId", user.getUserId(),
                "nickname", user.getNickname(),
                "avatar", user.getAvatar(),
                "credits", user.getCredits(),
                "isVip", user.getIsVip()
        ));
        log.info("用户登录成功：" + user);
        return r;
    }

    // 获取个人信息
    @GetMapping("/{userId}")
    public Map<String, Object> getInfo(@PathVariable Integer userId) {
        Map<String, Object> r = new HashMap<>();
        Users user = usersService.getUserById(userId);
        if (user == null) {
            r.put("code", 404); r.put("msg", "用户不存在"); return r;
        }
        r.put("code", 200);
        r.put("data", user);
        return r;
    }

    // 扣积分（生成歌曲时调用）
    @PostMapping("/{userId}/deduct")
    public Map<String, Object> deduct(@PathVariable Integer userId) {
        Map<String, Object> r = new HashMap<>();
        Users user = usersService.getUserById(userId);
        if (user.getIsVip() || usersService.deductCredit(userId)) {
            r.put("code", 200);
            r.put("msg", "可以生成歌曲");
            r.put("data", Map.of("remaining", user.getIsVip() ? -1 : user.getCredits() - 1));
        } else {
            r.put("code", 402);
            r.put("msg", "积分不足");
        }
        return r;
    }

    // 更新昵称
    @PutMapping("/{userId}/nickname")
    public Map<String, Object> updateNickname(@PathVariable Integer userId, @RequestBody Map<String, String> body) {
        Map<String, Object> r = new HashMap<>();
        boolean ok = usersService.updateNickname(userId, body.get("nickname"));
        r.put("code", ok ? 200 : 500);
        r.put("msg", ok ? "更新成功" : "更新失败");
        return r;
    }

    // 开通月度vip
    @PostMapping("/{userId}/monthly-vip")
    public Map<String, Object> activeMonthlyVip(@PathVariable Integer userId) {
        Map<String, Object> r = new HashMap<>();
        boolean ok = usersService.activeMonthlyVip(userId);
        r.put("code", ok ? 200 : 500);
        r.put("msg", ok ? "开通成功" : "开通失败");
        return r;
    }

    // 开通年度vip
    @PostMapping("/{userId}/yearly-vip")
    public Map<String, Object> activeYearlyVip(@PathVariable Integer userId) {
        Map<String, Object> r = new HashMap<>();
        boolean ok = usersService.activeYearlyVip(userId);
        r.put("code", ok ? 200 : 500);
        r.put("msg", ok ? "开通成功" : "开通失败");
        return r;
    }

    // 更新头像
    @PutMapping("/{userId}/avatar")
    public Map<String, Object> updateAvatar(@PathVariable Integer userId, @RequestBody Map<String, String> body) {
        Map<String, Object> r = new HashMap<>();
        boolean ok = usersService.updateAvatar(userId, body.get("avatar"));
        r.put("code", ok ? 200 : 500);
        r.put("msg", ok ? "更新成功" : "更新失败");
        return r;
    }

    @RequestMapping("/getNicknameById")
    public String getNicknameById(Integer userId) {
        Users user = usersService.getUserById(userId);
        return user.getNickname();
    }
}
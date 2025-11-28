// ==================== 2. UsersService.java ====================
package com.anmory.musepro.service;

import com.anmory.musepro.mapper.UsersMapper;
import com.anmory.musepro.model.Users;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
public class UsersService {

    @Autowired
    private UsersMapper usersMapper;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    // 注册
    public Users register(String email, String password, String nickname) {
        Users user = new Users();
        user.setEmail(email);
        user.setPasswordHash(encoder.encode(password));
        user.setNickname(nickname);
        user.setCredits(30);
        user.setAvatar("https://api.dicebear.com/7.x/avataaars/svg?seed=" + email);
        user.setIsVip(false);
        usersMapper.insertUser(user.getEmail(), user.getPasswordHash(), nickname, user.getCredits(), user.getAvatar());
        log.info("用户注册成功(Service)：" + user);
        return user; // 插入后 userId 自动回填
    }

    // 登录校验
    public Users login(String email, String password) {
        Users user = usersMapper.getUserByEmail(email);
        if (user != null && encoder.matches(password, user.getPasswordHash())) {
            return user;
        }
        return null;
    }

    // 扣1积分
    public boolean deductCredit(Integer userId) {
        return usersMapper.deductOneCredit(userId) > 0;
    }

    // 加积分
    public boolean addCredits(Integer userId, Integer amount) {
        return usersMapper.addCredits(userId, amount) > 0;
    }

    // 开通月VIP
    public boolean activeMonthlyVip(Integer userId) {
        return usersMapper.activeMonthlyVip(userId) > 0;
    }

    // 开通年VIP
    public boolean activeYearlyVip(Integer userId) {
        return usersMapper.activeYearlyVip(userId) > 0;
    }

    // 开通终身VIP
    public boolean activeLifetimeVip(Integer userId) {
        return usersMapper.activeLifetimeVip(userId) > 0;
    }

    // 更新昵称
    public boolean updateNickname(Integer userId, String nickname) {
        return usersMapper.updateNickname(userId, nickname) > 0;
    }

    // 更新头像
    public boolean updateAvatar(Integer userId, String avatar) {
        return usersMapper.updateAvatar(userId, avatar) > 0;
    }

    public Users getUserById(Integer userId) {
        return usersMapper.getUserById(userId);
    }

    public int deleteUser(Integer userId) {
        return usersMapper.deleteUser(userId);
    }

    public List<Users> getAllUsers() {
        return usersMapper.getAllUsers();
    }
}
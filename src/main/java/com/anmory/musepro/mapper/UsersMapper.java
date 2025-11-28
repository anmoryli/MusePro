// ==================== 1. UsersMapper.java ====================
package com.anmory.musepro.mapper;

import com.anmory.musepro.model.Users;
import org.apache.ibatis.annotations.*;

import java.util.Date;
import java.util.List;

@Mapper
public interface UsersMapper {

    // 根据ID查用户
    @Select("SELECT * FROM users WHERE user_id = #{userId}")
    Users getUserById(Integer userId);

    // 根据邮箱查用户（登录用）
    @Select("SELECT * FROM users WHERE email = #{email}")
    Users getUserByEmail(String email);

    // 注册插入（返回自增ID会回填到user对象）
    @Insert("INSERT INTO users (email, password_hash, nickname, credits, avatar) " +
            "VALUES (#{email}, #{passwordHash}, #{nickname}, #{credits}, #{avatar})")
    void insertUser(String email, String passwordHash, String nickname, Integer credits, String avatar);

    // 获取最新用户（用于测试用）
    @Select("SELECT * FROM users ORDER BY user_id DESC LIMIT 1")
    Users getLastUser();

    // 扣除积分（每次生成歌曲扣1）
    @Update("UPDATE users SET credits = credits - 1, updated_at = NOW() " +
            "WHERE user_id = #{userId} AND credits > 0")
    int deductOneCredit(Integer userId);

    // 增加积分（充值积分包用）
    @Update("UPDATE users SET credits = credits + #{amount}, updated_at = NOW() WHERE user_id = #{userId}")
    int addCredits(Integer userId, Integer amount);

    // 开通月度VIP（30天后过期）
    @Update("UPDATE users SET is_vip = 1, vip_expires_at = DATE_ADD(NOW(), INTERVAL 30 DAY), updated_at = NOW() " +
            "WHERE user_id = #{userId}")
    int activeMonthlyVip(Integer userId);

    // 开通年度VIP（365天）
    @Update("UPDATE users SET is_vip = 1, vip_expires_at = DATE_ADD(NOW(), INTERVAL 365 DAY), updated_at = NOW() " +
            "WHERE user_id = #{userId}")
    int activeYearlyVip(Integer userId);

    // 开通终身VIP
    @Update("UPDATE users SET is_vip = 1, vip_expires_at = '2099-12-31 23:59:59', updated_at = NOW() " +
            "WHERE user_id = #{userId}")
    int activeLifetimeVip(Integer userId);

    // 更新昵称
    @Update("UPDATE users SET nickname = #{nickname}, updated_at = NOW() WHERE user_id = #{userId}")
    int updateNickname(Integer userId, String nickname);

    // 更新头像
    @Update("UPDATE users SET avatar = #{avatar}, updated_at = NOW() WHERE user_id = #{userId}")
    int updateAvatar(Integer userId, String avatar);

    // 删除用户
    @Delete("DELETE FROM users WHERE user_id = #{userId}")
    int deleteUser(Integer userId);

    // 获取所有用户（调试用）
    @Select("SELECT * FROM users")
    List<Users> getAllUsers();

    @Select("SELECT COUNT(*) FROM users WHERE is_vip = 1")
    int countVipUsers();

    @Select("SELECT COUNT(*) FROM users WHERE DATE(created_at) = CURDATE()")
    int countTodayRegister();

    @Select("SELECT COUNT(*) FROM users WHERE is_vip = 1 AND vip_expires_at BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)")
    int countVipExpiringIn7Days();

    @Select("SELECT SUM(30 - credits) FROM users") // 假设注册送30积分，已用 = 30 - 剩余
    Integer sumAllCredits();

    @Select("SELECT COUNT(*) FROM users WHERE DATE(created_at) = #{date}")
    int countRegisterByDate(String date);

    @Select("SELECT COUNT(*) FROM users WHERE is_vip = 1 AND vip_expires_at > '2099-01-01'")
    int countLifetimeVip();

    @Select("SELECT COUNT(*) FROM users WHERE is_vip = 1 AND vip_expires_at <= DATE_ADD(NOW(), INTERVAL 365 DAY) AND vip_expires_at > NOW()")
    int countYearlyVip();

    @Select("SELECT COUNT(*) FROM users WHERE is_vip = 1 AND vip_expires_at <= DATE_ADD(NOW(), INTERVAL 30 DAY) AND vip_expires_at > NOW()")
    int countMonthlyVip();

    @Select("SELECT COUNT(*) FROM users")
    int countAllUsers();
}
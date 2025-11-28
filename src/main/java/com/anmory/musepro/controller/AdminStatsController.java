// src/main/java/com/anmory/musepro/controller/AdminStatsController.java
package com.anmory.musepro.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/admin/stats")
@CrossOrigin(origins = "*")
public class AdminStatsController {

    @Autowired private com.anmory.musepro.mapper.UsersMapper usersMapper;
    @Autowired private com.anmory.musepro.mapper.SongsMapper songsMapper;

    // ==================== 1. 平台总览大盘数据 ====================
    @GetMapping("/overview")
    public Map<String, Object> overview() {
        Map<String, Object> data = new HashMap<>();

        // 用户相关
        int totalUsers = usersMapper.countAllUsers();
        int vipUsers = usersMapper.countVipUsers(); // 你下面要加这个SQL
        int todayRegister = usersMapper.countTodayRegister();
        int totalCredits = usersMapper.sumAllCredits();

        // 歌曲相关
        int totalSongs = songsMapper.countAllSongs();
        int todaySongs = songsMapper.countTodaySongs();
        int totalPlayCount = songsMapper.sumAllPlayCount();
        int totalLikeCount = songsMapper.sumAllLikeCount();

        data.put("totalUsers", totalUsers);
        data.put("vipUsers", vipUsers);
        data.put("todayRegister", todayRegister);
        data.put("totalCreditsUsed", totalCredits); // 已消耗的免费额度

        data.put("totalSongs", totalSongs);
        data.put("todaySongs", todaySongs);
        data.put("totalPlayCount", totalPlayCount);
        data.put("totalLikeCount", totalLikeCount);

        data.put("avgSongsPerUser", totalUsers == 0 ? 0 : BigDecimal.valueOf(totalSongs).divide(BigDecimal.valueOf(totalUsers), 2, BigDecimal.ROUND_HALF_UP));
        data.put("activeRate", totalUsers == 0 ? "0%" : (songsMapper.countUsersWhoGenerated() * 100 / totalUsers) + "%");

        return success(data);
    }

    // ==================== 2. 最近7天/30天注册和生成趋势 ====================
    @GetMapping("/trend")
    public Map<String, Object> trend(@RequestParam(defaultValue = "7") int days) {
        List<String> dates = new ArrayList<>();
        List<Integer> registerList = new ArrayList<>();
        List<Integer> generateList = new ArrayList<>();

        LocalDate end = LocalDate.now();
        LocalDate start = end.minusDays(days - 1);

        for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
            String d = date.format(DateTimeFormatter.ofPattern("MM-dd"));
            dates.add(d);
            registerList.add(usersMapper.countRegisterByDate(date.toString()));
            generateList.add(songsMapper.countSongsByDate(date.toString()));
        }

        Map<String, Object> data = new HashMap<>();
        data.put("dates", dates);
        data.put("register", registerList);
        data.put("generate", generateList);
        return success(data);
    }

    // ==================== 3. VIP用户统计 ====================
    @GetMapping("/vip")
    public Map<String, Object> vipStats() {
        Map<String, Object> data = new HashMap<>();
        data.put("totalVip", usersMapper.countVipUsers());
        data.put("monthlyVip", usersMapper.countMonthlyVip());
        data.put("yearlyVip", usersMapper.countYearlyVip());
        data.put("lifetimeVip", usersMapper.countLifetimeVip());
        data.put("expiringSoon", usersMapper.countVipExpiringIn7Days()); // 7天内到期
        return success(data);
    }

    // ==================== 4. 热门歌曲TOP10 ====================
    @GetMapping("/top-songs")
    public Map<String, Object> topSongs() {
        return success(songsMapper.getTopSongs(10));
    }

    // ==================== 5. 用户活跃度分布（生成过歌曲的用户） ====================
    @GetMapping("/user-activity")
    public Map<String, Object> userActivity() {
        List<Map<String, Object>> list = songsMapper.countSongsGroupByUser();
        // 简单返回前50活跃用户
        return success(list.size() > 50 ? list.subList(0, 50) : list);
    }

    // ==================== 工具方法 ====================
    private Map<String, Object> success(Object data) {
        Map<String, Object> map = new HashMap<>();
        map.put("code", 200);
        map.put("data", data);
        return map;
    }
}
package com.anmory.musepro.model;

import lombok.Data;

import java.util.Date;

/**
 * @author Anmory
 * @description TODO
 * @date 2025-11-26 下午7:34
 */

@Data
public class Users {
    private Integer userId;
    private String email;
    private String passwordHash;
    private String nickname;
    private String avatar;
    private Integer credits;
    private Boolean isVip;
    private Date vipExpiresAt;
    private Date createdAt;
    private Date updatedAt;
}

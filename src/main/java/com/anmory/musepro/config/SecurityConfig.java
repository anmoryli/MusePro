// src/main/java/com/anmory/musepro/config/SecurityConfig.java
package com.anmory.musepro.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

// 用于postman测试
@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // 关闭 CSRF（前后端分离 + Postman 测试必关）
                .csrf(AbstractHttpConfigurer::disable)

                // 关闭所有鉴权，直接放行全部请求
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll()   // 这一行就是王炸，所有接口都不需要登录
                )

        // 可选：如果你连 Basic 弹窗都不想看到，也可以把下面这行打开
         .httpBasic(AbstractHttpConfigurer::disable)
        ;

        return http.build();
    }
}
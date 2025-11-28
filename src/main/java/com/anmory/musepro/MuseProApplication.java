package com.anmory.musepro;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.client.RestTemplate;

@SpringBootApplication
@EnableScheduling
public class MuseProApplication {

    public static void main(String[] args) {
        SpringApplication.run(MuseProApplication.class, args);
    }

    // 加上这几行就行了！
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

}

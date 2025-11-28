package com.anmory.musepro;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.core.task.TaskExecutor;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.web.client.RestTemplate;

import java.util.concurrent.ThreadPoolExecutor;

@SpringBootApplication
@EnableScheduling
@EnableAsync
public class MuseProApplication {

    public static void main(String[] args) {
        SpringApplication.run(MuseProApplication.class, args);
    }

    // 加上这几行就行了！
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    // 自定义异步线程池（解决单线程卡死问题）
    @Bean
    public TaskExecutor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(6);                    // 核心线程数
        executor.setMaxPoolSize(20);                    // 最大线程数
        executor.setQueueCapacity(200);                 // 队列长度
        executor.setKeepAliveSeconds(60);
        executor.setThreadNamePrefix("SongTask-");      // 线程名前缀，日志好看
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }

}

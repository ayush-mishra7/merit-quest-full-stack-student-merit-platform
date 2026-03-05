package com.meritquest;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class MeritQuestApplication {

    public static void main(String[] args) {
        SpringApplication.run(MeritQuestApplication.class, args);
    }
}

package com.softinter.sicapi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableJpaAuditing(auditorAwareRef = "auditorAwareImpl")
@EnableJpaRepositories(basePackages = "com.softinter.sicapi.repository")
@EnableAsync
@EnableScheduling
public class SicApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(SicApiApplication.class, args);
    }
}

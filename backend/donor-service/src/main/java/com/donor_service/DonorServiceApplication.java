package com.donor_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class DonorServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(DonorServiceApplication.class, args);
    }
}
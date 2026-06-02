package com.softinter.sicapi.config;

import java.net.URI;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

@Configuration
public class S3Config {

    @Value("${storage.service-url:http://localhost:8888}")
    private String serviceUrl;

    @Value("${storage.access-key:seaweedfs}")
    private String accessKey;

    @Value("${storage.secret-key:seaweedfs-secret}")
    private String secretKey;

    @Bean
    public S3Client s3Client() {
        AwsBasicCredentials credentials = AwsBasicCredentials.create(accessKey, secretKey);
        return S3Client.builder()
                .region(Region.US_EAST_1)
                .endpointOverride(URI.create(serviceUrl))  // ชี้ไปที่ SeaweedFS
                .credentialsProvider(StaticCredentialsProvider.create(credentials))
                .build();
    }
}

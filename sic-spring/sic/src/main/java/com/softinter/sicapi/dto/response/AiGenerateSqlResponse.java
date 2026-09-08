package com.softinter.sicapi.dto.response;

import java.util.UUID;

import lombok.Data;

@Data
public class AiGenerateSqlResponse {
    private String sql;
    private String message;
    private Integer versionNo;
    private UUID historyId;
    private String summaryNote;
}
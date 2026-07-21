package com.softinter.sicapi.dto.response;

import lombok.Data;

@Data
public class AiGenerateSqlResponse {
    private String sql;
    private String message;
}
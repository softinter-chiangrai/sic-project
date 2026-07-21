package com.softinter.sicapi.dto.request;

import lombok.Data;

@Data
public class AiGenerateSqlRequest {
    private String xml;
    private String vendor; 
    private String pageName;
}
package com.softinter.sicapi.dto.response;

import lombok.Data;

import java.util.Map;

@Data
public class I18nMessageResponse {
    private String module;
    private Map<String, String> messages;
}

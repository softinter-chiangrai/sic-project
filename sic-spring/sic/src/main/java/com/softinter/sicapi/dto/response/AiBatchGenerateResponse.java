package com.softinter.sicapi.dto.response;

import java.util.List;
import java.util.Map;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiBatchGenerateResponse {
    private String moduleType;
    private List<Map<String, Object>> items;
    private String message;
}

package com.softinter.sicapi.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiModelResponse {
    private String id;
    private String name;
    private String provider;
    private String description;
    private String icon;
    private boolean recommended;
}

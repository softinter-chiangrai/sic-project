package com.softinter.sicapi.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class I18nMessageResponse {
    private String messageCode;
    private String message;
}

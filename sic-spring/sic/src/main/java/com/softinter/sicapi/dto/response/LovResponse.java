package com.softinter.sicapi.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LovResponse {
    private Object value;
    private String text;
    private Boolean supportLocalAddress;
    private String zipCode;

    public LovResponse(Object value, String text) {
        this.value = value;
        this.text = text;
    }

    public LovResponse(Object value, String text, Boolean supportLocalAddress) {
        this.value = value;
        this.text = text;
        this.supportLocalAddress = supportLocalAddress;
    }

    public LovResponse(Object value, String text, String zipCode) {
        this.value = value;
        this.text = text;
        this.zipCode = zipCode;
    }
}
package com.softinter.sicapi.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComboboxResponse {
    private String value;
    private String text;
    private String description;
    private Object data;

    public ComboboxResponse(String value, String text) {
        this.value = value;
        this.text = text;
    }

    public ComboboxResponse(String value, String text, String description) {
        this.value = value;
        this.text = text;
        this.description = description;
    }
}
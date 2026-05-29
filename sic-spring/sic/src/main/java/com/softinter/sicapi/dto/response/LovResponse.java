package com.softinter.sicapi.dto.response;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LovResponse {
    private Object value;
    private String label;
}

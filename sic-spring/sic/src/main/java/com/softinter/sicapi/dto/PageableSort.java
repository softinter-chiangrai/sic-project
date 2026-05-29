package com.softinter.sicapi.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PageableSort {
    private String field;
    private boolean descending;
}

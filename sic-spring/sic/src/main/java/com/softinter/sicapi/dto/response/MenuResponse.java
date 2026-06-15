package com.softinter.sicapi.dto.response;

import java.util.ArrayList;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MenuResponse {
    private String name;
    private String icon;
    private String path;
    private String code;
    private List<MenuResponse> children = new ArrayList<>();
}

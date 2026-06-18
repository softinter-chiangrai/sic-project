package com.softinter.sicapi.dto.response;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

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

    private Integer state;
    private Integer rowVersion;
     @JsonProperty("isAdd")
    private boolean add;

    @JsonProperty("isBack")
    private boolean back;

    @JsonProperty("isPrint")
    private boolean print;

    @JsonProperty("isRemove")
    private boolean remove;

    @JsonProperty("isSave")
    private boolean save;

    @JsonProperty("isSearch")
    private boolean search;
}

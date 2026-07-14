package com.softinter.sicapi.dto.request;

import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class PmDiagramReorderRequest {
    private List<TabOrder> tabs;

    @Data
    public static class TabOrder {
        private UUID id;
        private Integer sortOrder;
    }
}
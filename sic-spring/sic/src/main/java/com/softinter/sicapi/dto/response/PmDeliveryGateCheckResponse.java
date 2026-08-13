package com.softinter.sicapi.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class PmDeliveryGateCheckResponse {
    private boolean isPassed;
    private int totalChecks;
    private int passedChecks;
    private List<GateCheckItem> checkItems;

    @Data
    @Builder
    public static class GateCheckItem {
        private String category; // REQUIREMENT, SPEC, TEST, BUG, MANUAL
        private String name;
        private boolean passed;
        private String status; // OK, WARNING, ERROR
        private String detail;
    }
}

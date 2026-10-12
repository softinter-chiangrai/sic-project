package com.softinter.sicapi.dto.response;

import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiDbValidationResponse {

    private int score; // 0 - 100
    private String grade; // A, B, C, D, F
    private String summary;
    private String lang;

    @Builder.Default
    private List<DbRiskItem> missingIndexes = new ArrayList<>();

    @Builder.Default
    private List<DbRiskItem> normalizationRisks = new ArrayList<>();

    @Builder.Default
    private List<DbRiskItem> typeAndConstraintRisks = new ArrayList<>();

    private String suggestedFixSql;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DbRiskItem {
        private String table;
        private String column;
        private String riskLevel; // LOW, MEDIUM, HIGH, CRITICAL
        private String issue;
        private String recommendation;
    }
}

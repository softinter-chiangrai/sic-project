package com.softinter.sicapi.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GlobalSearchResponse {

    private List<CustomerHit> customers;
    private List<ProjectHit> projects;
    private List<ContractHit> contracts;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CustomerHit {
        private UUID id;
        private String name;
        private String customerCode;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProjectHit {
        private UUID id;
        private String projectName;
        private String projectCode;
        private UUID customerId;
        private String customerName;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ContractHit {
        private UUID id;
        private String contractNo;
        private String contractType;
        private UUID customerId;
        private String customerName;
        private UUID projectId;
    }
}

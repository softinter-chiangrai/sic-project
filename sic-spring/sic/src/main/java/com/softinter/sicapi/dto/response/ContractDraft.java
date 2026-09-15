package com.softinter.sicapi.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContractDraft {
    private String contractNo;
    private String contractType;
    private BigDecimal contractValue;
    private String paymentTerms;
    private String scopeSummary;
    private String startDate;
    private String endDate;
    private String signStatus;
}

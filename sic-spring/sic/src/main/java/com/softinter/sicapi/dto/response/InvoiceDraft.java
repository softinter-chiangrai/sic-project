package com.softinter.sicapi.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceDraft {
    private String invoiceTitle;
    private String billingType;
    private String remark;
    private BigDecimal vatRate;
    private List<InvoiceItemDraftItem> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InvoiceItemDraftItem {
        private String itemDescription;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal amount;
    }
}

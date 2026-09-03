package com.softinter.sicapi.dto.request;

import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class PmInvoiceItemRequest {
    private UUID id;
    private UUID invoiceId;
    private String itemName;
    private String description;
    private BigDecimal amount;
    private Integer sortOrder;
    private Integer state;
    private Integer rowVersion;
}

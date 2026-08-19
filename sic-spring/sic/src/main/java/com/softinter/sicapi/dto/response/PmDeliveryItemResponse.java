package com.softinter.sicapi.dto.response;

import lombok.Data;

import java.util.UUID;

@Data
public class PmDeliveryItemResponse {
    private UUID id;
    private UUID deliveryId;
    private String itemType;
    private UUID itemId;
    private String itemCode;
    private String itemTitle;
    private String itemStatus;
    private String remark;
    private Integer sortOrder;
}

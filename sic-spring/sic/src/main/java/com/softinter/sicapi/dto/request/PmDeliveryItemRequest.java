package com.softinter.sicapi.dto.request;

import lombok.Data;

import java.util.UUID;

@Data
public class PmDeliveryItemRequest {
    private UUID id;
    private UUID deliveryId;
    private String itemType; // REQUIREMENT, TEST_CASE, USER_MANUAL, CHANGE_REQUEST, SPECIFICATION
    private UUID itemId;
    private String itemCode;
    private String itemTitle;
    private String itemStatus;
    private String remark;
    private Integer sortOrder;
    private Integer state;
}

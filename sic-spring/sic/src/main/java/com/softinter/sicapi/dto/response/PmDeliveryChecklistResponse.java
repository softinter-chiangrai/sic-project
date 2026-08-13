package com.softinter.sicapi.dto.response;

import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class PmDeliveryChecklistResponse {
    private UUID id;
    private UUID deliveryId;
    private String itemName;
    private String itemCategory;
    private Boolean isChecked;
    private String checkedBy;
    private Instant checkedDate;
    private String remark;
    private Integer sortOrder;
    private Integer rowVersion;
}

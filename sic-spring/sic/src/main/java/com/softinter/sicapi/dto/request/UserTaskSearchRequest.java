package com.softinter.sicapi.dto.request;

import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.UUID;

@Data
@EqualsAndHashCode(callSuper = true)
public class UserTaskSearchRequest extends PageableRequest {
    private String keyword;
    private String userId;
    private UUID businessId;
    private Boolean isCompleted;
}

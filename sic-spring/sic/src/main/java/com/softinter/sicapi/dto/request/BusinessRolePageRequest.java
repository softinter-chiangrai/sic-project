package com.softinter.sicapi.dto.request;

import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.UUID;

@Data
@EqualsAndHashCode(callSuper = true)
public class BusinessRolePageRequest extends PageableRequest {
    private String keyword;
    private UUID businessId;
}

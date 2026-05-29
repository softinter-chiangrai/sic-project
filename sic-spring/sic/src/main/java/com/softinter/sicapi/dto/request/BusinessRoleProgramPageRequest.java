package com.softinter.sicapi.dto.request;

import java.util.UUID;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class BusinessRoleProgramPageRequest extends PageableRequest {
    private String keyword;
    private UUID businessRoleId;
}

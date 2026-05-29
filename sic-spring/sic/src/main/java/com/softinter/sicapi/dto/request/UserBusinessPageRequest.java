package com.softinter.sicapi.dto.request;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class UserBusinessPageRequest extends PageableRequest {
    private String keyword;
    private String userId;
}

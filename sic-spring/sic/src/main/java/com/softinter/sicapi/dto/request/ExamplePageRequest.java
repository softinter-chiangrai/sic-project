package com.softinter.sicapi.dto.request;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class ExamplePageRequest extends PageableRequest {
    private String keyword;
}

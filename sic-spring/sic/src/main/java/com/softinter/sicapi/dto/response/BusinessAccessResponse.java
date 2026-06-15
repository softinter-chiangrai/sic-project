package com.softinter.sicapi.dto.response;

import lombok.Data;
import java.util.UUID;

@Data
public class BusinessAccessResponse {
    private UUID businessId;
    private boolean canAccess;
}

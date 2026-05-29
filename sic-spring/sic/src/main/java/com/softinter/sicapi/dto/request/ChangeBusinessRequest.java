package com.softinter.sicapi.dto.request;

import lombok.Data;

import java.util.UUID;

@Data
public class ChangeBusinessRequest {
    private UUID businessId;
}

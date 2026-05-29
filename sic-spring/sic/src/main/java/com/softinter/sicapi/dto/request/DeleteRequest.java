package com.softinter.sicapi.dto.request;

import lombok.Data;

import java.util.UUID;

@Data
public class DeleteRequest {
    private UUID id;
    private Long rowVersion;
}

package com.softinter.sicapi.entity.ex;

import java.util.UUID;

import com.softinter.sicapi.entity.enums.EntityState;

import lombok.Data;

@Data
public class StorageUploadReference {
    private UUID id;
    private UUID uploadGroupId;
    private EntityState state;
    private Boolean isActive;
   
}

package com.softinter.sicapi.dto.response;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.softinter.sicapi.entity.ex.StorageUploadReference;

@Data
@JsonPropertyOrder({ "id", "code", "name", "isDefault", "uploadGroupId", "uploadGroupData" }) 
public class BusinessResponseDto {
    private UUID id;
    private String code;
    private String name;
    private Boolean isDefault;
    private UUID uploadGroupId;
    private List<StorageUploadReference> uploadGroupData = new ArrayList<>();
}

package com.softinter.sicapi.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class CreateGroupRequest {
    private String groupName;
    private String groupDescription;
    private List<String> memberUserIds;
}

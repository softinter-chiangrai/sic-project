package com.softinter.sicapi.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class UpdateGroupRequest {
    private UUID groupId;

    @JsonProperty("name")
    @JsonAlias({"Name", "name"})
    private String name;

    private String groupDescription;
    private List<String> memberUserIds;
}

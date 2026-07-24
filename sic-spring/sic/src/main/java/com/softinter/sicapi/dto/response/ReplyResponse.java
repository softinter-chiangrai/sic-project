package com.softinter.sicapi.dto.response;

import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class ReplyResponse {
    private UUID id;
    private String content;
    private String createdBy;
    private String createdByName;
    private Instant createdDate;
    private UUID attachmentGroupId;
}
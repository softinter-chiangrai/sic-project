package com.softinter.sicapi.dto.response;

import lombok.Data;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
public class PostResponse {
    private UUID id;
    private String subject;
    private String content;
    private String createdBy;
    private String createdByName;
    private Instant createdDate;
    private UUID attachmentGroupId;
    private Boolean pinned;
    private long replyCount;
    private List<ReplyResponse> replies; // ตัวเลือก: อาจไม่ต้องดึงมาในครั้งแรก
}
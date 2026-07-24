package com.softinter.sicapi.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class ReplyRequest {
    @NotNull(message = "Post ID is required")
    private UUID postId;

    @NotBlank(message = "Content is required")
    private String content;

    private UUID attachmentGroupId;
}
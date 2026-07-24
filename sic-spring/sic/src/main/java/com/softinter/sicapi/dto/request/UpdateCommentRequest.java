package com.softinter.sicapi.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateCommentRequest {
    @NotBlank(message = "Content is required")
    private String content;
}
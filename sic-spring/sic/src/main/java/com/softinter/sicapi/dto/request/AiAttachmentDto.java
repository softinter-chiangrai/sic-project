package com.softinter.sicapi.dto.request;

import lombok.Data;

/**
 * A single file/image attached by the user to an AI generation request.
 * base64Data must NOT include the "data:...;base64," prefix.
 */
@Data
public class AiAttachmentDto {
    private String fileName;
    private String mimeType;
    private String base64Data;
}

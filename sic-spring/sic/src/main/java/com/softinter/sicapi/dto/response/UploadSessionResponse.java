package com.softinter.sicapi.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class UploadSessionResponse {
    private String sessionId;
    private String uploadUrl;
    private Integer chunkSize;
    private Integer totalChunks;
    private Integer nextChunkIndex;   
    private Long uploadedBytes;  
}
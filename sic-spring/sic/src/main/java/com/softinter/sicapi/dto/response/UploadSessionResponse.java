package com.softinter.sicapi.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

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
    private UUID uploadGroupId; // ✅ เพิ่มเพื่อให้ Frontend รู้ว่าไฟล์อยู่ใน group ไหน
}
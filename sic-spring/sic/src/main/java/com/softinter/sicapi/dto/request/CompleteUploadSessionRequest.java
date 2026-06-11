package com.softinter.sicapi.dto.request;

import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

@Getter
@Setter
public class CompleteUploadSessionRequest {
    private UUID sessionId;  // uploadGroupId ที่ได้จาก create session
}
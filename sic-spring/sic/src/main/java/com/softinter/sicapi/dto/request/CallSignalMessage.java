package com.softinter.sicapi.dto.request;

import lombok.Data;

@Data
public class CallSignalMessage {
    private String action;          // "start", "answer", "ice-candidate", "end", "recording"
    private String callerId;
    private String callerName;
    private String targetUserId;
    private String callType;        // "audio" | "video"
    private String sdpOffer;
    private String sdpAnswer;
    private String iceCandidate;
    private String groupId;
    private String groupName;
    private Boolean accepted;
    private Boolean isStarting;
    private Integer durationSeconds;
}

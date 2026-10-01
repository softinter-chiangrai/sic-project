package com.softinter.sicapi.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MaTicketDraft {
    private String title;
    private String ticketType;
    private String severity;
    private String description;
    private String resolutionSummary;
    private String startDate;
    private String startTime;
    private String endDate;
    private String endTime;
    private java.util.List<String> assignedToIds;
}

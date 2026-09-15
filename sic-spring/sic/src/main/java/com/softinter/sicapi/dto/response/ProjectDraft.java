package com.softinter.sicapi.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectDraft {
    private String projectCode;
    private String projectName;
    private String description;
    private String startDate;
    private String endDate;
    private String status;
}

package com.softinter.sicapi.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserManualDraftResponse {
    private String manualTitle;
    private String manualType;
    private String summary;
    private String version;
    private UUID relatedSpecId;
    private List<SectionDraftDto> sections;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SectionDraftDto {
        private String sectionCode;
        private String sectionTitle;
        private String content; // Rich HTML for Tiptap Editor
        private Integer sortOrder;
    }
}

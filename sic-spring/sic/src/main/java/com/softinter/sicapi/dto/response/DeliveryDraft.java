package com.softinter.sicapi.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryDraft {
    private String deliveryTitle;
    private String deliveryType;
    private String deliveryVersion;
    private String deliverySummary;
    private String releaseNote;
    private List<DeliveryChecklistDraftItem> checklists;
    private List<DeliveryItemDraftItem> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DeliveryChecklistDraftItem {
        private String checklistName;
        private String notes;
        private Boolean isPassed;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DeliveryItemDraftItem {
        private String itemName;
        private String itemType;
        private String description;
    }
}

// sic-spring/sic/src/main/java/com/softinter/sicapi/service/TraceLinkService.java
package com.softinter.sicapi.service;

import com.softinter.sicapi.entity.pm.PmTraceLink;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

public interface TraceLinkService {

    // ===== Core Methods =====
    PmTraceLink createLink(UUID projectId,
                           String sourceType, UUID sourceId,
                           String targetType, UUID targetId,
                           String relationshipType);

    void deleteLink(UUID linkId);

    // ✅ เพิ่ม method สำหรับลบตาม Source + Target (ใช้ใน updateTab)
    void deleteLinksBySourceAndTarget(String sourceType, UUID sourceId, String targetType, UUID targetId);

    List<PmTraceLink> getLinksBySource(String sourceType, UUID sourceId);

    List<PmTraceLink> getLinksByTarget(String targetType, UUID targetId);

    List<PmTraceLink> getFullTrace(String sourceType, UUID sourceId);

    ImpactTraceResult getImpactedItems(String sourceType, UUID sourceId);

    void createLinksFromDiagramXml(UUID projectId, UUID diagramTabId, String diagramType, String xmlContent);

    // ===== DTO =====
    class ImpactTraceResult {
        private String sourceType;
        private UUID sourceId;
        private Map<String, Set<UUID>> impacted;

        public String getSourceType() { return sourceType; }
        public void setSourceType(String sourceType) { this.sourceType = sourceType; }

        public UUID getSourceId() { return sourceId; }
        public void setSourceId(UUID sourceId) { this.sourceId = sourceId; }

        public Map<String, Set<UUID>> getImpacted() { return impacted; }
        public void setImpacted(Map<String, Set<UUID>> impacted) { this.impacted = impacted; }
    }
}
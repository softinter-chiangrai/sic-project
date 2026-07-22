// sic-spring/sic/src/main/java/com/softinter/sicapi/service/impl/TraceLinkServiceImpl.java
package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.entity.pm.PmTraceLink;
import com.softinter.sicapi.repository.pm.PmTraceLinkRepository;
import com.softinter.sicapi.service.TraceLinkService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;

import javax.xml.parsers.DocumentBuilderFactory;
import java.io.StringReader;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class TraceLinkServiceImpl implements TraceLinkService {

    private final PmTraceLinkRepository traceLinkRepository;

    @Override
    @Transactional
    public PmTraceLink createLink(UUID projectId, String sourceType, UUID sourceId,
                                  String targetType, UUID targetId, String relationshipType) {
        List<PmTraceLink> existing = traceLinkRepository.findExistingLink(sourceType, sourceId, targetType, targetId);
        if (!existing.isEmpty()) {
            log.debug("Link already exists: {} -> {}", sourceId, targetId);
            return existing.get(0);
        }

        PmTraceLink link = new PmTraceLink();
        link.setProjectId(projectId);
        link.setSourceType(sourceType);
        link.setSourceId(sourceId);
        link.setTargetType(targetType);
        link.setTargetId(targetId);
        link.setRelationshipType(relationshipType);
        return traceLinkRepository.save(link);
    }

    // ✅ Implement: deleteLinksBySourceAndTarget
    @Override
    @Transactional
    public void deleteLinksBySourceAndTarget(String sourceType, UUID sourceId, String targetType, UUID targetId) {
        List<PmTraceLink> links = traceLinkRepository.findExistingLink(sourceType, sourceId, targetType, targetId);
        for (PmTraceLink link : links) {
            link.setIsDelete(true);
            traceLinkRepository.save(link);
        }
        log.info("Deleted {} trace link(s) from {}:{} → {}:{}", links.size(), sourceType, sourceId, targetType, targetId);
    }

    @Override
    @Transactional
    public void deleteLink(UUID linkId) {
        PmTraceLink link = traceLinkRepository.findById(linkId)
                .orElseThrow(() -> new RuntimeException("Trace link not found: " + linkId));
        link.setIsDelete(true);
        traceLinkRepository.save(link);
    }

    @Override
    public List<PmTraceLink> getLinksBySource(String sourceType, UUID sourceId) {
        return traceLinkRepository.findBySourceTypeAndSourceId(sourceType, sourceId);
    }

    @Override
    public List<PmTraceLink> getLinksByTarget(String targetType, UUID targetId) {
        return traceLinkRepository.findByTargetTypeAndTargetId(targetType, targetId);
    }

    @Override
    public List<PmTraceLink> getFullTrace(String sourceType, UUID sourceId) {
        List<Object[]> rows = traceLinkRepository.findFullTrace(sourceType, sourceId);
        List<PmTraceLink> result = new ArrayList<>();
        for (Object[] row : rows) {
            PmTraceLink link = new PmTraceLink();
            link.setSourceType((String) row[0]);
            link.setSourceId((UUID) row[1]);
            link.setTargetType((String) row[2]);
            link.setTargetId((UUID) row[3]);
            link.setRelationshipType((String) row[4]);
            result.add(link);
        }
        return result;
    }

    @Override
    public ImpactTraceResult getImpactedItems(String sourceType, UUID sourceId) {
        List<PmTraceLink> trace = getFullTrace(sourceType, sourceId);
        Map<String, Set<UUID>> impactedMap = new HashMap<>();

        for (PmTraceLink link : trace) {
            impactedMap.computeIfAbsent(link.getTargetType(), k -> new HashSet<>())
                       .add(link.getTargetId());
        }

        ImpactTraceResult result = new ImpactTraceResult();
        result.setSourceType(sourceType);
        result.setSourceId(sourceId);
        result.setImpacted(impactedMap);
        return result;
    }

    @Override
    @Transactional
    public void createLinksFromDiagramXml(UUID projectId, UUID diagramTabId, String diagramType, String xmlContent) {
        if (xmlContent == null || xmlContent.trim().isEmpty()) {
            log.debug("No XML content to parse for diagram: {}", diagramTabId);
            return;
        }

        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            Document doc = factory.newDocumentBuilder().parse(new InputSource(new StringReader(xmlContent)));

            NodeList cells = doc.getElementsByTagName("mxCell");
            Map<String, String> entityNames = new HashMap<>();

            for (int i = 0; i < cells.getLength(); i++) {
                Element cell = (Element) cells.item(i);
                String vertex = cell.getAttribute("vertex");
                String value = cell.getAttribute("value");

                if ("1".equals(vertex) && value != null && !value.trim().isEmpty()) {
                    String[] lines = value.trim().split("\n");
                    String entityName = lines[0].trim();
                    if (!entityName.isEmpty()) {
                        entityNames.put(cell.getAttribute("id"), entityName);
                    }
                }
            }

            for (String entityId : entityNames.keySet()) {
                String entityName = entityNames.get(entityId);
                String targetType = "ENTITY";
                String targetId = "entity_" + entityName.toLowerCase().replaceAll("[^a-z0-9_]", "_");
                UUID targetUuid = UUID.nameUUIDFromBytes(targetId.getBytes());

                String relType = "DFD".equalsIgnoreCase(diagramType)
                        ? "DESIGNED_BY"
                        : "IMPLEMENTED_BY";

                this.createLink(
                    projectId,
                    diagramType.toUpperCase(), diagramTabId,
                    targetType, targetUuid,
                    relType
                );
            }

            log.info("Created {} trace links from diagram {} (type: {})",
                    entityNames.size(), diagramTabId, diagramType);

        } catch (Exception e) {
            log.error("Failed to parse XML for trace links: {}", diagramTabId, e);
        }
    }
}
package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.entity.enums.TraceRelationship;
import com.softinter.sicapi.entity.pm.PmTraceLink;
import com.softinter.sicapi.repository.pm.PmTraceLinkRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class TraceLinkServiceCleanupTest {

    private PmTraceLinkRepository repository;
    private TraceLinkServiceImpl service;

    @BeforeEach
    void setUp() {
        repository = Mockito.mock(PmTraceLinkRepository.class);
        service = new TraceLinkServiceImpl(repository);
    }

    @Test
    void deleteLinksByEntity_shouldCallSoftDeleteWithNormalizedType() {
        UUID docId = UUID.randomUUID();
        when(repository.softDeleteByEntity("REQUIREMENT", docId)).thenReturn(3);

        service.deleteLinksByEntity("requirement", docId);

        verify(repository).softDeleteByEntity(eq("REQUIREMENT"), eq(docId));
    }

    @Test
    void getFullTrace_shouldMapAllReturnedRowsCorrectly() {
        UUID reqId = UUID.randomUUID();
        UUID specId = UUID.randomUUID();

        Object[] row1 = new Object[]{"REQUIREMENT", reqId, "SPECIFICATION", specId, "IMPLEMENTED_BY"};
        java.util.List<Object[]> rows = new java.util.ArrayList<>();
        rows.add(row1);
        when(repository.findFullTrace("REQUIREMENT", reqId)).thenReturn(rows);

        List<PmTraceLink> trace = service.getFullTrace("requirement", reqId);

        assertNotNull(trace);
        assertEquals(1, trace.size());
        assertEquals("REQUIREMENT", trace.get(0).getSourceType());
        assertEquals(reqId, trace.get(0).getSourceId());
        assertEquals("SPECIFICATION", trace.get(0).getTargetType());
        assertEquals(specId, trace.get(0).getTargetId());
        assertEquals(TraceRelationship.IMPLEMENTED_BY, trace.get(0).getRelationshipType());
    }
}

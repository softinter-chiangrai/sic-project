package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.service.PmAiProviderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class AiDocumentVectorServiceTest {

    private PmAiProviderService aiProviderService;
    private JdbcTemplate jdbcTemplate;
    private AiDocumentVectorService vectorService;

    @BeforeEach
    void setUp() {
        aiProviderService = Mockito.mock(PmAiProviderService.class);
        jdbcTemplate = Mockito.mock(JdbcTemplate.class);
        vectorService = new AiDocumentVectorService(aiProviderService, jdbcTemplate);
    }

    @Test
    void rejectsDisallowedTables() {
        vectorService.updateEmbeddingAsync("users", UUID.randomUUID(), "some text");
        verifyNoInteractions(aiProviderService);
    }

    @Test
    void rejectsNullOrBlankText() {
        vectorService.updateEmbeddingAsync("pm_requirement", UUID.randomUUID(), "   ");
        verifyNoInteractions(aiProviderService);
    }

    @Test
    void updatesEmbeddingForAllowedTable() {
        UUID id = UUID.randomUUID();
        when(aiProviderService.getEmbedding(anyString())).thenReturn(new float[]{0.1f, 0.2f});

        vectorService.updateEmbeddingAsync("pm_requirement", id, "<b>REQ-001</b> Payment");

        // Wait a brief moment for async task
        verify(aiProviderService, timeout(1000)).getEmbedding("REQ-001 Payment");
        verify(jdbcTemplate, timeout(1000)).update(contains("UPDATE pm_requirement"), anyString(), eq(id));
    }
}


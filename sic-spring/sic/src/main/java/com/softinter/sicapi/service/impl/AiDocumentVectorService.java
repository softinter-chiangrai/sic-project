package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.service.PmAiProviderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.Arrays;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

/**
 * บริการแปลงเนื้อหาเอกสารเป็น Vector (Embedding) อัตโนมัติเมื่อมีการบันทึก (Auto-Vectorize)
 * ทำงานแบบ Asynchronous และรอหลัง Commit Transaction เท่านั้น
 * ปลอดภัย 100%: ไม่หน่วงเวลาหน้าเว็บ และไม่ทำให้การบันทึกล้มแม้ระบบ AI ภายนอกจะช้าหรือล่ม
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AiDocumentVectorService {

    private final PmAiProviderService aiProviderService;
    private final JdbcTemplate jdbcTemplate;

    private static final Set<String> ALLOWED_TABLES = Set.of(
            "pm_requirement",
            "pm_specification",
            "pm_customer_contract",
            "pm_delivery",
            "pm_task",
            "pm_diagram",
            "pm_test_scenario",
            "pm_customer_project"
    );

    public void updateEmbeddingAsync(String tableName, UUID id, String textToEmbed) {
        if (tableName == null || !ALLOWED_TABLES.contains(tableName.toLowerCase()) || id == null || textToEmbed == null || textToEmbed.isBlank()) {
            return;
        }

        String plainText = stripHtml(textToEmbed);
        if (plainText.isBlank()) {
            return;
        }

        Runnable task = () -> CompletableFuture.runAsync(() -> {
            try {
                float[] vec = aiProviderService.getEmbedding(plainText);
                if (vec != null && vec.length > 0) {
                    String sql = "UPDATE " + tableName.toLowerCase() + " SET embedding = cast(? as vector) WHERE id = ?";
                    jdbcTemplate.update(sql, Arrays.toString(vec), id);
                    log.debug("Auto-vectorized {} id: {}", tableName, id);
                }
            } catch (Exception e) {
                log.warn("Auto-vectorize failed for {} id: {}: {}", tableName, id, e.getMessage());
            }
        });

        if (TransactionSynchronizationManager.isActualTransactionActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    task.run();
                }
            });
        } else {
            task.run();
        }
    }

    private static String stripHtml(String html) {
        if (html == null) return "";
        return html.replaceAll("<[^>]+>", " ").replaceAll("\\s+", " ").trim();
    }
}


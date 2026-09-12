package com.softinter.sicapi.service.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.softinter.sicapi.dto.request.AiGenerateSqlRequest;
import com.softinter.sicapi.dto.response.AiGenerateSqlResponse;
import com.softinter.sicapi.entity.pm.PmDiagramSqlHistory;
import com.softinter.sicapi.repository.PmDiagramSqlHistoryRepository;
import com.softinter.sicapi.service.AiSqlGeneratorService;
import com.softinter.sicapi.service.CurrentUserService;
import com.softinter.sicapi.service.PmAiProviderService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiSqlGeneratorServiceImpl implements AiSqlGeneratorService {

    private final ErXmlParserServiceImpl parser = new ErXmlParserServiceImpl();
    private final PmAiProviderService aiProviderService;
    private final PmDiagramSqlHistoryRepository historyRepository;
    private final CurrentUserService currentUserService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final Pattern SQL_BLOCK_PATTERN = Pattern.compile("```(?:sql)?\\s*([\\s\\S]*?)```", Pattern.MULTILINE);

    @Override
    public String generateSqlWithAi(String xml, String vendor) {
        ErXmlParserServiceImpl.DatabaseModel model = parser.parse(xml);

        if (model.tables == null || model.tables.isEmpty()) {
            throw new IllegalArgumentException("No tables found in the ER diagram. Please draw tables first.");
        }

        String structureJson = buildSimplifiedJson(model);
        log.info("Generated structure JSON ({} chars) for AI", structureJson.length());

        String prompt = String.format("""
            You are an expert SQL developer. Based on the following database structure (tables, columns, and relations),
            generate a complete DDL SQL script for a **%s** database.

            **Rules for SQL:**
            1. Use appropriate data types (VARCHAR, INT, DATE, DECIMAL, TIMESTAMP, BOOLEAN, etc.) based on the column names.
            2. If a column name is "id", make it PRIMARY KEY with UUID or BIGSERIAL/BIGINT.
            3. Add FOREIGN KEY constraints for all relations.
            4. Add useful indexes for foreign key columns.
            5. Add `created_at` and `updated_at` TIMESTAMP columns with defaults.
            6. **DO NOT include any comments in the SQL script — no `--` line comments and no `/* ... */` block comments.**
            7. **DO NOT include any explanations, notes, or suggestions outside the SQL code.**
            8. Output **ONLY** the executable SQL code. No markdown, no backticks, no extra text.

            **Database Structure:**
            %s
            """, vendor, structureJson);

        String systemPrompt = "You are an expert database administrator and SQL developer. Output ONLY valid, executable SQL scripts without markdown explanations.";
        String aiRawResponse = aiProviderService.generateRawResponse(prompt, systemPrompt);
        String extractedSql = extractSql(aiRawResponse);

        if (extractedSql == null || extractedSql.isBlank()) {
            log.warn("Could not extract SQL block, using raw response");
            extractedSql = aiRawResponse;
        }

        return extractedSql.trim();
    }

    private String generateMigrationSqlWithAi(String currentStructureJson, List<PmDiagramSqlHistory> allPreviousHistories, String vendor) {
        StringBuilder historyContext = new StringBuilder();
        for (int i = allPreviousHistories.size() - 1; i >= 0; i--) {
            PmDiagramSqlHistory h = allPreviousHistories.get(i);
            historyContext.append(String.format("""
                --- [VERSION %d (%s) - %s] ---
                %s
                
                """, h.getVersionNo(), h.getGenerationType(), h.getSummaryNote() != null ? h.getSummaryNote() : "", h.getGeneratedSql()));
        }

        String latestSchemaJson = allPreviousHistories.get(0).getSchemaJson();

        String prompt = String.format("""
            You are an expert database administrator and SQL developer specializing in Flyway database migrations for **%s**.

            The database was already created and modified through the following sequential SQL scripts that were previously executed in production:

            === PREVIOUSLY EXECUTED SQL SCRIPTS IN ORDER ===
            %s

            === PREVIOUS DATABASE STRUCTURE (JSON) ===
            %s

            === CURRENT DESIRED NEW STRUCTURE (JSON from latest ER Diagram) ===
            %s

            **TASK:**
            Generate the NEXT migration SQL script (e.g., ALTER TABLE, ADD COLUMN, DROP COLUMN, ALTER COLUMN/MODIFY TYPE, CREATE TABLE for newly added tables, CREATE INDEX, ADD CONSTRAINT) needed to update the database to match the CURRENT DESIRED NEW STRUCTURE without conflicting with or duplicating any of the previously executed scripts.

            **Rules for Migration SQL:**
            1. The previously executed scripts are ALREADY RUN in the database. DO NOT re-create existing tables or re-add existing columns/constraints.
            2. Use `ALTER TABLE ...` statements to alter existing tables.
            3. Only use `CREATE TABLE` for completely new tables that do not exist yet.
            4. Preserve existing table data.
            5. If there are no schema differences between the previous structure and the current structure, output an empty SQL or minimal safe comment.
            6. **DO NOT include any explanation, notes, or markdown outside the SQL code.**
            7. Output **ONLY** the executable SQL code.
            """, vendor, historyContext.toString(), latestSchemaJson != null ? latestSchemaJson : "{}", currentStructureJson);

        String systemPrompt = "You are an expert database administrator and SQL developer specializing in database migration scripts. Output ONLY valid, executable migration SQL scripts (ALTER TABLE, CREATE TABLE, etc.) without markdown explanations.";
        String aiRawResponse = aiProviderService.generateRawResponse(prompt, systemPrompt);
        String extractedSql = extractSql(aiRawResponse);

        if (extractedSql == null || extractedSql.isBlank()) {
            log.warn("Could not extract migration SQL block, using raw response");
            extractedSql = aiRawResponse;
        }

        return extractedSql.trim();
    }

    @Override
    @Transactional
    public AiGenerateSqlResponse processAndSaveSql(AiGenerateSqlRequest request) {
        String vendor = (request.getVendor() != null && !request.getVendor().isBlank()) ? request.getVendor() : "postgresql";
        String engine = (request.getEngine() != null && !request.getEngine().isBlank()) ? request.getEngine() : "ai";
        String tabId = request.getTabId();

        ErXmlParserServiceImpl.DatabaseModel model = parser.parse(request.getXml());
        if (model.tables == null || model.tables.isEmpty()) {
            throw new IllegalArgumentException("No tables found in the ER diagram. Please draw tables first.");
        }
        String currentStructureJson = buildSimplifiedJson(model);

        String sqlResult = "";
        String summaryNote = "";
        String mode = "FULL";

        // Fetch all previous history for this tab in descending order
        List<PmDiagramSqlHistory> previousHistories = (tabId != null && !tabId.isBlank())
                ? historyRepository.findByTabIdOrderByVersionNoDesc(tabId)
                : List.of();

        if (!previousHistories.isEmpty()) {
            // Already has history -> Smart Auto Migration Mode
            mode = "MIGRATION";
            PmDiagramSqlHistory latest = previousHistories.get(0);
            log.info("Generating Auto MIGRATION SQL based on {} previous history scripts for tab {}", previousHistories.size(), tabId);
            sqlResult = generateMigrationSqlWithAi(currentStructureJson, previousHistories, vendor);
            summaryNote = "Auto migration script following v" + latest.getVersionNo();
        } else {
            // No history -> Initial Full Schema Mode
            mode = "FULL";
            log.info("Generating Initial FULL DDL SQL for tab {}", tabId);
            sqlResult = generateSqlWithAi(request.getXml(), vendor);
            summaryNote = "Initial full schema DDL (v1)";
        }

        // Calculate next version number
        Integer nextVersion = 1;
        if (!previousHistories.isEmpty()) {
            nextVersion = previousHistories.get(0).getVersionNo() + 1;
        }

        String username = null;
        try {
            if (currentUserService != null) {
                username = currentUserService.getUsername();
            }
        } catch (Exception ignored) {}

        PmDiagramSqlHistory history = null;
        if (tabId != null && !tabId.isBlank()) {
            history = PmDiagramSqlHistory.builder()
                    .tabId(tabId)
                    .pageName(request.getPageName())
                    .versionNo(nextVersion)
                    .generationType(mode)
                    .vendor(vendor)
                    .engine(engine)
                    .summaryNote(summaryNote)
                    .schemaJson(currentStructureJson)
                    .generatedSql(sqlResult)
                    .createdBy(username)
                    .build();

            history = historyRepository.save(history);
        }

        AiGenerateSqlResponse response = new AiGenerateSqlResponse();
        response.setSql(sqlResult);
        response.setMessage("SQL generated and saved successfully.");
        response.setVersionNo(nextVersion);
        response.setHistoryId(history != null ? history.getId() : null);
        response.setSummaryNote(summaryNote);

        return response;
    }

    @Override
    public List<PmDiagramSqlHistory> getHistoryByTabId(String tabId) {
        if (tabId == null || tabId.isBlank()) {
            return List.of();
        }
        return historyRepository.findByTabIdOrderByVersionNoDesc(tabId);
    }

    private String buildSimplifiedJson(ErXmlParserServiceImpl.DatabaseModel model) {
        try {
            Map<String, Object> root = new HashMap<>();

            // Tables
            List<Map<String, Object>> tableList = model.tables.stream().map(table -> {
                Map<String, Object> tableMap = new HashMap<>();
                tableMap.put("name", table.name);

                List<Map<String, String>> colList = table.columns.stream().map(col -> {
                    Map<String, String> colMap = new HashMap<>();
                    colMap.put("name", col.name);
                    colMap.put("type", col.type != null ? col.type : "string");
                    if (col.isPrimaryKey) {
                        colMap.put("pk", "true");
                    }
                    return colMap;
                }).toList();

                tableMap.put("columns", colList);
                return tableMap;
            }).toList();
            root.put("tables", tableList);

            // Relations
            List<Map<String, String>> relList = model.relations.stream().map(rel -> {
                Map<String, String> relMap = new HashMap<>();
                relMap.put("from", rel.from);
                relMap.put("to", rel.to);
                return relMap;
            }).toList();
            root.put("relations", relList);

            return objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(root);
        } catch (Exception e) {
            log.error("Failed to build simplified JSON", e);
            return "{\"error\": \"Failed to parse structure\"}";
        }
    }

    /**
     * ดึง SQL ออกจาก Response ของ AI (รองรับ ```sql ... ``` หรือ ``` ... ```)
     */
    private String extractSql(String response) {
        if (response == null) return null;

        Matcher matcher = SQL_BLOCK_PATTERN.matcher(response);
        if (matcher.find()) {
            return matcher.group(1).trim();
        }

        if (response.toUpperCase().contains("CREATE TABLE") || response.toUpperCase().contains("ALTER TABLE")) {
            return response.trim();
        }

        return null;
    }
}
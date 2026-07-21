package com.softinter.sicapi.service.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.softinter.sicapi.service.AiSqlGeneratorService;
import com.softinter.sicapi.service.PmAiProviderService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiSqlGeneratorServiceImpl implements AiSqlGeneratorService {

    private final ErXmlParserServiceImpl parser = new ErXmlParserServiceImpl();
    private final PmAiProviderService aiProviderService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final Pattern SQL_BLOCK_PATTERN = Pattern.compile("```(?:sql)?\\s*([\\s\\S]*?)```", Pattern.MULTILINE);

    @Override
    public String generateSqlWithAi(String xml, String vendor) {
        // 1. ใช้ Parser ดึงโครงสร้าง
        ErXmlParserServiceImpl.DatabaseModel model = parser.parse(xml);

        if (model.tables == null || model.tables.isEmpty()) {
            throw new IllegalArgumentException("No tables found in the ER diagram. Please draw tables first.");
        }

        // 2. แปลงโครงสร้างเป็น JSON สั้นๆ เพื่อลด Token
        String structureJson = buildSimplifiedJson(model);

        log.info("Generated structure JSON ({} chars) for AI", structureJson.length());

        // 3. สร้าง Prompt (ระบุ vendor)
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
    8. Output **ONLY** the SQL code. No markdown, no backticks, no extra text.

    **Database Structure:**
    %s
    """, vendor, structureJson);

        // 4. เรียก AI
        String aiRawResponse = aiProviderService.generateResponse(prompt, "");

        // 5. Extract SQL จาก Response
        String extractedSql = extractSql(aiRawResponse);

        // 6. ถ้า extract ไม่ได้ ให้ใช้ response ทั้งหมด
        if (extractedSql == null || extractedSql.isBlank()) {
            log.warn("Could not extract SQL block, using raw response");
            extractedSql = aiRawResponse;
        }

        return extractedSql.trim();
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
            // Fallback: ส่ง XML บางส่วน
            return "{\"error\": \"Failed to parse structure\"}";
        }
    }

    /**
     * ดึง SQL ออกจาก Response ของ AI (รองรับ ```sql ... ``` หรือ ``` ... ```)
     */
    private String extractSql(String response) {
        if (response == null) return null;

        // ลบส่วนที่ไม่ใช่ SQL ทิ้ง (ถ้ามี markdown อื่น)
        Matcher matcher = SQL_BLOCK_PATTERN.matcher(response);
        if (matcher.find()) {
            return matcher.group(1).trim();
        }

        // ถ้าไม่มี code block แต่ข้อความดูเหมือน SQL (มี CREATE TABLE) ให้คืนทั้งหมด
        if (response.toUpperCase().contains("CREATE TABLE")) {
            return response.trim();
        }

        return null;
    }
}
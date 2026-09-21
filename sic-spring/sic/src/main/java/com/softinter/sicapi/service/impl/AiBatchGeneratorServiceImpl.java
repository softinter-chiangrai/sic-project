package com.softinter.sicapi.service.impl;

import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.softinter.sicapi.dto.request.AiBatchGenerateRequest;
import com.softinter.sicapi.dto.response.AiBatchGenerateResponse;
import com.softinter.sicapi.service.AiBatchGeneratorService;
import com.softinter.sicapi.service.AiModuleRegistry;
import com.softinter.sicapi.service.PmAiProviderService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiBatchGeneratorServiceImpl implements AiBatchGeneratorService {

    private final PmAiProviderService aiProviderService;
    private final AiModuleRegistry moduleRegistry;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final Pattern JSON_ARRAY_PATTERN = Pattern.compile("```json\\s*([\\s\\S]*?)```");
    private static final int MAX_COUNT = 30;

    @Override
    public AiBatchGenerateResponse generate(AiBatchGenerateRequest request) {
        AiModuleRegistry.ModuleDef def = moduleRegistry.get(request.getModuleType());
        if (def == null) {
            return AiBatchGenerateResponse.builder()
                    .moduleType(request.getModuleType())
                    .items(List.of())
                    .message("ไม่รู้จักโมดูล: " + request.getModuleType())
                    .build();
        }

        int count = request.getCount() != null && request.getCount() > 0
                ? Math.min(request.getCount(), MAX_COUNT)
                : 5;

        String systemPrompt = buildSystemPrompt(def, count);
        String userPrompt = request.getPrompt() != null && !request.getPrompt().isBlank()
                ? request.getPrompt()
                : "สร้างข้อมูลตัวอย่างที่สมเหตุสมผลสำหรับโมดูลนี้จำนวน " + count + " รายการ";

        try {
            String raw = aiProviderService.generateRawResponse(userPrompt, systemPrompt, request.getModel(), request.getAttachments());
            List<Map<String, Object>> items = parseItems(raw);
            return AiBatchGenerateResponse.builder()
                    .moduleType(def.getModuleType())
                    .items(items)
                    .message(items.isEmpty() ? "AI ไม่สามารถสร้างข้อมูลได้ กรุณาลองใหม่หรือปรับ Prompt" : null)
                    .build();
        } catch (Exception e) {
            log.error("AI batch generation failed for module {}", request.getModuleType(), e);
            return AiBatchGenerateResponse.builder()
                    .moduleType(def.getModuleType())
                    .items(List.of())
                    .message("เกิดข้อผิดพลาดขณะสร้างข้อมูล: " + e.getMessage())
                    .build();
        }
    }

    private String buildSystemPrompt(AiModuleRegistry.ModuleDef def, int count) {
        return """
                คุณคือ AI ผู้ช่วยสร้างข้อมูลชุด (Batch Create) สำหรับโมดูล "%s" ในระบบบริหารโครงการ SIC

                กติกาสำคัญ (Data Integrity - ห้ามฝ่าฝืน):
                1. คุณกำลังสร้าง "ข้อมูลใหม่" เพื่อเพิ่มเข้าระบบเท่านั้น (Append Only) ไม่มีการแก้ไขข้อมูลเดิมใดๆ
                2. ห้ามกำหนดค่าฟิลด์ที่เป็นรหัสระบบ (id, code, running number) ปล่อยเป็น null เสมอ ระบบจะสร้างให้เอง
                3. ตอบกลับเป็น JSON Array เท่านั้น ห้ามมีข้อความอื่นนอก ```json ``` block
                4. โครงสร้างของแต่ละ object ในอาเรย์ต้องตรงตาม schema นี้เป๊ะๆ:
                %s
                5. สร้างข้อมูลจำนวนประมาณ %d รายการ (หรือใกล้เคียงตามที่ผู้ใช้ระบุใน prompt) เนื้อหาสมจริง เป็นมืออาชีพ และสอดคล้องกับ prompt/ไฟล์แนบของผู้ใช้
                6. ถ้าผู้ใช้แนบไฟล์เอกสาร/รูปภาพมาด้วย ให้ใช้ข้อมูลจากไฟล์นั้นเป็นหลักในการสร้างรายการ
                7. ตอบข้อความในฟิลด์ต่างๆ เป็นภาษาเดียวกับที่ผู้ใช้พิมพ์ prompt (ถ้าผู้ใช้พิมพ์เป็นภาษาอังกฤษ ให้ตอบเป็นภาษาอังกฤษ / Respond in the same language as the user's prompt)
                """.formatted(def.getLabel(), def.getSchemaDescription(), count);
    }

    private List<Map<String, Object>> parseItems(String raw) {
        if (raw == null || raw.isBlank() || raw.trim().equals("{}")) {
            return List.of();
        }

        String jsonStr = raw;
        Matcher matcher = JSON_ARRAY_PATTERN.matcher(raw);
        if (matcher.find()) {
            jsonStr = matcher.group(1).trim();
        } else {
            int start = raw.indexOf('[');
            int end = raw.lastIndexOf(']');
            if (start >= 0 && end > start) {
                jsonStr = raw.substring(start, end + 1).trim();
            }
        }

        try {
            JsonNode root = objectMapper.readTree(jsonStr);
            if (!root.isArray()) {
                return List.of();
            }
            return objectMapper.convertValue(root, new TypeReference<List<Map<String, Object>>>() {
            });
        } catch (Exception e) {
            log.warn("Failed to parse batch-generate JSON array. Raw: {}", raw);
            return List.of();
        }
    }
}

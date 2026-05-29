package com.softinter.sicapi.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.softinter.sicapi.dto.request.DeleteMessageRequest;
import com.softinter.sicapi.dto.request.GetMessagesRequest;
import com.softinter.sicapi.dto.request.SaveMessageRequest;
import com.softinter.sicapi.dto.response.I18nMessageResponse;
import com.softinter.sicapi.entity.su.SuMessage;
import com.softinter.sicapi.repository.su.SuMessageRepository;

import java.time.Instant; // เปลี่ยนมาใช้ java.time.Instant
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final SuMessageRepository messageRepository;

    // ตรงกับ Select (GetMessages.Query)
    public List<SuMessage> select(GetMessagesRequest request) {
        // TODO: เพิ่มเงื่อนไข Filter ตาม Field ใน request ถ้ามี
        return messageRepository.findByIsDeleteFalse();
    }

    // ตรงกับ Save (SaveMessage.Command)
    @Transactional
    public UUID save(SaveMessageRequest request) {
        SuMessage entity;

        if (request.getId() != null) {
            entity = messageRepository.findByIdAndIsDeleteFalse(request.getId())
                    .orElse(null);
            if (entity == null) {
                return null; // คืนค่า null เพื่อให้ Controller return 404 (NotFound)
            }
            entity.setUpdatedBy(request.getUpdatedBy());
            // [ลบออก] entity.setUpdatedDate(...) -> ปล่อยให้ @LastModifiedDate จัดการอัตโนมัติ
        } else {
            entity = new SuMessage();
            entity.setId(UUID.randomUUID());
            entity.setCreatedBy(request.getCreatedBy());
            // [ลบออก] entity.setCreatedDate(...) -> ปล่อยให้ @CreatedDate จัดการอัตโนมัติ
            entity.setIsDelete(false);
        }

        entity.setModuleCode(request.getModuleCode());
        entity.setProgramCode(request.getProgramCode());
        entity.setMessageCode(request.getMessageCode());
        entity.setMessageEn(request.getMessageEn());
        entity.setMessageLocal(request.getMessageLocal());
        entity.setIsActive(request.getIsActive());

        messageRepository.save(entity);
        return entity.getId();
    }

    // ตรงกับ Delete (DeleteMessage.Command) — Soft Delete ตามโครงสร้าง DB
    @Transactional
    public boolean delete(UUID id, DeleteMessageRequest request) {
        SuMessage entity = messageRepository.findByIdAndIsDeleteFalse(id)
                .orElse(null);

        if (entity == null) {
            return false;
        }

        entity.setIsDelete(true);
        entity.setDeleteBy(request.getDeleteBy());
        entity.setDeleteDate(Instant.now()); // เปลี่ยนเป็น Instant.now() สำหรับการลบแบบแมนนวล
        messageRepository.save(entity);
        return true;
    }

    // ตรงกับ I18n (GetI18NMessages.Query)
    public List<I18nMessageResponse> getI18nMessages(String moduleCode, String programCode, String languageCode) {
        List<SuMessage> messages = messageRepository
                .findByModuleCodeAndProgramCodeAndIsDeleteFalse(moduleCode, programCode);

        return messages.stream().map(msg -> {
            String text;
            if ("en".equalsIgnoreCase(languageCode)) {
                text = msg.getMessageEn();
            } else if ("local".equalsIgnoreCase(languageCode) || "th".equalsIgnoreCase(languageCode)) {
                text = msg.getMessageLocal();
            } else {
                text = msg.getMessageEn(); // Default เป็นภาษาอังกฤษ
            }

            return I18nMessageResponse.builder()
                    .messageCode(msg.getMessageCode())
                    .message(text)
                    .build();

        }).collect(Collectors.toList());
    }
}
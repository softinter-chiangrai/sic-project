package com.softinter.sicapi.controller.su;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.softinter.sicapi.dto.request.DeleteMessageRequest;
import com.softinter.sicapi.dto.request.GetMessagesRequest;
import com.softinter.sicapi.dto.request.SaveMessageRequest;
import com.softinter.sicapi.dto.response.I18nMessageResponse;
import com.softinter.sicapi.entity.su.SuMessage;
import com.softinter.sicapi.service.MessageService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @GetMapping("/api/su/messages")
    public ResponseEntity<List<SuMessage>> select(@ModelAttribute GetMessagesRequest request) {
        return ResponseEntity.ok(messageService.select(request));
    }

    @PostMapping("/api/su/messages/save")
    public ResponseEntity<UUID> save(@RequestBody SaveMessageRequest request) {
        UUID id = messageService.save(request);
        if (id == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(id);
    }

    @DeleteMapping("/api/su/messages/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID id,
            @RequestBody DeleteMessageRequest request) {
        boolean deleted = messageService.delete(id, request);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    @GetMapping({
    "/api/i18n/{module_code}/{program_code}",
    "/api/i18n/{module_code}/{program_code}/{language_code}"
})
public ResponseEntity<Map<String, String>> i18n(
        @PathVariable("module_code") String moduleCode,
        @PathVariable("program_code") String programCode,
        @PathVariable(value = "language_code", required = false) String languageCode,
        @RequestHeader(value = "x-language-code", required = false) String headerLangCode) {

    String finalLang = (languageCode != null) ? languageCode : headerLangCode;

    List<I18nMessageResponse> messages = messageService.getI18nMessages(moduleCode, programCode, finalLang);

    Map<String, String> translations = new HashMap<>();
    for (I18nMessageResponse msg : messages) {
        String key = moduleCode + "." + programCode + "." + msg.getMessageCode();
        translations.put(key, msg.getMessage());
    }

    return ResponseEntity.ok(translations);
}
}
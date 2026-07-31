package com.softinter.sicapi.controller.pm;

import com.softinter.sicapi.dto.response.EditSessionResponse;
import com.softinter.sicapi.service.EditSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/pm/edit-sessions")
@RequiredArgsConstructor
public class PmEditSessionController {

    private final EditSessionService editSessionService;

    @GetMapping("/check")
    public ResponseEntity<EditSessionResponse> checkLock(
            @RequestParam String targetType,
            @RequestParam UUID targetId) {
        EditSessionResponse session = editSessionService.getActiveEditSession(targetType, targetId);
        return ResponseEntity.ok(session);
    }

    @PostMapping("/close")
    public ResponseEntity<Void> close(
            @RequestParam String targetType,
            @RequestParam UUID targetId) {
        editSessionService.closeEditSession(targetType, targetId);
        return ResponseEntity.noContent().build();
    }
}
package com.softinter.sicapi.controller.su;
import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.softinter.sicapi.dto.request.CreateInviteRequest;
import com.softinter.sicapi.dto.request.JoinBusinessRequest;
import com.softinter.sicapi.dto.response.ComboboxResponse;
import com.softinter.sicapi.dto.response.InviteResponse;
import com.softinter.sicapi.dto.response.JoinBusinessResponse;
import com.softinter.sicapi.service.BusinessInviteService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/business")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Business Invite", description = "Business Invite Management API")
public class SuBusinessInviteController {
     private final BusinessInviteService businessInviteService;

    // GET /api/business/invite
    @GetMapping("/invite")
    @Operation(summary = "Get all invites for current business")
    public ResponseEntity<List<InviteResponse>> getInvites() {
        return ResponseEntity.ok(businessInviteService.getInvites());
    }

    // POST /api/business/invite
    @PostMapping("/invite")
    @Operation(summary = "Create new invite")
    public ResponseEntity<UUID> createInvite(@Valid @RequestBody CreateInviteRequest request) {
        return ResponseEntity.ok(businessInviteService.createInvite(request));
    }

    // DELETE /api/business/invite/{id}
    @DeleteMapping("/invite/{id}")
    @Operation(summary = "Delete/revoke invite")
    public ResponseEntity<Void> deleteInvite(@PathVariable UUID id) {
        businessInviteService.deleteInvite(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/join")
    @Operation(summary = "Join business using invite token")
    public ResponseEntity<JoinBusinessResponse> joinBusiness(@Valid @RequestBody JoinBusinessRequest request) {
        return ResponseEntity.ok(businessInviteService.joinBusiness(request.getToken()));
    }


    
}

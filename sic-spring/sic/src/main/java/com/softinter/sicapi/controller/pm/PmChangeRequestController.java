package com.softinter.sicapi.controller.pm;

import com.softinter.sicapi.dto.request.ChangeRequestRequest;
import com.softinter.sicapi.dto.response.ChangeRequestResponse;
import com.softinter.sicapi.dto.response.PaginationResponse;
import com.softinter.sicapi.entity.pm.PmRequirementChangeRequest;
import com.softinter.sicapi.service.ChangeRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.persistence.criteria.Predicate;
import jakarta.validation.Valid;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/pm/change-requests")
@RequiredArgsConstructor
public class PmChangeRequestController {

    private final ChangeRequestService changeRequestService;

    // ===== LIST (Paging + Filter) =====
    @GetMapping
    public ResponseEntity<PaginationResponse<ChangeRequestResponse>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status) {

        Specification<PmRequirementChangeRequest> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isFalse(root.get("isDelete")));

            if (keyword != null && !keyword.isBlank()) {
                String pattern = "%" + keyword.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("changeDescription")), pattern),
                        cb.like(cb.lower(root.get("requirement").get("title")), pattern)
                ));
            }
            if (status != null && !status.isBlank() && !"all".equals(status)) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return ResponseEntity.ok(changeRequestService.getChangeRequests(spec, page, size));
    }

    // ===== GET BY ID =====
    @GetMapping("/{id}")
    public ResponseEntity<ChangeRequestResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(changeRequestService.getChangeRequestById(id));
    }

    // ===== CREATE =====
    @PostMapping
    public ResponseEntity<UUID> create(@Valid @RequestBody ChangeRequestRequest request) {
        UUID id = changeRequestService.createChangeRequest(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(id);
    }

    // ===== UPDATE =====
    @PutMapping("/{id}")
    public ResponseEntity<UUID> update(@PathVariable UUID id, @Valid @RequestBody ChangeRequestRequest request) {
        UUID updatedId = changeRequestService.updateChangeRequest(id, request);
        return ResponseEntity.ok(updatedId);
    }

    // ===== SOFT DELETE =====
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        changeRequestService.deleteChangeRequest(id);
        return ResponseEntity.noContent().build();
    }
}
package spring.sic.profile.su.su_business_audit;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/su-business-audits")
@RequiredArgsConstructor
public class SuBusinessAuditController {

    private final SuBusinessAuditService service;

    @GetMapping
    public ResponseEntity<List<SuBusinessAuditModel>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SuBusinessAuditModel> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    public ResponseEntity<SuBusinessAuditModel> create(@RequestBody SuBusinessAuditModel model) {
        return ResponseEntity.ok(service.create(model));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SuBusinessAuditModel> update(@PathVariable UUID id, @RequestBody SuBusinessAuditModel model) {
        return ResponseEntity.ok(service.update(id, model));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
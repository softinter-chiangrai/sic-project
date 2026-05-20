package spring.sic.profile.su.su_business_role;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/su-business-roles")
@RequiredArgsConstructor
public class SuBusinessRoleController {

    private final SuBusinessRoleService service;

    @GetMapping
    public ResponseEntity<List<SuBusinessRoleModel>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SuBusinessRoleModel> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    public ResponseEntity<SuBusinessRoleModel> create(@RequestBody SuBusinessRoleModel model) {
        return ResponseEntity.ok(service.create(model));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SuBusinessRoleModel> update(@PathVariable UUID id, @RequestBody SuBusinessRoleModel model) {
        return ResponseEntity.ok(service.update(id, model));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

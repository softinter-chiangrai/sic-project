package spring.sic.profile.su.su_user_business_role;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/su-user-business-roles")
@RequiredArgsConstructor
public class SuUserBusinessRoleController {

    private final SuUserBusinessRoleService service;

    @GetMapping
    public ResponseEntity<List<SuUserBusinessRoleModel>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SuUserBusinessRoleModel> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    public ResponseEntity<SuUserBusinessRoleModel> create(@RequestBody SuUserBusinessRoleModel model) {
        return ResponseEntity.ok(service.create(model));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SuUserBusinessRoleModel> update(@PathVariable UUID id, @RequestBody SuUserBusinessRoleModel model) {
        return ResponseEntity.ok(service.update(id, model));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
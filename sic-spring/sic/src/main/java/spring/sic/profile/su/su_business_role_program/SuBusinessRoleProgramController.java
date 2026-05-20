package spring.sic.profile.su.su_business_role_program;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/su-business-role-programs")
@RequiredArgsConstructor
public class SuBusinessRoleProgramController {

    private final SuBusinessRoleProgramService service;

    @GetMapping
    public ResponseEntity<List<SuBusinessRoleProgramModel>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SuBusinessRoleProgramModel> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    public ResponseEntity<SuBusinessRoleProgramModel> create(@RequestBody SuBusinessRoleProgramModel model) {
        return ResponseEntity.ok(service.create(model));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SuBusinessRoleProgramModel> update(@PathVariable UUID id, @RequestBody SuBusinessRoleProgramModel model) {
        return ResponseEntity.ok(service.update(id, model));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
package spring.sic.profile.su.su_task;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/su-tasks")
@RequiredArgsConstructor
public class SuTaskController {

    private final SuTaskService service;

    @GetMapping
    public ResponseEntity<List<SuTaskModel>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SuTaskModel> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    public ResponseEntity<SuTaskModel> create(@RequestBody SuTaskModel model) {
        return ResponseEntity.ok(service.create(model));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SuTaskModel> update(@PathVariable UUID id, @RequestBody SuTaskModel model) {
        return ResponseEntity.ok(service.update(id, model));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

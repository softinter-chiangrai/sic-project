package spring.sic.profile.address.db_sub_district;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/sub-districts")
@RequiredArgsConstructor
public class DbSubDistrictController {

    private final DbSubDistrictService service;

    @GetMapping
    public ResponseEntity<List<DbSubDistrictModel>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DbSubDistrictModel> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    public ResponseEntity<DbSubDistrictModel> create(@RequestBody DbSubDistrictModel model) {
        return ResponseEntity.ok(service.create(model));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DbSubDistrictModel> update(@PathVariable UUID id, @RequestBody DbSubDistrictModel model) {
        return ResponseEntity.ok(service.update(id, model));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
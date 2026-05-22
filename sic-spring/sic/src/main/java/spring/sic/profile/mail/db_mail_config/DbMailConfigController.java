package spring.sic.profile.mail.db_mail_config;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/mail-configs")
public class DbMailConfigController {

    private final DbMailConfigService service;

    @GetMapping
    public ResponseEntity<List<DbMailConfigModel>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DbMailConfigModel> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    public ResponseEntity<DbMailConfigModel> create(@RequestBody DbMailConfigModel model) {
        return ResponseEntity.ok(service.create(model));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DbMailConfigModel> update(@PathVariable UUID id, @RequestBody DbMailConfigModel model) {
        return ResponseEntity.ok(service.update(id, model));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
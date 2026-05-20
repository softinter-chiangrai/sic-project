package spring.sic.mail.db_mail_template;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/mail-templates")
@RequiredArgsConstructor
public class DbMailTemplateController {

    private final DbMailTemplateService service;

    @GetMapping
    public ResponseEntity<List<DbMailTemplateModel>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DbMailTemplateModel> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    public ResponseEntity<DbMailTemplateModel> create(@RequestBody DbMailTemplateModel model) {
        return ResponseEntity.ok(service.create(model));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DbMailTemplateModel> update(@PathVariable UUID id, @RequestBody DbMailTemplateModel model) {
        return ResponseEntity.ok(service.update(id, model));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
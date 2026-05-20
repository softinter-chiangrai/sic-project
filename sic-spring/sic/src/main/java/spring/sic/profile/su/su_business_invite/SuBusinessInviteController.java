package spring.sic.profile.su.su_business_invite;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/su-business-invites")
@RequiredArgsConstructor
public class SuBusinessInviteController {

    private final SuBusinessInviteService service;

    @GetMapping
    public ResponseEntity<List<SuBusinessInviteModel>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SuBusinessInviteModel> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    public ResponseEntity<SuBusinessInviteModel> create(@RequestBody SuBusinessInviteModel model) {
        return ResponseEntity.ok(service.create(model));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SuBusinessInviteModel> update(@PathVariable UUID id, @RequestBody SuBusinessInviteModel model) {
        return ResponseEntity.ok(service.update(id, model));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
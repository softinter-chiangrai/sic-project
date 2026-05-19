// Controller: DbMailConfigController.java (เวอร์ชันที่ถูกต้อง ปรับให้ใช้ Model)
package spring.sic.controller;

import spring.sic.model.DbMailConfigModel;
import spring.sic.service.DbMailConfigService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/mail-configs")
@RequiredArgsConstructor
public class DbMailConfigController {

    private final DbMailConfigService configService;  // แก้จาก DbMailConfigController เป็น configService

    // สร้าง configuration ใหม่
    @PostMapping
    public ResponseEntity<DbMailConfigModel> create(
            @Valid @RequestBody DbMailConfigModel model,
            @RequestHeader(value = "X-Username", defaultValue = "system") String username) {
        
        DbMailConfigModel created = configService.create(model, username);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // อัปเดต configuration
    @PutMapping("/{id}")
    public ResponseEntity<DbMailConfigModel> update(
            @PathVariable Long id,
            @Valid @RequestBody DbMailConfigModel model,
            @RequestHeader(value = "X-Username", defaultValue = "system") String username) {
        
        DbMailConfigModel updated = configService.update(id, model, username);
        return ResponseEntity.ok(updated);
    }

    // ดึงรายการทั้งหมด (แบบ Page)
    @GetMapping
    public ResponseEntity<Page<DbMailConfigModel>> getAll(
            @PageableDefault(size = 20, sort = "sortOrder", direction = Sort.Direction.ASC) Pageable pageable) {
        
        Page<DbMailConfigModel> responsePage = configService.findAll(pageable);
        return ResponseEntity.ok(responsePage);
    }

    // ดึงรายการทั้งหมด (แบบ List)
    @GetMapping("/list")
    public ResponseEntity<List<DbMailConfigModel>> getAllList() {
        List<DbMailConfigModel> responses = configService.findAll();
        return ResponseEntity.ok(responses);
    }

    // ดึงข้อมูลตาม id
    @GetMapping("/{id}")
    public ResponseEntity<DbMailConfigModel> getById(@PathVariable Long id) {
        return configService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Soft delete
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @RequestHeader(value = "X-Username", defaultValue = "system") String username) {
        
        if (configService.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        configService.softDelete(id, username);
        return ResponseEntity.noContent().build();
    }

    // Hard delete (ระวังในการใช้งานจริง)
    @DeleteMapping("/{id}/hard")
    public ResponseEntity<Void> hardDelete(@PathVariable Long id) {
        if (configService.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        configService.hardDelete(id);
        return ResponseEntity.noContent().build();
    }

    // ดึงเฉพาะ config ที่ active
    @GetMapping("/active")
    public ResponseEntity<List<DbMailConfigModel>> getActiveConfigs() {
        List<DbMailConfigModel> responses = configService.findActiveConfigs();
        return ResponseEntity.ok(responses);
    }

    // ดึง default config (อันแรกที่ active)
    @GetMapping("/default")
    public ResponseEntity<DbMailConfigModel> getDefaultConfig() {
        return configService.getDefaultConfig()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ค้นหาตามชื่อ config
    @GetMapping("/search")
    public ResponseEntity<DbMailConfigModel> searchByName(@RequestParam String configName) {
        return configService.findByConfigName(configName)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // เปิด/ปิดการใช้งาน config
    @PatchMapping("/{id}/toggle-active")
    public ResponseEntity<Void> toggleActive(
            @PathVariable Long id,
            @RequestHeader(value = "X-Username", defaultValue = "system") String username) {
        
        if (configService.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        configService.toggleActive(id, username);
        return ResponseEntity.ok().build();
    }
}
// Service: DbMailConfigService.java (เวอร์ชันที่ถูกต้อง ปรับทั้งหมด)
package spring.sic.service;

import spring.sic.entity.DbMailConfigEntity;
import spring.sic.model.DbMailConfigModel;
import spring.sic.repository.DbMailConfigRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DbMailConfigService {

    private final DbMailConfigRepository configRepository;

    // ===== Private Mapping Methods =====
    
    // แปลง Model -> Entity (สำหรับ Create)
    private DbMailConfigEntity toEntityForCreate(DbMailConfigModel model) {
        return DbMailConfigEntity.builder()
                .configName(model.getConfigName())
                .smtpServer(model.getSmtpServer())
                .smtpPort(model.getSmtpPort())
                .emailFrom(model.getEmailFrom())
                .username(model.getUsername())
                .password(model.getPassword())
                .enableSsl(model.getEnableSsl())
                .sortOrder(model.getSortOrder())
                .isActive(model.getIsActive())
                .maxRetry(model.getMaxRetry())
                .description(model.getDescription())
                .build();
    }
    
    // อัปเดต Entity จาก Model (สำหรับ Update)
    private void updateEntity(DbMailConfigEntity entity, DbMailConfigModel model) {
        entity.setConfigName(model.getConfigName());
        entity.setSmtpServer(model.getSmtpServer());
        entity.setSmtpPort(model.getSmtpPort());
        entity.setEmailFrom(model.getEmailFrom());
        entity.setUsername(model.getUsername());
        
        // อัปเดต password เฉพาะตอนที่มีการส่งมา
        if (model.getPassword() != null && !model.getPassword().isEmpty()) {
            entity.setPassword(model.getPassword());
        }
        
        entity.setEnableSsl(model.getEnableSsl());
        entity.setSortOrder(model.getSortOrder());
        entity.setIsActive(model.getIsActive());
        entity.setMaxRetry(model.getMaxRetry());
        entity.setDescription(model.getDescription());
    }
    
    // แปลง Entity -> Model
    private DbMailConfigModel toModel(DbMailConfigEntity entity) {
        if (entity == null) {
            return null;
        }
        
        return DbMailConfigModel.builder()
                .id(entity.getId())
                .configName(entity.getConfigName())
                .smtpServer(entity.getSmtpServer())
                .smtpPort(entity.getSmtpPort())
                .emailFrom(entity.getEmailFrom())
                .username(entity.getUsername())
                .enableSsl(entity.getEnableSsl())
                .sortOrder(entity.getSortOrder())
                .isActive(entity.getIsActive())
                .maxRetry(entity.getMaxRetry())
                .description(entity.getDescription())
                .createdBy(entity.getCreatedBy())
                .createdDate(entity.getCreatedDate())
                .updatedBy(entity.getUpdatedBy())
                .updatedDate(entity.getUpdatedDate())
                .build();
    }

    // ===== Public Methods =====

    // สร้าง configuration ใหม่
    @Transactional
    public DbMailConfigModel create(DbMailConfigModel model, String createdBy) {
        DbMailConfigEntity entity = toEntityForCreate(model);
        entity.setCreatedBy(createdBy);
        entity.setCreatedDate(LocalDateTime.now());
        entity.setUpdatedBy(createdBy);
        entity.setUpdatedDate(LocalDateTime.now());
        entity.setIsDelete(false);
        
        // ตรวจสอบชื่อซ้ำ
        if (configRepository.findByConfigNameAndIsDeleteFalse(model.getConfigName()).isPresent()) {
            throw new RuntimeException("Config name already exists: " + model.getConfigName());
        }
        
        DbMailConfigEntity saved = configRepository.save(entity);
        log.info("Created mail config: {} by {}", saved.getConfigName(), createdBy);
        return toModel(saved);
    }

    // อัปเดต configuration
    @Transactional
    public DbMailConfigModel update(Long id, DbMailConfigModel model, String updatedBy) {
        DbMailConfigEntity existing = configRepository.findByIdAndIsDeleteFalse(id)
                .orElseThrow(() -> new RuntimeException("Config not found with id: " + id));
        
        // ตรวจสอบชื่อซ้ำ (ยกเว้นตัวเอง)
        Optional<DbMailConfigEntity> duplicate = configRepository.findByConfigNameAndIsDeleteFalse(model.getConfigName());
        if (duplicate.isPresent() && !duplicate.get().getId().equals(id)) {
            throw new RuntimeException("Config name already exists: " + model.getConfigName());
        }
        
        updateEntity(existing, model);
        existing.setUpdatedBy(updatedBy);
        existing.setUpdatedDate(LocalDateTime.now());
        
        DbMailConfigEntity updated = configRepository.save(existing);
        log.info("Updated mail config: {} by {}", updated.getConfigName(), updatedBy);
        return toModel(updated);
    }

    // ค้นหาทั้งหมด (ไม่รวมที่ถูกลบ)
    public List<DbMailConfigModel> findAll() {
        return configRepository.findByIsDeleteFalse().stream()
                .map(this::toModel)
                .collect(Collectors.toList());
    }
    
    // ค้นหาแบบ Page
    public Page<DbMailConfigModel> findAll(Pageable pageable) {
        return configRepository.findByIsDeleteFalse(pageable)
                .map(this::toModel);
    }

    // ค้นหาตาม id
    public Optional<DbMailConfigModel> findById(Long id) {
        return configRepository.findByIdAndIsDeleteFalse(id)
                .map(this::toModel);
    }

    // Soft delete
    @Transactional
    public void softDelete(Long id, String deletedBy) {
        DbMailConfigEntity config = configRepository.findByIdAndIsDeleteFalse(id)
                .orElseThrow(() -> new RuntimeException("Config not found with id: " + id));
        
        configRepository.softDeleteById(id, deletedBy, LocalDateTime.now());
        log.info("Soft deleted mail config: {} by {}", config.getConfigName(), deletedBy);
    }

    // Hard delete (ลบจริง - ใช้ด้วยความระมัดระวัง)
    @Transactional
    public void hardDelete(Long id) {
        DbMailConfigEntity config = configRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Config not found with id: " + id));
        configRepository.delete(config);
        log.warn("Hard deleted mail config: {}", config.getConfigName());
    }

    // ค้นหาเฉพาะ config ที่ active
    public List<DbMailConfigModel> findActiveConfigs() {
        return configRepository.findByIsActiveTrueAndIsDeleteFalse().stream()
                .map(this::toModel)
                .collect(Collectors.toList());
    }
    
    // ค้นหา active config เรียงตาม sort_order
    public List<DbMailConfigModel> findActiveConfigsSorted() {
        return configRepository.findByIsActiveTrueAndIsDeleteFalseOrderBySortOrderAsc().stream()
                .map(this::toModel)
                .collect(Collectors.toList());
    }

    // ดึง default config (active ลำดับแรก)
    public Optional<DbMailConfigModel> getDefaultConfig() {
        return configRepository.findFirstActiveConfig()
                .map(this::toModel);
    }

    // ค้นหาตามชื่อ config
    public Optional<DbMailConfigModel> findByConfigName(String configName) {
        return configRepository.findByConfigNameAndIsDeleteFalse(configName)
                .map(this::toModel);
    }
    
    // เปิด/ปิดการใช้งาน config
    @Transactional
    public void toggleActive(Long id, String updatedBy) {
        DbMailConfigEntity config = configRepository.findByIdAndIsDeleteFalse(id)
                .orElseThrow(() -> new RuntimeException("Config not found with id: " + id));
        config.setIsActive(!config.getIsActive());
        config.setUpdatedBy(updatedBy);
        config.setUpdatedDate(LocalDateTime.now());
        configRepository.save(config);
        log.info("Toggled active status of config: {} to {} by {}", 
                 config.getConfigName(), config.getIsActive(), updatedBy);
    }
}
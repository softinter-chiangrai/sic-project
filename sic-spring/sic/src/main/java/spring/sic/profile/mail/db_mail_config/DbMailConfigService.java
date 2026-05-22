package spring.sic.profile.mail.db_mail_config;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DbMailConfigService {

    private final DbMailConfigRepository repository;

    public List<DbMailConfigModel> getAll() {
        return repository.findAll().stream()
                .map(this::toModel)
                .collect(Collectors.toList());
    }

    public DbMailConfigModel getById(UUID id) {
        DbMailConfigEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("DbMailConfig not found with id: " + id));
        return toModel(entity);
    }

    @Transactional
    public DbMailConfigModel create(DbMailConfigModel model) {
        DbMailConfigEntity entity = new DbMailConfigEntity();
        copyToEntity(model, entity);
        entity.setCreatedDate(OffsetDateTime.now());
        entity.setIsDelete(false);
        DbMailConfigEntity saved = repository.save(entity);
        return toModel(saved);
    }

    @Transactional
    public DbMailConfigModel update(UUID id, DbMailConfigModel model) {
        DbMailConfigEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("DbMailConfig not found with id: " + id));
        copyToEntity(model, entity);
        entity.setUpdatedDate(OffsetDateTime.now());
        DbMailConfigEntity updated = repository.save(entity);
        return toModel(updated);
    }

    @Transactional
    public void delete(UUID id) {
        DbMailConfigEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("DbMailConfig not found with id: " + id));
        entity.setIsDelete(true);
        entity.setDeleteDate(OffsetDateTime.now());
        repository.save(entity);
    }

    private DbMailConfigModel toModel(DbMailConfigEntity entity) {
        DbMailConfigModel model = new DbMailConfigModel();
        model.setId(entity.getId());
        model.setConfigName(entity.getConfigName());
        model.setSmtpServer(entity.getSmtpServer());
        model.setSmtpPort(entity.getSmtpPort());
        model.setSslType(entity.getSslType());
        model.setUsername(entity.getUsername());
        model.setPassword(entity.getPassword());
        model.setEnableSsl(entity.getEnableSsl());
        model.setStatus(entity.getStatus());
        model.setSortOrder(entity.getSortOrder());
        model.setIsActive(entity.getIsActive());
        model.setMaxRetry(entity.getMaxRetry());
        model.setDescription(entity.getDescription());
        model.setCreatedBy(entity.getCreatedBy());
        model.setCreatedDate(entity.getCreatedDate());
        model.setUpdatedBy(entity.getUpdatedBy());
        model.setUpdatedDate(entity.getUpdatedDate());
        model.setIsDelete(entity.getIsDelete());
        model.setDeleteBy(entity.getDeleteBy());
        model.setDeleteDate(entity.getDeleteDate());
        return model;
    }

    private void copyToEntity(DbMailConfigModel model, DbMailConfigEntity entity) {
        entity.setConfigName(model.getConfigName());
        entity.setSmtpServer(model.getSmtpServer());
        entity.setSmtpPort(model.getSmtpPort());
        entity.setSslType(model.getSslType());
        entity.setUsername(model.getUsername());
        entity.setPassword(model.getPassword());
        entity.setEnableSsl(model.getEnableSsl());
        entity.setStatus(model.getStatus());
        entity.setSortOrder(model.getSortOrder());
        entity.setIsActive(model.getIsActive());
        entity.setMaxRetry(model.getMaxRetry());
        entity.setDescription(model.getDescription());
        entity.setCreatedBy(model.getCreatedBy());
        entity.setUpdatedBy(model.getUpdatedBy());
        entity.setDeleteBy(model.getDeleteBy());
    }
}
package spring.sic.mail.db_mail_template;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DbMailTemplateService {

    private final DbMailTemplateRepository repository;

    public List<DbMailTemplateModel> getAll() {
        return repository.findAll().stream()
                .map(this::toModel)
                .collect(Collectors.toList());
    }

    public DbMailTemplateModel getById(UUID id) {
        DbMailTemplateEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("DbMailTemplate not found with id: " + id));
        return toModel(entity);
    }

    @Transactional
    public DbMailTemplateModel create(DbMailTemplateModel model) {
        DbMailTemplateEntity entity = new DbMailTemplateEntity();
        copyToEntity(model, entity);
        entity.setCreatedDate(OffsetDateTime.now());
        entity.setIsDelete(false);
        DbMailTemplateEntity saved = repository.save(entity);
        return toModel(saved);
    }

    @Transactional
    public DbMailTemplateModel update(UUID id, DbMailTemplateModel model) {
        DbMailTemplateEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("DbMailTemplate not found with id: " + id));
        copyToEntity(model, entity);
        entity.setUpdatedDate(OffsetDateTime.now());
        DbMailTemplateEntity updated = repository.save(entity);
        return toModel(updated);
    }

    @Transactional
    public void delete(UUID id) {
        DbMailTemplateEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("DbMailTemplate not found with id: " + id));
        entity.setIsDelete(true);
        entity.setDeleteDate(OffsetDateTime.now());
        repository.save(entity);
    }

    private DbMailTemplateModel toModel(DbMailTemplateEntity entity) {
        DbMailTemplateModel model = new DbMailTemplateModel();
        model.setId(entity.getId());
        model.setTemplateCode(entity.getTemplateCode());
        model.setTemplateName(entity.getTemplateName());
        model.setSubjectEn(entity.getSubjectEn());
        model.setSubjectLocal(entity.getSubjectLocal());
        model.setContentEn(entity.getContentEn());
        model.setContentLocal(entity.getContentLocal());
        model.setStatus(entity.getStatus());
        model.setIsActive(entity.getIsActive());
        model.setVariables(entity.getVariables());
        model.setCreatedBy(entity.getCreatedBy());
        model.setCreatedDate(entity.getCreatedDate());
        model.setUpdatedBy(entity.getUpdatedBy());
        model.setUpdatedDate(entity.getUpdatedDate());
        model.setIsDelete(entity.getIsDelete());
        model.setDeleteBy(entity.getDeleteBy());
        model.setDeleteDate(entity.getDeleteDate());
        return model;
    }

    private void copyToEntity(DbMailTemplateModel model, DbMailTemplateEntity entity) {
        entity.setTemplateCode(model.getTemplateCode());
        entity.setTemplateName(model.getTemplateName());
        entity.setSubjectEn(model.getSubjectEn());
        entity.setSubjectLocal(model.getSubjectLocal());
        entity.setContentEn(model.getContentEn());
        entity.setContentLocal(model.getContentLocal());
        entity.setStatus(model.getStatus());
        entity.setIsActive(model.getIsActive());
        entity.setVariables(model.getVariables());
        entity.setCreatedBy(model.getCreatedBy());
        entity.setUpdatedBy(model.getUpdatedBy());
        entity.setDeleteBy(model.getDeleteBy());
    }
}
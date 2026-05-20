package spring.sic.mail.db_mail_queue;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DbMailQueueService {

    private final DbMailQueueRepository repository;

    public List<DbMailQueueModel> getAll() {
        return repository.findAll().stream()
                .map(this::toModel)
                .collect(Collectors.toList());
    }

    public DbMailQueueModel getById(UUID id) {
        DbMailQueueEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("DbMailQueue not found with id: " + id));
        return toModel(entity);
    }

    @Transactional
    public DbMailQueueModel create(DbMailQueueModel model) {
        DbMailQueueEntity entity = new DbMailQueueEntity();
        copyToEntity(model, entity);
        entity.setCreatedDate(OffsetDateTime.now());
        entity.setIsDelete(false);
        DbMailQueueEntity saved = repository.save(entity);
        return toModel(saved);
    }

    @Transactional
    public DbMailQueueModel update(UUID id, DbMailQueueModel model) {
        DbMailQueueEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("DbMailQueue not found with id: " + id));
        copyToEntity(model, entity);
        entity.setUpdatedDate(OffsetDateTime.now());
        DbMailQueueEntity updated = repository.save(entity);
        return toModel(updated);
    }

    @Transactional
    public void delete(UUID id) {
        DbMailQueueEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("DbMailQueue not found with id: " + id));
        entity.setIsDelete(true);
        entity.setDeleteDate(OffsetDateTime.now());
        repository.save(entity);
    }

    private DbMailQueueModel toModel(DbMailQueueEntity entity) {
        DbMailQueueModel model = new DbMailQueueModel();
        model.setId(entity.getId());
        model.setTemplateId(entity.getTemplateId());
        model.setRecipientEmail(entity.getRecipientEmail());
        model.setRecipientName(entity.getRecipientName());
        model.setBodyData(entity.getBodyData());
        model.setSentAt(entity.getSentAt());
        model.setRetryCount(entity.getRetryCount());
        model.setErrorMessage(entity.getErrorMessage());
        model.setScheduledAt(entity.getScheduledAt());
        model.setCreatedDate(entity.getCreatedDate());
        model.setNextRetryAt(entity.getNextRetryAt());
        model.setUserConfigId(entity.getUserConfigId());
        model.setUseEnglish(entity.getUseEnglish());
        model.setCreatedBy(entity.getCreatedBy());
        model.setUpdatedBy(entity.getUpdatedBy());
        model.setUpdatedDate(entity.getUpdatedDate());
        model.setIsDelete(entity.getIsDelete());
        model.setDeleteBy(entity.getDeleteBy());
        model.setDeleteDate(entity.getDeleteDate());
        return model;
    }

    private void copyToEntity(DbMailQueueModel model, DbMailQueueEntity entity) {
        entity.setTemplateId(model.getTemplateId());
        entity.setRecipientEmail(model.getRecipientEmail());
        entity.setRecipientName(model.getRecipientName());
        entity.setBodyData(model.getBodyData());
        entity.setSentAt(model.getSentAt());
        entity.setRetryCount(model.getRetryCount());
        entity.setErrorMessage(model.getErrorMessage());
        entity.setScheduledAt(model.getScheduledAt());
        entity.setNextRetryAt(model.getNextRetryAt());
        entity.setUserConfigId(model.getUserConfigId());
        entity.setUseEnglish(model.getUseEnglish());
        entity.setCreatedBy(model.getCreatedBy());
        entity.setUpdatedBy(model.getUpdatedBy());
        entity.setDeleteBy(model.getDeleteBy());
    }
}
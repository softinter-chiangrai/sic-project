package spring.sic.profile.su.su_business_audit;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SuBusinessAuditService {

    private final SuBusinessAuditRepository repository;

    public List<SuBusinessAuditModel> getAll() {
        return repository.findAll().stream()
                .map(this::toModel)
                .collect(Collectors.toList());
    }

    public SuBusinessAuditModel getById(UUID id) {
        SuBusinessAuditEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("SuBusinessAudit not found with id: " + id));
        return toModel(entity);
    }

    @Transactional
    public SuBusinessAuditModel create(SuBusinessAuditModel model) {
        SuBusinessAuditEntity entity = new SuBusinessAuditEntity();
        copyToEntity(model, entity);
        entity.setCreatedDate(OffsetDateTime.now());
        entity.setIsDelete(false);
        SuBusinessAuditEntity saved = repository.save(entity);
        return toModel(saved);
    }

    @Transactional
    public SuBusinessAuditModel update(UUID id, SuBusinessAuditModel model) {
        SuBusinessAuditEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("SuBusinessAudit not found with id: " + id));
        copyToEntity(model, entity);
        entity.setUpdatedDate(OffsetDateTime.now());
        SuBusinessAuditEntity updated = repository.save(entity);
        return toModel(updated);
    }

    @Transactional
    public void delete(UUID id) {
        SuBusinessAuditEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("SuBusinessAudit not found with id: " + id));
        entity.setIsDelete(true);
        entity.setDeleteDate(OffsetDateTime.now());
        repository.save(entity);
    }

    private SuBusinessAuditModel toModel(SuBusinessAuditEntity entity) {
        SuBusinessAuditModel model = new SuBusinessAuditModel();
        model.setId(entity.getId());
        model.setKeycloakUserId(entity.getKeycloakUserId());
        model.setUsername(entity.getUsername());
        model.setBusinessId(entity.getBusinessId());
        model.setClientIp(entity.getClientIp());
        model.setRemark(entity.getRemark());
        model.setCreatedBy(entity.getCreatedBy());
        model.setCreatedDate(entity.getCreatedDate());
        model.setUpdatedBy(entity.getUpdatedBy());
        model.setUpdatedDate(entity.getUpdatedDate());
        model.setIsDelete(entity.getIsDelete());
        model.setDeleteBy(entity.getDeleteBy());
        model.setDeleteDate(entity.getDeleteDate());
        return model;
    }

    private void copyToEntity(SuBusinessAuditModel model, SuBusinessAuditEntity entity) {
        entity.setKeycloakUserId(model.getKeycloakUserId());
        entity.setUsername(model.getUsername());
        entity.setBusinessId(model.getBusinessId());
        entity.setClientIp(model.getClientIp());
        entity.setRemark(model.getRemark());
        entity.setCreatedBy(model.getCreatedBy());
        entity.setUpdatedBy(model.getUpdatedBy());
        entity.setDeleteBy(model.getDeleteBy());
    }
}
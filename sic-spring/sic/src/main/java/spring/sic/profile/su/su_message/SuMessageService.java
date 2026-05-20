package spring.sic.profile.su.su_message;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SuMessageService {

    private final SuMessageRepository repository;

    public List<SuMessageModel> getAll() {
        return repository.findAll().stream()
                .map(this::toModel)
                .collect(Collectors.toList());
    }

    public SuMessageModel getById(UUID id) {
        SuMessageEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("SuMessage not found with id: " + id));
        return toModel(entity);
    }

    @Transactional
    public SuMessageModel create(SuMessageModel model) {
        SuMessageEntity entity = new SuMessageEntity();
        copyToEntity(model, entity);
        entity.setCreatedDate(OffsetDateTime.now());
        entity.setIsDelete(false);
        SuMessageEntity saved = repository.save(entity);
        return toModel(saved);
    }

    @Transactional
    public SuMessageModel update(UUID id, SuMessageModel model) {
        SuMessageEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("SuMessage not found with id: " + id));
        copyToEntity(model, entity);
        entity.setUpdatedDate(OffsetDateTime.now());
        SuMessageEntity updated = repository.save(entity);
        return toModel(updated);
    }

    @Transactional
    public void delete(UUID id) {
        SuMessageEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("SuMessage not found with id: " + id));
        entity.setIsDelete(true);
        entity.setDeleteDate(OffsetDateTime.now());
        repository.save(entity);
    }

    private SuMessageModel toModel(SuMessageEntity entity) {
        SuMessageModel model = new SuMessageModel();
        model.setId(entity.getId());
        model.setModuleCode(entity.getModuleCode());
        model.setProgramCode(entity.getProgramCode());
        model.setMessageCode(entity.getMessageCode());
        model.setMessageEn(entity.getMessageEn());
        model.setMessageLocal(entity.getMessageLocal());
        model.setIsActive(entity.getIsActive());
        model.setCreatedBy(entity.getCreatedBy());
        model.setCreatedDate(entity.getCreatedDate());
        model.setUpdatedBy(entity.getUpdatedBy());
        model.setUpdatedDate(entity.getUpdatedDate());
        model.setIsDelete(entity.getIsDelete());
        model.setDeleteBy(entity.getDeleteBy());
        model.setDeleteDate(entity.getDeleteDate());
        return model;
    }

    private void copyToEntity(SuMessageModel model, SuMessageEntity entity) {
        entity.setModuleCode(model.getModuleCode());
        entity.setProgramCode(model.getProgramCode());
        entity.setMessageCode(model.getMessageCode());
        entity.setMessageEn(model.getMessageEn());
        entity.setMessageLocal(model.getMessageLocal());
        entity.setIsActive(model.getIsActive());
        entity.setCreatedBy(model.getCreatedBy());
        entity.setUpdatedBy(model.getUpdatedBy());
        entity.setDeleteBy(model.getDeleteBy());
    }
}
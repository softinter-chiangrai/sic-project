package spring.sic.profile.su.su_task;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SuTaskService {

    private final SuTaskRepository repository;

    public List<SuTaskModel> getAll() {
        return repository.findAll().stream()
                .map(this::toModel)
                .collect(Collectors.toList());
    }

    public SuTaskModel getById(UUID id) {
        SuTaskEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("SuTask not found with id: " + id));
        return toModel(entity);
    }

    @Transactional
    public SuTaskModel create(SuTaskModel model) {
        SuTaskEntity entity = new SuTaskEntity();
        copyToEntity(model, entity);
        entity.setCreatedDate(OffsetDateTime.now());
        entity.setIsDelete(false);
        SuTaskEntity saved = repository.save(entity);
        return toModel(saved);
    }

    @Transactional
    public SuTaskModel update(UUID id, SuTaskModel model) {
        SuTaskEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("SuTask not found with id: " + id));
        copyToEntity(model, entity);
        entity.setUpdatedDate(OffsetDateTime.now());
        SuTaskEntity updated = repository.save(entity);
        return toModel(updated);
    }

    @Transactional
    public void delete(UUID id) {
        SuTaskEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("SuTask not found with id: " + id));
        entity.setIsDelete(true);
        entity.setDeleteDate(OffsetDateTime.now());
        repository.save(entity);
    }

    private SuTaskModel toModel(SuTaskEntity entity) {
        SuTaskModel model = new SuTaskModel();
        model.setId(entity.getId());
        model.setTaskCode(entity.getTaskCode());
        model.setTaskNameEn(entity.getTaskNameEn());
        model.setTaskNameLocal(entity.getTaskNameLocal());
        model.setIsActive(entity.getIsActive());
        model.setCreatedBy(entity.getCreatedBy());
        model.setCreatedDate(entity.getCreatedDate());
        model.setUpdatedBy(entity.getUpdatedBy());
        model.setUpdatedDate(entity.getUpdatedDate());
        model.setIsDelete(entity.getIsDelete());
        model.setDeleteBy(entity.getDeleteBy());
        model.setDeleteDate(entity.getDeleteDate());
        model.setBusinessId(entity.getBusinessId());
        return model;
    }

    private void copyToEntity(SuTaskModel model, SuTaskEntity entity) {
        entity.setTaskCode(model.getTaskCode());
        entity.setTaskNameEn(model.getTaskNameEn());
        entity.setTaskNameLocal(model.getTaskNameLocal());
        entity.setIsActive(model.getIsActive());
        entity.setCreatedBy(model.getCreatedBy());
        entity.setUpdatedBy(model.getUpdatedBy());
        entity.setDeleteBy(model.getDeleteBy());
        entity.setBusinessId(model.getBusinessId());
    }
}
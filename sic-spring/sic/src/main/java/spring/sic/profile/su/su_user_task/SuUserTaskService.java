package spring.sic.profile.su.su_user_task;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SuUserTaskService {

    private final SuUserTaskRepository repository;

    public List<SuUserTaskModel> getAll() {
        return repository.findAll().stream()
                .map(this::toModel)
                .collect(Collectors.toList());
    }

    public SuUserTaskModel getById(UUID id) {
        SuUserTaskEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("SuUserTask not found with id: " + id));
        return toModel(entity);
    }

    @Transactional
    public SuUserTaskModel create(SuUserTaskModel model) {
        SuUserTaskEntity entity = new SuUserTaskEntity();
        copyToEntity(model, entity);
        entity.setCreatedDate(OffsetDateTime.now());
        entity.setIsDelete(false);
        SuUserTaskEntity saved = repository.save(entity);
        return toModel(saved);
    }

    @Transactional
    public SuUserTaskModel update(UUID id, SuUserTaskModel model) {
        SuUserTaskEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("SuUserTask not found with id: " + id));
        copyToEntity(model, entity);
        entity.setUpdatedDate(OffsetDateTime.now());
        SuUserTaskEntity updated = repository.save(entity);
        return toModel(updated);
    }

    @Transactional
    public void delete(UUID id) {
        SuUserTaskEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("SuUserTask not found with id: " + id));
        entity.setIsDelete(true);
        entity.setDeleteDate(OffsetDateTime.now());
        repository.save(entity);
    }

    private SuUserTaskModel toModel(SuUserTaskEntity entity) {
        SuUserTaskModel model = new SuUserTaskModel();
        model.setId(entity.getId());
        model.setTitle(entity.getTitle());
        model.setStartTime(entity.getStartTime());
        model.setEndTime(entity.getEndTime());
        model.setIsActive(entity.getIsActive());
        model.setTaskId(entity.getTaskId());
        model.setCreatedBy(entity.getCreatedBy());
        model.setCreatedDate(entity.getCreatedDate());
        model.setUpdatedBy(entity.getUpdatedBy());
        model.setUpdatedDate(entity.getUpdatedDate());
        model.setIsDelete(entity.getIsDelete());
        model.setDeleteBy(entity.getDeleteBy());
        model.setDeleteDate(entity.getDeleteDate());
        return model;
    }

    private void copyToEntity(SuUserTaskModel model, SuUserTaskEntity entity) {
        entity.setTitle(model.getTitle());
        entity.setStartTime(model.getStartTime());
        entity.setEndTime(model.getEndTime());
        entity.setIsActive(model.getIsActive());
        entity.setTaskId(model.getTaskId());
        entity.setCreatedBy(model.getCreatedBy());
        entity.setUpdatedBy(model.getUpdatedBy());
        entity.setDeleteBy(model.getDeleteBy());
    }
}
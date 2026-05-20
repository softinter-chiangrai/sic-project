package spring.sic.profile.su.su_program;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SuProgramService {

    private final SuProgramRepository repository;

    public List<SuProgramModel> getAll() {
        return repository.findAll().stream()
                .map(this::toModel)
                .collect(Collectors.toList());
    }

    public SuProgramModel getById(UUID id) {
        SuProgramEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("SuProgram not found with id: " + id));
        return toModel(entity);
    }

    @Transactional
    public SuProgramModel create(SuProgramModel model) {
        SuProgramEntity entity = new SuProgramEntity();
        copyToEntity(model, entity);
        entity.setCreatedDate(OffsetDateTime.now());
        entity.setIsDelete(false);
        SuProgramEntity saved = repository.save(entity);
        return toModel(saved);
    }

    @Transactional
    public SuProgramModel update(UUID id, SuProgramModel model) {
        SuProgramEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("SuProgram not found with id: " + id));
        copyToEntity(model, entity);
        entity.setUpdatedDate(OffsetDateTime.now());
        SuProgramEntity updated = repository.save(entity);
        return toModel(updated);
    }

    @Transactional
    public void delete(UUID id) {
        SuProgramEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("SuProgram not found with id: " + id));
        entity.setIsDelete(true);
        entity.setDeleteDate(OffsetDateTime.now());
        repository.save(entity);
    }

    private SuProgramModel toModel(SuProgramEntity entity) {
        SuProgramModel model = new SuProgramModel();
        model.setId(entity.getId());
        model.setParentProgramId(entity.getParentProgramId());
        model.setProgramCode(entity.getProgramCode());
        model.setIcon(entity.getIcon());
        model.setNameEn(entity.getNameEn());
        model.setNameLocal(entity.getNameLocal());
        model.setRoutePath(entity.getRoutePath());
        model.setSortOrder(entity.getSortOrder());
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

    private void copyToEntity(SuProgramModel model, SuProgramEntity entity) {
        entity.setParentProgramId(model.getParentProgramId());
        entity.setProgramCode(model.getProgramCode());
        entity.setIcon(model.getIcon());
        entity.setNameEn(model.getNameEn());
        entity.setNameLocal(model.getNameLocal());
        entity.setRoutePath(model.getRoutePath());
        entity.setSortOrder(model.getSortOrder());
        entity.setIsActive(model.getIsActive());
        entity.setCreatedBy(model.getCreatedBy());
        entity.setUpdatedBy(model.getUpdatedBy());
        entity.setDeleteBy(model.getDeleteBy());
    }
}
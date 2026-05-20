package spring.sic.profile.su.su_business_role_program;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SuBusinessRoleProgramService {

    private final SuBusinessRoleProgramRepository repository;

    public List<SuBusinessRoleProgramModel> getAll() {
        return repository.findAll().stream()
                .map(this::toModel)
                .collect(Collectors.toList());
    }

    public SuBusinessRoleProgramModel getById(UUID id) {
        SuBusinessRoleProgramEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("SuBusinessRoleProgram not found with id: " + id));
        return toModel(entity);
    }

    @Transactional
    public SuBusinessRoleProgramModel create(SuBusinessRoleProgramModel model) {
        SuBusinessRoleProgramEntity entity = new SuBusinessRoleProgramEntity();
        copyToEntity(model, entity);
        entity.setCreatedDate(OffsetDateTime.now());
        entity.setIsDelete(false);
        SuBusinessRoleProgramEntity saved = repository.save(entity);
        return toModel(saved);
    }

    @Transactional
    public SuBusinessRoleProgramModel update(UUID id, SuBusinessRoleProgramModel model) {
        SuBusinessRoleProgramEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("SuBusinessRoleProgram not found with id: " + id));
        copyToEntity(model, entity);
        entity.setUpdatedDate(OffsetDateTime.now());
        SuBusinessRoleProgramEntity updated = repository.save(entity);
        return toModel(updated);
    }

    @Transactional
    public void delete(UUID id) {
        SuBusinessRoleProgramEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("SuBusinessRoleProgram not found with id: " + id));
        entity.setIsDelete(true);
        entity.setDeleteDate(OffsetDateTime.now());
        repository.save(entity);
    }

    private SuBusinessRoleProgramModel toModel(SuBusinessRoleProgramEntity entity) {
        SuBusinessRoleProgramModel model = new SuBusinessRoleProgramModel();
        model.setId(entity.getId());
        model.setBusinessRoleId(entity.getBusinessRoleId());
        model.setProgramId(entity.getProgramId());
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

    private void copyToEntity(SuBusinessRoleProgramModel model, SuBusinessRoleProgramEntity entity) {
        entity.setBusinessRoleId(model.getBusinessRoleId());
        entity.setProgramId(model.getProgramId());
        entity.setIsActive(model.getIsActive());
        entity.setCreatedBy(model.getCreatedBy());
        entity.setUpdatedBy(model.getUpdatedBy());
        entity.setDeleteBy(model.getDeleteBy());
    }
}
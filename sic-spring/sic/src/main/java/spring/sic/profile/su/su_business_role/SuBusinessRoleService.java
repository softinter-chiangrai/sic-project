package spring.sic.profile.su.su_business_role;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SuBusinessRoleService {

    private final SuBusinessRoleRepository repository;

    public List<SuBusinessRoleModel> getAll() {
        return repository.findAll().stream()
                .map(this::toModel)
                .collect(Collectors.toList());
    }

    public SuBusinessRoleModel getById(UUID id) {
        SuBusinessRoleEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("SuBusinessRole not found with id: " + id));
        return toModel(entity);
    }

    @Transactional
    public SuBusinessRoleModel create(SuBusinessRoleModel model) {
        SuBusinessRoleEntity entity = new SuBusinessRoleEntity();
        copyToEntity(model, entity);
        entity.setCreatedDate(OffsetDateTime.now());
        entity.setIsDelete(false);
        SuBusinessRoleEntity saved = repository.save(entity);
        return toModel(saved);
    }

    @Transactional
    public SuBusinessRoleModel update(UUID id, SuBusinessRoleModel model) {
        SuBusinessRoleEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("SuBusinessRole not found with id: " + id));
        copyToEntity(model, entity);
        entity.setUpdatedDate(OffsetDateTime.now());
        SuBusinessRoleEntity updated = repository.save(entity);
        return toModel(updated);
    }

    @Transactional
    public void delete(UUID id) {
        SuBusinessRoleEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("SuBusinessRole not found with id: " + id));
        entity.setIsDelete(true);
        entity.setDeleteDate(OffsetDateTime.now());
        repository.save(entity);
    }

    private SuBusinessRoleModel toModel(SuBusinessRoleEntity entity) {
        SuBusinessRoleModel model = new SuBusinessRoleModel();
        model.setId(entity.getId());
        model.setBusinessId(entity.getBusinessId());
        model.setParentRoleId(entity.getParentRoleId());
        model.setRoleCode(entity.getRoleCode());
        model.setRoleNameEn(entity.getRoleNameEn());
        model.setRoleNameLocal(entity.getRoleNameLocal());
        model.setRoleLevel(entity.getRoleLevel());
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

    private void copyToEntity(SuBusinessRoleModel model, SuBusinessRoleEntity entity) {
        entity.setBusinessId(model.getBusinessId());
        entity.setParentRoleId(model.getParentRoleId());
        entity.setRoleCode(model.getRoleCode());
        entity.setRoleNameEn(model.getRoleNameEn());
        entity.setRoleNameLocal(model.getRoleNameLocal());
        entity.setRoleLevel(model.getRoleLevel());
        entity.setSortOrder(model.getSortOrder());
        entity.setIsActive(model.getIsActive());
        entity.setCreatedBy(model.getCreatedBy());
        entity.setUpdatedBy(model.getUpdatedBy());
        entity.setDeleteBy(model.getDeleteBy());
    }
}
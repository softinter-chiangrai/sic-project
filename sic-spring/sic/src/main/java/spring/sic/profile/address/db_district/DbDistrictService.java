package spring.sic.profile.address.db_district;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DbDistrictService {

    private final DbDistrictRepository repository;

    public List<DbDistrictModel> getAll() {
        return repository.findAll().stream()
                .map(this::toModel)
                .collect(Collectors.toList());
    }

    public DbDistrictModel getById(UUID id) {
        DbDistrictEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("District not found with id: " + id));
        return toModel(entity);
    }

    @Transactional
    public DbDistrictModel create(DbDistrictModel model) {
        DbDistrictEntity entity = new DbDistrictEntity();
        copyToEntity(model, entity);
        entity.setCreatedDate(OffsetDateTime.now());
        entity.setIsDelete(false);
        DbDistrictEntity saved = repository.save(entity);
        return toModel(saved);
    }

    @Transactional
    public DbDistrictModel update(UUID id, DbDistrictModel model) {
        DbDistrictEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("District not found with id: " + id));
        copyToEntity(model, entity);
        entity.setUpdatedDate(OffsetDateTime.now());
        DbDistrictEntity updated = repository.save(entity);
        return toModel(updated);
    }

    @Transactional
    public void delete(UUID id) {
        DbDistrictEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("District not found with id: " + id));
        entity.setIsDelete(true);
        entity.setDeleteDate(OffsetDateTime.now());
        repository.save(entity);
    }

    private DbDistrictModel toModel(DbDistrictEntity entity) {
        DbDistrictModel model = new DbDistrictModel();
        model.setId(entity.getId());
        model.setDistrictId(entity.getDistrictId());
        model.setProvinceId(entity.getProvinceId());
        model.setDistrictCode(entity.getDistrictCode());
        model.setDistrictNameEn(entity.getDistrictNameEn());
        model.setDistrictNameLocal(entity.getDistrictNameLocal());
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

    private void copyToEntity(DbDistrictModel model, DbDistrictEntity entity) {
        entity.setDistrictId(model.getDistrictId());
        entity.setProvinceId(model.getProvinceId());
        entity.setDistrictCode(model.getDistrictCode());
        entity.setDistrictNameEn(model.getDistrictNameEn());
        entity.setDistrictNameLocal(model.getDistrictNameLocal());
        entity.setIsActive(model.getIsActive());
        entity.setCreatedBy(model.getCreatedBy());
        entity.setUpdatedBy(model.getUpdatedBy());
        entity.setDeleteBy(model.getDeleteBy());
    }
}
package spring.sic.profile.address.db_province;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DbProvinceService {

    private final DbProvinceRepository repository;

    public List<DbProvinceModel> getAll() {
        return repository.findAll().stream()
                .map(this::toModel)
                .collect(Collectors.toList());
    }

    public DbProvinceModel getById(UUID id) {
        DbProvinceEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("DbProvince not found with id: " + id));
        return toModel(entity);
    }

    @Transactional
    public DbProvinceModel create(DbProvinceModel model) {
        DbProvinceEntity entity = new DbProvinceEntity();
        copyToEntity(model, entity);
        entity.setCreatedDate(OffsetDateTime.now());
        entity.setIsDelete(false);
        DbProvinceEntity saved = repository.save(entity);
        return toModel(saved);
    }

    @Transactional
    public DbProvinceModel update(UUID id, DbProvinceModel model) {
        DbProvinceEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("DbProvince not found with id: " + id));
        copyToEntity(model, entity);
        entity.setUpdatedDate(OffsetDateTime.now());
        DbProvinceEntity updated = repository.save(entity);
        return toModel(updated);
    }

    @Transactional
    public void delete(UUID id) {
        DbProvinceEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("DbProvince not found with id: " + id));
        entity.setIsDelete(true);
        entity.setDeleteDate(OffsetDateTime.now());
        repository.save(entity);
    }

    private DbProvinceModel toModel(DbProvinceEntity entity) {
        DbProvinceModel model = new DbProvinceModel();
        model.setId(entity.getId());
        model.setProvinceId(entity.getProvinceId());
        model.setDistrictCode(entity.getDistrictCode());
        model.setProvinceNameEn(entity.getProvinceNameEn());
        model.setProvinceNameLocal(entity.getProvinceNameLocal());
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

    private void copyToEntity(DbProvinceModel model, DbProvinceEntity entity) {
        entity.setProvinceId(model.getProvinceId());
        entity.setDistrictCode(model.getDistrictCode());
        entity.setProvinceNameEn(model.getProvinceNameEn());
        entity.setProvinceNameLocal(model.getProvinceNameLocal());
        entity.setIsActive(model.getIsActive());
        entity.setCreatedBy(model.getCreatedBy());
        entity.setUpdatedBy(model.getUpdatedBy());
        entity.setDeleteBy(model.getDeleteBy());
    }
}
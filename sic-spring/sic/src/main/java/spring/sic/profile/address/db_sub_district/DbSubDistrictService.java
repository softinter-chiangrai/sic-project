package spring.sic.profile.address.db_sub_district;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DbSubDistrictService {

    private final DbSubDistrictRepository repository;

    public List<DbSubDistrictModel> getAll() {
        return repository.findAll().stream()
                .map(this::toModel)
                .collect(Collectors.toList());
    }

    public DbSubDistrictModel getById(UUID id) {
        DbSubDistrictEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("SubDistrict not found with id: " + id));
        return toModel(entity);
    }

    @Transactional
    public DbSubDistrictModel create(DbSubDistrictModel model) {
        DbSubDistrictEntity entity = new DbSubDistrictEntity();
        copyToEntity(model, entity);
        entity.setCreatedDate(OffsetDateTime.now());
        entity.setIsDelete(false);
        DbSubDistrictEntity saved = repository.save(entity);
        return toModel(saved);
    }

    @Transactional
    public DbSubDistrictModel update(UUID id, DbSubDistrictModel model) {
        DbSubDistrictEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("SubDistrict not found with id: " + id));
        copyToEntity(model, entity);
        entity.setUpdatedDate(OffsetDateTime.now());
        DbSubDistrictEntity updated = repository.save(entity);
        return toModel(updated);
    }

    @Transactional
    public void delete(UUID id) {
        DbSubDistrictEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("SubDistrict not found with id: " + id));
        entity.setIsDelete(true);
        entity.setDeleteDate(OffsetDateTime.now());
        repository.save(entity);
    }

    private DbSubDistrictModel toModel(DbSubDistrictEntity entity) {
        DbSubDistrictModel model = new DbSubDistrictModel();
        model.setId(entity.getId());
        model.setSubDistrictId(entity.getSubDistrictId());
        model.setSubDistrictCode(entity.getSubDistrictCode());
        model.setSubDistrictNameEn(entity.getSubDistrictNameEn());
        model.setSubDistrictNameLocal(entity.getSubDistrictNameLocal());
        model.setZipCode(entity.getZipCode());
        model.setLatitude(entity.getLatitude());
        model.setLongitude(entity.getLongitude());
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

    private void copyToEntity(DbSubDistrictModel model, DbSubDistrictEntity entity) {
        entity.setSubDistrictId(model.getSubDistrictId());
        entity.setSubDistrictCode(model.getSubDistrictCode());
        entity.setSubDistrictNameEn(model.getSubDistrictNameEn());
        entity.setSubDistrictNameLocal(model.getSubDistrictNameLocal());
        entity.setZipCode(model.getZipCode());
        entity.setLatitude(model.getLatitude());
        entity.setLongitude(model.getLongitude());
        entity.setIsActive(model.getIsActive());
        entity.setCreatedBy(model.getCreatedBy());
        entity.setUpdatedBy(model.getUpdatedBy());
        entity.setDeleteBy(model.getDeleteBy());
    }
}
package spring.sic.profile.address.db_country;

import lombok.RequiredArgsConstructor;
import spring.sic.mail.db_mail_config.DbMailConfigService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DbCountryService {

    private final DbCountryRepository repository;

    public List<DbCountryModel> getAll() {
        return repository.findAll().stream()
                .map(this::toModel)
                .collect(Collectors.toList());
    }

    public DbCountryModel getById(UUID id) {
        DbCountryEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("DbCountry not found with id: " + id));
        return toModel(entity);
    }

    @Transactional
    public DbCountryModel create(DbCountryModel model) {
        DbCountryEntity entity = new DbCountryEntity();
        copyToEntity(model, entity);
        entity.setCreatedDate(OffsetDateTime.now());
        entity.setIsDelete(false);
        DbCountryEntity saved = repository.save(entity);
        return toModel(saved);
    }

    @Transactional
    public DbCountryModel update(UUID id, DbCountryModel model) {
        DbCountryEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("DbCountry not found with id: " + id));
        copyToEntity(model, entity);
        entity.setUpdatedDate(OffsetDateTime.now());
        DbCountryEntity updated = repository.save(entity);
        return toModel(updated);
    }

    @Transactional
    public void delete(UUID id) {
        DbCountryEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("DbCountry not found with id: " + id));
        entity.setIsDelete(true);
        entity.setDeleteDate(OffsetDateTime.now());
        repository.save(entity);
    }

    private DbCountryModel toModel(DbCountryEntity entity) {
        DbCountryModel model = new DbCountryModel();
        model.setId(entity.getId());
        model.setCountryCode(entity.getCountryCode());
        model.setIsoCode(entity.getIsoCode());
        model.setCountryNameEn(entity.getCountryNameEn());
        model.setCountryNameLocal(entity.getCountryNameLocal());
        model.setSupportLocalAddress(entity.getSupportLocalAddress());
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

    private void copyToEntity(DbCountryModel model, DbCountryEntity entity) {
        entity.setCountryCode(model.getCountryCode());
        entity.setIsoCode(model.getIsoCode());
        entity.setCountryNameEn(model.getCountryNameEn());
        entity.setCountryNameLocal(model.getCountryNameLocal());
        entity.setSupportLocalAddress(model.getSupportLocalAddress());
        entity.setIsActive(model.getIsActive());
        entity.setCreatedBy(model.getCreatedBy());
        entity.setUpdatedBy(model.getUpdatedBy());
        entity.setDeleteBy(model.getDeleteBy());
    }
}
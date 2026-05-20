package spring.sic.profile.address.db_title;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DbTitleService {

    private final DbTitleRepository repository;

    public List<DbTitleModel> getAll() {
        return repository.findAll().stream()
                .map(this::toModel)
                .collect(Collectors.toList());
    }

    public DbTitleModel getById(UUID id) {
        DbTitleEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("DbTitle not found with id: " + id));
        return toModel(entity);
    }

    @Transactional
    public DbTitleModel create(DbTitleModel model) {
        DbTitleEntity entity = new DbTitleEntity();
        copyToEntity(model, entity);
        entity.setCreatedDate(OffsetDateTime.now());
        entity.setIsDelete(false);
        DbTitleEntity saved = repository.save(entity);
        return toModel(saved);
    }

    @Transactional
    public DbTitleModel update(UUID id, DbTitleModel model) {
        DbTitleEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("DbTitle not found with id: " + id));
        copyToEntity(model, entity);
        entity.setUpdatedDate(OffsetDateTime.now());
        DbTitleEntity updated = repository.save(entity);
        return toModel(updated);
    }

    @Transactional
    public void delete(UUID id) {
        DbTitleEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("DbTitle not found with id: " + id));
        entity.setIsDelete(true);
        entity.setDeleteDate(OffsetDateTime.now());
        repository.save(entity);
    }

    private DbTitleModel toModel(DbTitleEntity entity) {
        DbTitleModel model = new DbTitleModel();
        model.setId(entity.getId());
        model.setPersonType(entity.getPersonType());
        model.setPrefixShortNameTh(entity.getPrefixShortNameTh());
        model.setPrefixShortNameLocal(entity.getPrefixShortNameLocal());
        model.setPrefixShortNameEn(entity.getPrefixShortNameEn());
        model.setPrefixNameTh(entity.getPrefixNameTh());
        model.setPrefixNameLocal(entity.getPrefixNameLocal());
        model.setPrefixNameEn(entity.getPrefixNameEn());
        model.setSuffixNameEn(entity.getSuffixNameEn());
        model.setSuffixNameLocal(entity.getSuffixNameLocal());
        model.setSortOrder(entity.getSortOrder());
        model.setCreatedBy(entity.getCreatedBy());
        model.setCreatedDate(entity.getCreatedDate());
        model.setUpdatedBy(entity.getUpdatedBy());
        model.setUpdatedDate(entity.getUpdatedDate());
        model.setIsDelete(entity.getIsDelete());
        model.setDeleteBy(entity.getDeleteBy());
        model.setDeleteDate(entity.getDeleteDate());
        return model;
    }

    private void copyToEntity(DbTitleModel model, DbTitleEntity entity) {
        entity.setPersonType(model.getPersonType());
        entity.setPrefixShortNameTh(model.getPrefixShortNameTh());
        entity.setPrefixShortNameLocal(model.getPrefixShortNameLocal());
        entity.setPrefixShortNameEn(model.getPrefixShortNameEn());
        entity.setPrefixNameTh(model.getPrefixNameTh());
        entity.setPrefixNameLocal(model.getPrefixNameLocal());
        entity.setPrefixNameEn(model.getPrefixNameEn());
        entity.setSuffixNameEn(model.getSuffixNameEn());
        entity.setSuffixNameLocal(model.getSuffixNameLocal());
        entity.setSortOrder(model.getSortOrder());
        entity.setCreatedBy(model.getCreatedBy());
        entity.setUpdatedBy(model.getUpdatedBy());
        entity.setDeleteBy(model.getDeleteBy());
    }
}
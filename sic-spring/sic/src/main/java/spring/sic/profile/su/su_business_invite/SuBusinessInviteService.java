package spring.sic.profile.su.su_business_invite;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SuBusinessInviteService {

    private final SuBusinessInviteRepository repository;

    public List<SuBusinessInviteModel> getAll() {
        return repository.findAll().stream()
                .map(this::toModel)
                .collect(Collectors.toList());
    }

    public SuBusinessInviteModel getById(UUID id) {
        SuBusinessInviteEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("SuBusinessInvite not found with id: " + id));
        return toModel(entity);
    }

    @Transactional
    public SuBusinessInviteModel create(SuBusinessInviteModel model) {
        SuBusinessInviteEntity entity = new SuBusinessInviteEntity();
        copyToEntity(model, entity);
        entity.setCreatedDate(OffsetDateTime.now());
        entity.setIsDelete(false);
        SuBusinessInviteEntity saved = repository.save(entity);
        return toModel(saved);
    }

    @Transactional
    public SuBusinessInviteModel update(UUID id, SuBusinessInviteModel model) {
        SuBusinessInviteEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("SuBusinessInvite not found with id: " + id));
        copyToEntity(model, entity);
        entity.setUpdatedDate(OffsetDateTime.now());
        SuBusinessInviteEntity updated = repository.save(entity);
        return toModel(updated);
    }

    @Transactional
    public void delete(UUID id) {
        SuBusinessInviteEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("SuBusinessInvite not found with id: " + id));
        entity.setIsDelete(true);
        entity.setDeleteDate(OffsetDateTime.now());
        repository.save(entity);
    }

    private SuBusinessInviteModel toModel(SuBusinessInviteEntity entity) {
        SuBusinessInviteModel model = new SuBusinessInviteModel();
        model.setId(entity.getId());
        model.setRoleId(entity.getRoleId());
        model.setInviteType(entity.getInviteType());
        model.setInviteEmail(entity.getInviteEmail());
        model.setInviteToken(entity.getInviteToken());
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

    private void copyToEntity(SuBusinessInviteModel model, SuBusinessInviteEntity entity) {
        entity.setRoleId(model.getRoleId());
        entity.setInviteType(model.getInviteType());
        entity.setInviteEmail(model.getInviteEmail());
        entity.setInviteToken(model.getInviteToken());
        entity.setIsActive(model.getIsActive());
        entity.setCreatedBy(model.getCreatedBy());
        entity.setUpdatedBy(model.getUpdatedBy());
        entity.setDeleteBy(model.getDeleteBy());
    }
}
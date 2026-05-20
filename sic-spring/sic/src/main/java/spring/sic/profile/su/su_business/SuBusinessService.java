package spring.sic.profile.su.su_business;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SuBusinessService {

    private final SuBusinessRepository repository;

    public List<SuBusinessModel> getAll() {
        return repository.findAll().stream()
                .map(this::toModel)
                .collect(Collectors.toList());
    }

    public SuBusinessModel getById(UUID id) {
        SuBusinessEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("SuBusiness not found with id: " + id));
        return toModel(entity);
    }

    @Transactional
    public SuBusinessModel create(SuBusinessModel model) {
        SuBusinessEntity entity = new SuBusinessEntity();
        copyToEntity(model, entity);
        entity.setCreatedDate(OffsetDateTime.now());
        entity.setIsDelete(false);
        SuBusinessEntity saved = repository.save(entity);
        return toModel(saved);
    }

    @Transactional
    public SuBusinessModel update(UUID id, SuBusinessModel model) {
        SuBusinessEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("SuBusiness not found with id: " + id));
        copyToEntity(model, entity);
        entity.setUpdatedDate(OffsetDateTime.now());
        SuBusinessEntity updated = repository.save(entity);
        return toModel(updated);
    }

    @Transactional
    public void delete(UUID id) {
        SuBusinessEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("SuBusiness not found with id: " + id));
        entity.setIsDelete(true);
        entity.setDeleteDate(OffsetDateTime.now());
        repository.save(entity);
    }

    private SuBusinessModel toModel(SuBusinessEntity entity) {
        SuBusinessModel model = new SuBusinessModel();
        model.setId(entity.getId());
        model.setTaxId(entity.getTaxId());
        model.setPersonType(entity.getPersonType());
        model.setTitleId(entity.getTitleId());
        model.setFirstNameEn(entity.getFirstNameEn());
        model.setMiddleNameEn(entity.getMiddleNameEn());
        model.setLastNameEn(entity.getLastNameEn());
        model.setFirstNameLocal(entity.getFirstNameLocal());
        model.setMiddleNameLocal(entity.getMiddleNameLocal());
        model.setLastNameLocal(entity.getLastNameLocal());
        model.setCountryId(entity.getCountryId());
        model.setSupportLocalAddress(entity.getSupportLocalAddress());
        model.setAddressEn(entity.getAddressEn());
        model.setAddressLocal(entity.getAddressLocal());
        model.setProvinceId(entity.getProvinceId());
        model.setDistrictId(entity.getDistrictId());
        model.setSubDistrictId(entity.getSubDistrictId());
        model.setZipCode(entity.getZipCode());
        model.setPhoneNumber(entity.getPhoneNumber());
        model.setFax(entity.getFax());
        model.setUploadGroupId(entity.getUploadGroupId());
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

    private void copyToEntity(SuBusinessModel model, SuBusinessEntity entity) {
        entity.setTaxId(model.getTaxId());
        entity.setPersonType(model.getPersonType());
        entity.setTitleId(model.getTitleId());
        entity.setFirstNameEn(model.getFirstNameEn());
        entity.setMiddleNameEn(model.getMiddleNameEn());
        entity.setLastNameEn(model.getLastNameEn());
        entity.setFirstNameLocal(model.getFirstNameLocal());
        entity.setMiddleNameLocal(model.getMiddleNameLocal());
        entity.setLastNameLocal(model.getLastNameLocal());
        entity.setCountryId(model.getCountryId());
        entity.setSupportLocalAddress(model.getSupportLocalAddress());
        entity.setAddressEn(model.getAddressEn());
        entity.setAddressLocal(model.getAddressLocal());
        entity.setProvinceId(model.getProvinceId());
        entity.setDistrictId(model.getDistrictId());
        entity.setSubDistrictId(model.getSubDistrictId());
        entity.setZipCode(model.getZipCode());
        entity.setPhoneNumber(model.getPhoneNumber());
        entity.setFax(model.getFax());
        entity.setUploadGroupId(model.getUploadGroupId());
        entity.setIsActive(model.getIsActive());
        entity.setCreatedBy(model.getCreatedBy());
        entity.setUpdatedBy(model.getUpdatedBy());
        entity.setDeleteBy(model.getDeleteBy());
    }
}
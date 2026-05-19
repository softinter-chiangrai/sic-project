package spring.sic.service;

import spring.sic.entity.ProfileEntity;
import spring.sic.model.ProfileModel;
import spring.sic.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor

public class ProfileService {

    private final ProfileRepository profileRepository;

    public List<ProfileEntity> getAllProfiles() {
        return profileRepository.findAll();
    }

    public ProfileEntity getProfileById(Long id) {
        return profileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Profile not found with id: " + id));
    }

    @Transactional
    public ProfileEntity createProfile(ProfileModel request) {
        if (profileRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่น");
        }
        if (request.getPhone() != null && !request.getPhone().trim().isEmpty() &&
                profileRepository.existsByPhone(request.getPhone())) {
            throw new IllegalArgumentException("เบอร์โทรศัพท์นี้ถูกใช้งานแล้ว กรุณาใช้เบอร์อื่น");
        }

        ProfileEntity profile = ProfileEntity.builder()
            .firstName(request.getFirstName())
            .lastName(request.getLastName())
            .email(request.getEmail())
            .phone(request.getPhone())
            .gender(request.getGender())
            .birthDate(request.getBirthDate())
            .avatarUrl(request.getAvatarUrl())
            .bio(request.getBio())
            .passwordHash(request.getPasswordHash())
            .subDistrict(request.getSubDistrict())
            .addressLine1(request.getAddressLine1())
            .addressLine2(request.getAddressLine2())
            .city(request.getCity())
            .state(request.getState())
            .postalCode(request.getPostalCode())
            .country(request.getCountry())
            .build();
        return profileRepository.save(profile);
    }

    @Transactional
    public ProfileEntity updateProfile(Long id, ProfileModel request) {
        ProfileEntity existing = getProfileById(id);

        // ถ้าเปลี่ยนอีเมล ตรวจสอบซ้ำ
        if (!existing.getEmail().equalsIgnoreCase(request.getEmail()) &&
                profileRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่น");
        }

        // ถ้าเปลี่ยนเบอร์โทร ตรวจสอบซ้ำ
        if (request.getPhone() != null && !request.getPhone().equals(existing.getPhone()) &&
                profileRepository.existsByPhone(request.getPhone())) {
            throw new IllegalArgumentException("เบอร์โทรศัพท์นี้ถูกใช้งานแล้ว กรุณาใช้เบอร์อื่น");
        }

        existing.setFirstName(request.getFirstName());
        existing.setLastName(request.getLastName());
        existing.setEmail(request.getEmail());
        existing.setPhone(request.getPhone());
        existing.setGender(request.getGender());
        existing.setBirthDate(request.getBirthDate());
        existing.setAvatarUrl(request.getAvatarUrl());
        existing.setBio(request.getBio());
        existing.setAddressLine1(request.getAddressLine1());
        existing.setAddressLine2(request.getAddressLine2());
        existing.setSubDistrict(request.getSubDistrict());
        existing.setCity(request.getCity());
        existing.setState(request.getState());
        existing.setPostalCode(request.getPostalCode());
        existing.setCountry(request.getCountry());
        existing.setPasswordHash(request.getPasswordHash());

        return profileRepository.save(existing);
    }

    @Transactional
    public void deleteProfile(Long id) {
        if (!profileRepository.existsById(id)) {
            throw new RuntimeException("Profile not found with id: " + id);
        }
        profileRepository.deleteById(id);
    }
}
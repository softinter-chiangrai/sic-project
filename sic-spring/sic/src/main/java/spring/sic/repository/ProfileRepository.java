package spring.sic.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import spring.sic.entity.ProfileEntity;

@Repository
// profile = entity , Long =  private Long id;
public interface ProfileRepository extends JpaRepository<ProfileEntity, Long> {
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
}

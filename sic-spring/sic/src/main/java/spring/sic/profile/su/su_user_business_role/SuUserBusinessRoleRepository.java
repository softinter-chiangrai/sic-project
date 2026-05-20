package spring.sic.profile.su.su_user_business_role;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface SuUserBusinessRoleRepository extends JpaRepository<SuUserBusinessRoleEntity, UUID> {
}
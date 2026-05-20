package spring.sic.profile.su.su_business_role_program;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface SuBusinessRoleProgramRepository extends JpaRepository<SuBusinessRoleProgramEntity, UUID> {
}
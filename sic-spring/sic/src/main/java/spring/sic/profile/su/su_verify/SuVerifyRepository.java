package spring.sic.profile.su.su_verify;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface SuVerifyRepository extends JpaRepository<SuVerifyEntity, UUID> {
}
package spring.sic.profile.su.su_profile;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface SuProfileRepository extends JpaRepository<SuProfileEntity, UUID> {
}

package spring.sic.profile.su.su_user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface SuUserRepository extends JpaRepository<SuUserEntity, UUID> {
}


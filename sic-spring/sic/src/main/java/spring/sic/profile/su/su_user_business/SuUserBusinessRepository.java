package spring.sic.profile.su.su_user_business;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface SuUserBusinessRepository extends JpaRepository<SuUserBusinessEntity, UUID> {
}
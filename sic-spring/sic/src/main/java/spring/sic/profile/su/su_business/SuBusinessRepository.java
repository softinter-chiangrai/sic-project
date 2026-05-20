package spring.sic.profile.su.su_business;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface SuBusinessRepository extends JpaRepository<SuBusinessEntity, UUID> {
}
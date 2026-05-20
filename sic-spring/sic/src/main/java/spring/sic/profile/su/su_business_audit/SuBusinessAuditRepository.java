package spring.sic.profile.su.su_business_audit;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface SuBusinessAuditRepository extends JpaRepository<SuBusinessAuditEntity, UUID> {
}
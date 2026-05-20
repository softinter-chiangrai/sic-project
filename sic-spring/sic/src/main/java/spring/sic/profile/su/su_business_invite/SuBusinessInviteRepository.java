package spring.sic.profile.su.su_business_invite;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface SuBusinessInviteRepository extends JpaRepository<SuBusinessInviteEntity, UUID> {
}
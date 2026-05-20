package spring.sic.profile.su.su_task;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface SuTaskRepository extends JpaRepository<SuTaskEntity, UUID> {
}
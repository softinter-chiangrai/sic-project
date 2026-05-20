package spring.sic.profile.su.su_program;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface SuProgramRepository extends JpaRepository<SuProgramEntity, UUID> {
}
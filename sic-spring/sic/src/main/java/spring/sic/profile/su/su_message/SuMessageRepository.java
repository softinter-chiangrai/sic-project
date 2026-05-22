package spring.sic.profile.su.su_message;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SuMessageRepository extends JpaRepository<SuMessageEntity, UUID> {

    List<SuMessageEntity> findByProgramCodeAndIsActiveTrueAndIsDeleteFalse(String programCode);
}
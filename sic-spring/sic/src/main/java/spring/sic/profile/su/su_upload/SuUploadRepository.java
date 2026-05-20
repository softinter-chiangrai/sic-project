package spring.sic.profile.su.su_upload;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface SuUploadRepository extends JpaRepository<SuUploadEntity, UUID> {
}
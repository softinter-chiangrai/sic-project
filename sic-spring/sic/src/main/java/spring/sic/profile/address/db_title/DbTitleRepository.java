package spring.sic.profile.address.db_title;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface DbTitleRepository extends JpaRepository<DbTitleEntity, UUID> {
}
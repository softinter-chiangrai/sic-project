package spring.sic.profile.utils.db_parameter;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface DbParameterRepository extends JpaRepository<DbParameterEntity, UUID> {
}
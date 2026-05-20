package spring.sic.profile.address.db_district;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface DbDistrictRepository extends JpaRepository<DbDistrictEntity, UUID> {
}

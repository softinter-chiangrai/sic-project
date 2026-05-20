package spring.sic.profile.address.db_sub_district;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface DbSubDistrictRepository extends JpaRepository<DbSubDistrictEntity, UUID> {
}
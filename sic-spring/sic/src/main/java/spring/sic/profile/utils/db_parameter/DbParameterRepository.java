package spring.sic.profile.utils.db_parameter;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import spring.sic.profile.su.su_message.SuMessageEntity;

import java.util.List;
import java.util.UUID;

@Repository
public interface DbParameterRepository extends JpaRepository<DbParameterEntity, UUID> {

    List<DbParameterEntity> findByModuleCodeAndIsActiveTrueAndIsDeleteFalse(String moduleCode);
    
    
}
package com.softinter.sicapi.repository.su;

import com.softinter.sicapi.entity.su.SuProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SuProfileRepository extends JpaRepository<SuProfile, UUID> {

    Optional<SuProfile> findByUserId(String userId); 
    
    boolean existsByUserId(String userId);

    // หรือถ้าต้องการ check isDelete
    Optional<SuProfile> findByUserIdAndIsDeleteFalse(String userId);

    boolean existsByEmailIgnoreCase(String email);
}
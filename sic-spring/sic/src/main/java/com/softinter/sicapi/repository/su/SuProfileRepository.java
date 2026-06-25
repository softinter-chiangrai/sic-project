package com.softinter.sicapi.repository.su;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.softinter.sicapi.entity.su.SuProfile;

@Repository
public interface SuProfileRepository extends JpaRepository<SuProfile, UUID> {

    Optional<SuProfile> findByUserId(String userId); 
    
    boolean existsByUserId(String userId);

    // หรือถ้าต้องการ check isDelete
    Optional<SuProfile> findByUserIdAndIsDeleteFalse(String userId);

    boolean existsByEmailIgnoreCase(String email);
    
    Optional<SuProfile> findByEmailIgnoreCase(String email);

    Optional<SuProfile> findByPhoneNumber(String phoneNumber);

    Optional<SuProfile> findByTaxId(String taxId);

    // SuProfileRepository.java
boolean existsByPhoneNumber(String phoneNumber);
boolean existsByTaxId(String taxId);
}
package com.softinter.sicapi.repository.su;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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


    boolean existsByPhoneNumber(String phoneNumber);
    
    boolean existsByTaxId(String taxId);

    @Query("SELECT p FROM SuProfile p WHERE p.userId IN :userIds")
    List<SuProfile> findByUserIdIn(@Param("userIds") List<String> userIds);
}
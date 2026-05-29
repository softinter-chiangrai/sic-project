package com.softinter.sicapi.repository.su;

import com.softinter.sicapi.entity.su.SuVerify;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SuVerifyRepository extends JpaRepository<SuVerify, UUID> {
    Optional<SuVerify> findByVerifyTokenAndIsActiveTrue(String verifyToken);
    Optional<SuVerify> findByUserIdAndIsActiveTrue(String userId);
}

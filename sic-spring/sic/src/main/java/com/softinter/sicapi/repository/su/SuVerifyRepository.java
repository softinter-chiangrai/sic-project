package com.softinter.sicapi.repository.su;

import com.softinter.sicapi.entity.su.SuVerify;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SuVerifyRepository extends JpaRepository<SuVerify, UUID> {
    
    Optional<SuVerify> findByToken(String token);  // เพิ่ม method นี้
    
    // หรือถ้าต้องการค้นหาทั้ง token และ isActive
    Optional<SuVerify> findByTokenAndIsActiveTrue(String token);  // แต่ต้องมี field isActive
}
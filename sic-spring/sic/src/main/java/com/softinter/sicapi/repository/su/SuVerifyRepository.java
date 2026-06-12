package com.softinter.sicapi.repository.su;

import com.softinter.sicapi.entity.su.SuVerify;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SuVerifyRepository extends JpaRepository<SuVerify, UUID> {
    
    // 1. ค้นหาด้วย token (พื้นฐานที่สุด)
    Optional<SuVerify> findByToken(String token);
    
    // 2. ค้นหา token ที่ยังไม่ถูกลบและยังไม่หมดอายุ
    Optional<SuVerify> findByTokenAndIsDeleteFalseAndExpireAtAfter(String token, Instant now);
    
    // 3. ค้นหาคำขอ verification ที่ค้างอยู่ (ยังไม่ถูกลบ, ยังไม่หมดอายุ) สำหรับ reference + type
    //    ใช้ตอนขอ verify ใหม่ (ป้องกันสร้างหลายตัว)
    Optional<SuVerify> findByReferenceNumberAndVerifyTypeAndIsDeleteFalseAndExpireAtAfter(
        String referenceNumber, String verifyType, Instant now);
    
    // 4. นับจำนวนคำขอ verification ที่ active (ใช้ limit การส่ง OTP/email)
    long countByReferenceNumberAndVerifyTypeAndIsDeleteFalseAndExpireAtAfter(
        String referenceNumber, String verifyType, Instant now);
    
    // 5. ค้นหา token ที่ยังไม่ถูกลบ
    Optional<SuVerify> findByTokenAndIsDeleteFalse(String token);
}
package com.softinter.sicapi.service;

import com.softinter.sicapi.dto.response.VerifyTokenResponse;

public interface VerifyService {
    VerifyTokenResponse generateVerifyToken(String email);
    
    // ตัวเดิม (ถ้ามีที่อื่นใช้อยู่ ให้คงไว้)
    VerifyTokenResponse verifyToken(String token);
    
    // เพิ่ม method ใหม่ ให้รับ referenceNumber และ token (เหมือน .NET)
    VerifyTokenResponse verifyToken(String type, String referenceNumber, String token);
}
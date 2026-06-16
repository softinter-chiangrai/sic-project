package com.softinter.sicapi.dto.response;

import lombok.Data;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.softinter.sicapi.entity.ex.StorageUploadReference;

@Data
public class ProfileResponse {
    // 1. ข้อมูลหลัก
    private UUID id;
    private String taxId;
    
    // 2. คำนำหน้า (มีแค่ ID ตาม .NET)
    private UUID titleId;
    
    // 3. ชื่อ (แยก En/Local)
    private String firstNameEn;
    private String middleNameEn;   
    private String lastNameEn;
    private String firstNameLocal;
    private String middleNameLocal; 
    private String lastNameLocal;
    
    // 4. ประเทศ (มีแค่ ID)
    private UUID countryId;
    
    // 5. ที่อยู่ (แยกชัด และ Flag)
    private Boolean supportLocalAddress; // ใช้ Boolean ให้เป็น Object กันค่า null
    private String addressEn;
    private String addressLocal;
    
    // 6. จังหวัด อำเภอ ตำบล (มีแค่ ID)
    private UUID provinceId;
    private UUID districtId;
    private UUID subDistrictId;
    
    private String zipCode;
    
    // 7. การติดต่อ
    private String email;
    private String phoneNumber;
    
    // 8. ไฟล์แนบ (ตาม .NET เลย)
    private UUID uploadGroupId;
    private List<StorageUploadReference> uploadGroupData = new ArrayList<>(); // .NET ส่ง [] ว่างมาเสมอใน Query นี้
    
    // 9. ตัวนี้ .NET มีใน Query (ถึงแม้ Response Class ที่ให้มาจะลืมใส่ แต่ถ้าใส่ไปก็ถือว่าทำถูกต้อง)
    private Integer rowVersion; // .NET อาจเป็น byte[] หรือ Timestamp แต่ Integer ก็ใช้ได้

    private String avatarUrl;
}
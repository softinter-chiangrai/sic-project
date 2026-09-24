package com.softinter.sicapi.service;

import com.softinter.sicapi.dto.request.DocumentVersionRequest;
import com.softinter.sicapi.dto.response.DocumentVersionResponse;

import java.util.List;
import java.util.UUID;

public interface DocumentVersionService {

    // ===== Core CRUD =====
    List<DocumentVersionResponse> getVersions(String documentType, UUID documentId);

    List<DocumentVersionResponse> getVersionsByProject(UUID projectId, String documentType);

    List<DocumentVersionResponse> getAllVersions(String documentType);

    DocumentVersionResponse getVersion(UUID id);

    UUID saveVersion(DocumentVersionRequest request);

    void deleteVersion(UUID id);

    void activateVersion(UUID id);

    // ===== Bulk Operations =====
    void deleteVersionsByDocument(String documentType, UUID documentId);

    // ===== Helper Methods =====
    void createVersion(String documentType, UUID documentId, String versionNo, String changeSummary);

    void createVersion(String documentType, UUID documentId, UUID projectId, String documentCode, String versionNo, String changeSummary);

    void createVersion(String documentType, UUID documentId, UUID projectId, String documentCode, String versionNo, String changeSummary, String snapshotData);

    void createVersion(String documentType, UUID documentId, UUID projectId, String documentCode, String versionNo, String changeSummary, String snapshotData, UUID fileRefId, String filePath);

    String incrementVersion(String currentVersion);

    String promoteToMajorVersion(String currentVersion);

    /**
     * คืนค่าเวอร์ชันเดิมโดยไม่ขยับเลข (ใช้ตอนบันทึก/อนุมัติเอกสาร) ถ้ายังไม่มีเวอร์ชันให้เริ่มที่ v0.1
     */
    String keepVersion(String currentVersion);

    /**
     * bump เวอร์ชันแบบ semver (X.Y.Z) ตามระดับการเปลี่ยน: PATCH = Z+1, MINOR = Y+1 (Z=0), MAJOR = X+1 (Y=0, Z=0)
     * รองรับเวอร์ชันเก่า 2 ส่วน (เช่น v1.3) โดยถือว่า patch = 0 และคง prefix "v" ตามเดิม
     */
    String bumpVersion(String currentVersion, String changeLevel);

    boolean isVersionExists(String documentType, UUID documentId);

    /**
     * ดึงเลขเวอร์ชันล่าสุด (ไม่รวมรายการที่ถูกลบ) ของเอกสารนี้โดยตรงจากฐานข้อมูล
     * ต่างจาก getVersions(...).stream().findFirst() ตรงที่ query แถวเดียวและกรอง isDelete=false เสมอ
     * จึงเป็นแหล่งอ้างอิงที่น่าเชื่อถือกว่าเมื่อจะนำไปคำนวณเวอร์ชันถัดไป (increment / promote)
     */
    String getLatestVersionNo(String documentType, UUID documentId);
}
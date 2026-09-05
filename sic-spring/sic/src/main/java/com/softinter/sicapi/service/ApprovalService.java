// ============================================================
// 6. ApprovalService.java (เพิ่ม method)
// ============================================================
package com.softinter.sicapi.service;

import com.softinter.sicapi.dto.request.ApprovalSearchRequest;
import com.softinter.sicapi.dto.request.ApprovalSubmitRequest;
import com.softinter.sicapi.dto.response.ApprovalResponse;
import com.softinter.sicapi.dto.response.ApprovalSummaryResponse;
import com.softinter.sicapi.dto.response.CancelApprovalResponse;
import com.softinter.sicapi.dto.response.PaginationResponse;
import com.softinter.sicapi.entity.enums.ApprovalStatus;

import java.util.UUID;

import org.springframework.data.domain.Pageable;

public interface ApprovalService {

    ApprovalResponse submitForApproval(ApprovalSubmitRequest request);

    ApprovalResponse getApproval(UUID id);

    PaginationResponse<ApprovalResponse> getApprovalsByDocument(String documentType, UUID documentId, Pageable pageable);

    PaginationResponse<ApprovalResponse> getPendingApprovals(String userId, Pageable pageable);

    PaginationResponse<ApprovalResponse> getApprovedHistory(String userId, Pageable pageable);

    PaginationResponse<ApprovalResponse> getMyRequests(String userId, Pageable pageable);

    PaginationResponse<ApprovalResponse> searchApprovals(ApprovalSearchRequest request);

    ApprovalResponse approve(UUID approvalId, String comment, String signature);

    ApprovalResponse reject(UUID approvalId, String comment);

    ApprovalResponse requestRevision(UUID approvalId, String comment);

    ApprovalResponse cancel(UUID approvalId, String reason);

    ApprovalResponse delegate(UUID approvalId, String delegateToUserId, String comment);

    boolean canApprove(UUID approvalId, String userId);

    boolean isApproved(String documentType, UUID documentId);

    /**
     * โยน DocumentLockedException ถ้าเอกสารนี้มีสถานะอนุมัติ (APPROVED) ที่ active อยู่
     * ต้องเรียกเป็นคำสั่งแรกในสาขา "แก้ไขเอกสารเดิม" ของทุก save/update method
     * ก่อนอ่านค่า rowVersion/oldStatus หรือ diff ใด ๆ
     */
    void assertNotApproved(String documentType, UUID documentId);

    /**
     * ปลดล็อคเอกสารเป้าหมายหลังจาก Change Request ที่มีผลต่อเอกสารนี้ถูก implement แล้ว:
     * bump เวอร์ชัน (ถ้ามี field เวอร์ชัน), ตั้งสถานะเอกสารกลับเป็นค่าที่แก้ไขได้ตามประเภทเอกสาร,
     * และ deactivate PmApproval record เดิมที่ APPROVED อยู่ เพื่อให้ isApproved()/assertNotApproved()
     * คืนค่า false อีกครั้ง
     */
    void unlockDocumentAfterChange(String documentType, UUID documentId, String reason);

    /**
     * สร้าง Revision ใหม่จากเอกสารที่ APPROVED แล้วโดยตรง (ไม่ผ่าน Change Request):
     * ฉบับอนุมัติเดิมถูก snapshot ไว้ใน pm_document_version อยู่แล้วตอน approve ครั้งก่อน
     * เมธอดนี้จึงแค่ปลดล็อคเอกสาร (bump เวอร์ชัน + ตั้งสถานะกลับเป็นแก้ไขได้ + deactivate
     * PmApproval record เดิม) เพื่อเปิดให้เริ่มแก้ไขรอบใหม่ ผ่านกลไกเดียวกับ unlockDocumentAfterChange
     *
     * @throws IllegalStateException ถ้าเอกสารยังไม่ได้รับการอนุมัติ (ใช้ endpoint นี้ได้เฉพาะเอกสารที่ล็อคอยู่)
     */
    void createRevision(String documentType, UUID documentId, String reason);

    ApprovalStatus getCurrentStatus(String documentType, UUID documentId);

    ApprovalSummaryResponse getSummary();

    void validateDocument(String documentType, UUID documentId);

    CancelApprovalResponse cancelByFlow(UUID flowId, String reason);

    void processTimeouts();

    /**
     * ยกเลิกคำขออนุมัติที่ pending อยู่ของเอกสาร (ถ้ามี) โดยไม่แตะสถานะของเอกสารเอง —
     * ใช้เมื่อเอกสารถูกแก้ไขระหว่างรอการอนุมัติ เพื่อป้องกันไม่ให้ผู้อนุมัติอนุมัติเนื้อหาที่ล้าสมัย
     * ผู้เรียกเป็นคนกำหนดสถานะสุดท้ายของเอกสารเอง (เช่น "Changed")
     *
     * @return true ถ้ามีคำขออนุมัติที่ pending และถูกยกเลิกไป, false ถ้าไม่มี
     */
    boolean invalidatePendingApproval(String documentType, UUID documentId, String reason);
}
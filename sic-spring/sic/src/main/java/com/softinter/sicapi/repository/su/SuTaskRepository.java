package com.softinter.sicapi.repository.su;

import com.softinter.sicapi.entity.su.SuTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SuTaskRepository extends JpaRepository<SuTask, UUID> {
    // ค้นหา task ที่ active (is_active = true)
    List<SuTask> findByIsActiveTrue();
    
    // ค้นหา task ที่ active และไม่ถูกลบ
    List<SuTask> findByIsActiveTrueAndIsDeleteFalse();
    
    // ค้นหา task ตาม business_id (ถ้ามี business_id ใน entity)
    List<SuTask> findByBusinessIdAndIsActiveTrue(UUID businessId);
    
    // ค้นหา task ตาม task_code
    List<SuTask> findByTaskCode(String taskCode);
    
    // ค้นหา task ที่ active เรียงตาม created_date (ใช้แทน sort_order)
    List<SuTask> findByIsActiveTrueOrderByCreatedDateAsc();
    
    // ค้นหา task ที่ active เรียงตาม task_code
    List<SuTask> findByIsActiveTrueOrderByTaskCodeAsc();
}

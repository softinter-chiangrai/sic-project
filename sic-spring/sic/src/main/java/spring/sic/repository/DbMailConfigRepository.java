// Repository: DbMailConfigRepository.java
package spring.sic.repository;

import spring.sic.entity.DbMailConfigEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DbMailConfigRepository extends JpaRepository<DbMailConfigEntity, Long> {

    // ค้นหาทั้งหมดที่ยังไม่ถูกลบ
    List<DbMailConfigEntity> findByIsDeleteFalse();
    
    // ค้นหาแบบ Page ที่ยังไม่ถูกลบ
    Page<DbMailConfigEntity> findByIsDeleteFalse(Pageable pageable);
    
    // ค้นหาที่ active และไม่ถูกลบ
    List<DbMailConfigEntity> findByIsActiveTrueAndIsDeleteFalse();
    
    // ค้นหาตามชื่อ configuration (ไม่ถูกลบ)
    Optional<DbMailConfigEntity> findByConfigNameAndIsDeleteFalse(String configName);
    
    // ค้นหาตาม id ที่ยังไม่ถูกลบ
    Optional<DbMailConfigEntity> findByIdAndIsDeleteFalse(Long id);
    
    // ค้นหาการตั้งค่าที่ enable SSL และ active
    List<DbMailConfigEntity> findByEnableSslTrueAndIsActiveTrueAndIsDeleteFalse();
    
    // ค้นหา active config เรียงตาม sort_order
    List<DbMailConfigEntity> findByIsActiveTrueAndIsDeleteFalseOrderBySortOrderAsc();
    
    // Soft delete
    @Modifying
    @Transactional
    @Query("UPDATE DbMailConfigEntity c SET c.isDelete = true, c.deleteBy = :deletedBy, " +
           "c.deleteDate = :deleteDate WHERE c.id = :id")
    void softDeleteById(@Param("id") Long id, @Param("deletedBy") String deletedBy, 
                        @Param("deleteDate") LocalDateTime deleteDate);
    
    // คืนค่า configuration ที่ active (ใช้เป็นค่าเริ่มต้น)
    @Query(value = "SELECT * FROM db_mail_config WHERE is_active = true AND is_delete = false " +
                   "ORDER BY sort_order ASC LIMIT 1", nativeQuery = true)
    Optional<DbMailConfigEntity> findFirstActiveConfig();
    
    // นับจำนวน config ที่ active
    long countByIsActiveTrueAndIsDeleteFalse();
}
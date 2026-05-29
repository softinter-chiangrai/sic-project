package com.softinter.sicapi.repository.su;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.softinter.sicapi.entity.su.SuMessage;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SuMessageRepository extends JpaRepository<SuMessage, UUID> {

    List<SuMessage> findByIsDeleteFalse();

    List<SuMessage> findByModuleCodeAndProgramCodeAndIsDeleteFalse(String moduleCode, String programCode);

    Optional<SuMessage> findByIdAndIsDeleteFalse(UUID id);

    // 🌟 เพิ่มเมธอดนี้เข้าไป เพื่อให้ฝั่ง Service เรียกใช้
    List<SuMessage> findByModuleCodeAndIsDeleteFalseOrderByMessageCode(String moduleCode);
}
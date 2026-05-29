package com.softinter.sicapi.repository.su;

import com.softinter.sicapi.entity.su.SuProgram;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SuProgramRepository extends JpaRepository<SuProgram, UUID>, JpaSpecificationExecutor<SuProgram> {

    @Query("SELECT p FROM SuProgram p LEFT JOIN FETCH p.parentProgram WHERE p.id = :id AND p.isDelete = false")
    Optional<SuProgram> findByIdWithParent(@Param("id") UUID id);

    @Query("SELECT p FROM SuProgram p WHERE p.isDelete = false AND p.isActive = true ORDER BY p.sortOrder, p.programCode")
    List<SuProgram> findAllActive();

    @Query("SELECT p FROM SuProgram p WHERE p.isDelete = false ORDER BY p.sortOrder, p.programCode")
    List<SuProgram> findAllActiveForPage();
}

package com.softinter.sicapi.repository.pm;

import com.softinter.sicapi.entity.pm.PmDiagramProject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PmDiagramProjectRepository extends JpaRepository<PmDiagramProject, UUID> {

    List<PmDiagramProject> findByUserIdAndIsDeleteFalseOrderByLastOpenedDesc(String userId);

    List<PmDiagramProject> findByUserIdAndIsFavoriteTrueAndIsDeleteFalseOrderByName(String userId);

    @Query("SELECT p FROM PmDiagramProject p WHERE p.userId = :userId AND p.isDelete = false AND LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<PmDiagramProject> searchByUserIdAndKeyword(@Param("userId") String userId, @Param("keyword") String keyword);

    boolean existsByUserIdAndNameAndIsDeleteFalse(String userId, String name);
}
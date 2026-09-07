package com.softinter.sicapi.repository.su;

import com.softinter.sicapi.entity.su.SuAuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SuAuditLogRepository extends JpaRepository<SuAuditLog, UUID>, JpaSpecificationExecutor<SuAuditLog> {

    @Query("SELECT a FROM SuAuditLog a WHERE " +
           "(:searchTerm IS NULL OR :searchTerm = '' OR " +
           " LOWER(a.username) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           " LOWER(a.userFullname) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           " LOWER(a.action) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           " LOWER(a.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           " LOWER(a.module) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) AND " +
           "(:module IS NULL OR :module = '' OR :module = 'all' OR a.module = :module) AND " +
           "(:status IS NULL OR :status = '' OR :status = 'all' OR LOWER(a.status) = LOWER(:status)) AND " +
           "(:username IS NULL OR :username = '' OR :username = 'all' OR a.username = :username OR a.userFullname = :username OR a.userId = :username)")
    Page<SuAuditLog> searchLogs(
            @Param("searchTerm") String searchTerm,
            @Param("module") String module,
            @Param("status") String status,
            @Param("username") String username,
            Pageable pageable
    );

    @Query("SELECT DISTINCT a.module FROM SuAuditLog a WHERE a.module IS NOT NULL AND a.module <> '' ORDER BY a.module ASC")
    List<String> findDistinctModules();

    @Query("SELECT DISTINCT a.username, a.userFullname, a.userId FROM SuAuditLog a WHERE (a.username IS NOT NULL AND a.username <> '') OR (a.userFullname IS NOT NULL AND a.userFullname <> '') ORDER BY a.username ASC")
    List<Object[]> findDistinctUsers();
}

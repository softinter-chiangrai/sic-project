package com.softinter.sicapi.repository.db;

import com.softinter.sicapi.entity.db.DbCountry;
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
public interface DbCountryRepository extends JpaRepository<DbCountry, UUID>, JpaSpecificationExecutor<DbCountry> {
    Page<DbCountry> findByIsActiveTrue(Pageable pageable);
    Page<DbCountry> findByIsActiveTrueAndCountryNameEnContainingIgnoreCase(String keyword, Pageable pageable);
    @Query("SELECT c FROM DbCountry c WHERE c.isActive = true ORDER BY " +
           "CASE WHEN :useEnglish = true THEN c.countryNameEn ELSE c.countryNameLocal END")
    List<DbCountry> findByIsActiveTrueOrderByName(@Param("useEnglish") boolean useEnglish);
}
package com.softinter.sicapi.repository.db;

import com.softinter.sicapi.entity.db.DbCountry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DbCountryRepository extends JpaRepository<DbCountry, UUID> {
    List<DbCountry> findByIsActiveTrueOrderByCountryNameEn();
}

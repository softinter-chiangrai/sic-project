package com.softinter.sicapi.repository;

import com.softinter.sicapi.entity.base.BaseEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@NoRepositoryBean
public interface BaseRepository<T extends BaseEntity, ID> extends JpaRepository<T, ID> {

    @Query("SELECT e FROM #{#entityName} e WHERE e.id = :id AND e.isDelete = false")
    Optional<T> findByIdActive(@Param("id") UUID id);

    @Query("SELECT e FROM #{#entityName} e WHERE e.isDelete = false")
    List<T> findAllActive();

    @Modifying
    @Query("UPDATE #{#entityName} e SET e.isDelete = true, e.deleteBy = :deletedBy, e.deleteDate = :deleteDate WHERE e.id = :id")
    void softDelete(@Param("id") UUID id, @Param("deletedBy") String deletedBy, @Param("deleteDate") Instant deleteDate);
}

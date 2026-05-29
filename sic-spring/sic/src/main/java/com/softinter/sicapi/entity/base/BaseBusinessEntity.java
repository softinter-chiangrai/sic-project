package com.softinter.sicapi.entity.base;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.JdbcTypeCode;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.sql.Types;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@EqualsAndHashCode(of = "id")
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseBusinessEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    @JdbcTypeCode(Types.VARCHAR)
    private UUID id;

    @CreatedBy
    @Column(name = "created_by", nullable = false, length = 100)
    private String createdBy = "system";

    @CreatedDate
    @Column(name = "created_date", nullable = false)
    private LocalDateTime createdDate;

    @LastModifiedBy
    @Column(name = "updated_by", nullable = false, length = 100)
    private String updatedBy = "system";

    @LastModifiedDate
    @Column(name = "updated_date", nullable = false)
    private LocalDateTime updatedDate;

    @Column(name = "is_delete", nullable = false)
    private Boolean isDelete = false;

    @Column(name = "delete_by", length = 100)
    private String deleteBy;

    @Column(name = "delete_date")
    private LocalDateTime deleteDate;

    @Column(name = "business_id", nullable = false, length = 36)
    @JdbcTypeCode(Types.VARCHAR)
    private UUID businessId;

    @Version
    @Column(name = "row_version")
    private Long rowVersion;

    @Transient
    private EntityState state = EntityState.DETACHED;

    public enum EntityState {
        DETACHED, UNCHANGED, ADDED, MODIFIED, DELETED
    }

    @PrePersist
    @PreUpdate
    public void prePersist() {
        if (this.id == null) {
            this.id = UUID.randomUUID();
        }
        if (this.isDelete == null) {
            this.isDelete = false;
        }
    }
}

package com.softinter.sicapi.entity.base;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.GenericGenerator;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.softinter.sicapi.entity.enums.EntityState;

import java.time.Instant; // เปลี่ยนมาใช้ java.time.Instant และลบ Instant ออก
import java.util.UUID;

@Data
@EqualsAndHashCode(of = "id")
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @CreatedBy
    @Column(name = "created_by", nullable = false, length = 100)
    private String createdBy = "system";

    @CreatedDate
    @Column(name = "created_date", nullable = false, updatable = false) // แนะนำเพิ่ม updatable = false ป้องกันการถูกเขียนทับ
    private Instant createdDate; // เปลี่ยนเป็น Instant

    @LastModifiedBy
    @Column(name = "updated_by", nullable = false, length = 100)
    private String updatedBy = "system";

    @LastModifiedDate
    @Column(name = "updated_date", nullable = false)
    private Instant updatedDate; // เปลี่ยนเป็น Instant

    @Column(name = "is_delete", nullable = false)
    private Boolean isDelete = false;

    @Column(name = "delete_by", length = 100)
    private String deleteBy;

    @Column(name = "delete_date")
    private Instant deleteDate; // เปลี่ยนเป็น Instant
    
    @Version
    @Column(name = "xmin", columnDefinition = "xid", insertable = false, updatable = false)
    private Integer  rowVersion;
    
    @Transient
    private EntityState state = EntityState.DETACHED;

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
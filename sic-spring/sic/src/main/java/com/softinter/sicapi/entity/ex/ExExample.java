package com.softinter.sicapi.entity.ex;

import com.softinter.sicapi.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "ex_example")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class ExExample extends BaseEntity {

    @Column(name = "example_code", nullable = false, length = 50)
    private String exampleCode;

    @Column(name = "message_en", nullable = false, columnDefinition = "TEXT")
    private String messageEn;

    @Column(name = "message_local", nullable = false, columnDefinition = "TEXT")
    private String messageLocal;

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;

    @Column(name = "start_time")
    private String startTime;

    @Column(name = "end_time")
    private String endTime;

    @Column(name = "is_accept")
    private String isAccept;

    @Column(name = "color")
    private String color;

    @Column(name = "country_code")
    private String countryCode;

    @Column(name = "total", nullable = false)
    private Long total;

    @Column(name = "upload_group_id")
    private UUID uploadGroupId;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = false;

    @Transient
    private List<StorageUploadReference> uploadGroupData;
}

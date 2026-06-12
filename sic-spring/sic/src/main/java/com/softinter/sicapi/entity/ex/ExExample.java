package com.softinter.sicapi.entity.ex;

import com.softinter.sicapi.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "ex_example")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class ExExample extends BaseEntity {

     @Column(name = "example_code", length = 100)
    private String exampleCode;

    @Column(name = "message_en", length = 500)
    private String messageEn;

    @Column(name = "message_local", length = 500)
    private String messageLocal;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Column(name = "is_accept")
    private Boolean isAccept = false;

    @Column(name = "color", length = 50)
    private String color;

    @Column(name = "country_code", length = 10)
    private String countryCode;

    @Column(name = "total")
    private BigDecimal total;

    @Column(name = "upload_group_id")
    private UUID uploadGroupId;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Transient
    private List<StorageUploadReference> uploadGroupData;
}

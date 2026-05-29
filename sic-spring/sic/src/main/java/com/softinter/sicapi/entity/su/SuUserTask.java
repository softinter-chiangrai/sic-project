package com.softinter.sicapi.entity.su;

import com.softinter.sicapi.entity.base.BaseBusinessEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "su_user_task")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class SuUserTask extends BaseBusinessEntity {

    @Column(name = "title", nullable = false, length = 100)
    private String title;

    @Column(name = "start_time")
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Column(name = "description", length = 2000)
    private String description;

    @Column(name = "task_id", insertable = false, updatable = false)
    private UUID taskId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    private SuTask task;
}
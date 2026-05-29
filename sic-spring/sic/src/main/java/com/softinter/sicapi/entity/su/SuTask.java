package com.softinter.sicapi.entity.su;

import com.softinter.sicapi.entity.base.BaseBusinessEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "su_task")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class SuTask extends BaseBusinessEntity {

    @Column(name = "task_code", nullable = false, length = 20)
    private String taskCode;

    @Column(name = "task_name_en", length = 255)
    private String taskNameEn;

    @Column(name = "task_name_local", length = 255)
    private String taskNameLocal;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = false;

    @OneToMany(mappedBy = "task", fetch = FetchType.LAZY)
    private List<SuUserTask> userTasks = new ArrayList<>();
}

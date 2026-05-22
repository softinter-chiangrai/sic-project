package spring.sic.profile.su.su_user_task;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "su_user_task")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SuUserTaskEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "title", length = 100)
    private String title;

    @Column(name = "start_time", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime startTime;

    @Column(name = "end_time", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime endTime;

    @Column(name = "is_active")
    private Boolean isActive;

    @Column(name = "task_id")
    private UUID taskId;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "created_date", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime createdDate;

    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    @Column(name = "updated_date", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime updatedDate;

    @Column(name = "is_delete")
    private Boolean isDelete;

    @Column(name = "delete_by", length = 100)
    private String deleteBy;

    @Column(name = "delete_date", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime deleteDate;
}
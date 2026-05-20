package spring.sic.profile.su.su_user_task;

import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class SuUserTaskModel {
    private UUID id;
    private String title;
    private OffsetDateTime startTime;
    private OffsetDateTime endTime;
    private Boolean isActive;
    private UUID taskId;
    private String createdBy;
    private OffsetDateTime createdDate;
    private String updatedBy;
    private OffsetDateTime updatedDate;
    private Boolean isDelete;
    private String deleteBy;
    private OffsetDateTime deleteDate;
}
package spring.sic.profile.su.su_verify;

import jakarta.persistence.*;
import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "su_verify")
@Data
public class SuVerifyEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "verify_type", length = 100)
    private String verifyType;

    @Column(name = "reference_number", length = 300)
    private String referenceNumber;

    @Column(name = "token", length = 300)
    private String token;

    @Column(name = "max_retry")
    private Integer maxRetry;

    @Column(name = "retry_count")
    private Integer retryCount;

    @Column(name = "expire_at", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime expireAt;

    @Column(name = "recipient", length = 100)
    private String recipient;

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
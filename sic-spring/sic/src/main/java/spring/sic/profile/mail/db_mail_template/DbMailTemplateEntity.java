package spring.sic.profile.mail.db_mail_template;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "db_mail_template")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DbMailTemplateEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "template_code", length = 50)
    private String templateCode;

    @Column(name = "template_name", length = 255)
    private String templateName;

    @Column(name = "subject_en", length = 255)
    private String subjectEn;

    @Column(name = "subject_local", length = 255)
    private String subjectLocal;

    @Column(columnDefinition = "TEXT")
    private String contentEn;

    @Column(columnDefinition = "TEXT")
    private String contentLocal;

    private Boolean status;

    @Column(name = "is_active")
    private Boolean isActive;

    @Column(length = 3000)
    private String variables;

    // Audit fields
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
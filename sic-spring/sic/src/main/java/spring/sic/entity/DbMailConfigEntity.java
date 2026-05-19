package spring.sic.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "db_mail_config")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DbMailConfigEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "config_name", nullable = false, length = 100)
    private String configName;

    @Column(name = "smtp_server", nullable = false, length = 255)
    private String smtpServer;

    @Column(name = "smtp_port")
    private Integer smtpPort;

    @Column(name = "email_from", length = 255)
    private String emailFrom;

    @Column(name = "username", length = 255)
    private String username;

    @Column(name = "password", length = 255)
    private String password;

    @Column(name = "enable_ssl")
    @Builder.Default
    private Boolean enableSsl = false;

    @Column(name = "sort_order")
    private Integer sortOrder;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "max_retry")
    @Builder.Default
    private Integer maxRetry = 3;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "created_date")
    private LocalDateTime createdDate;

    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    @Column(name = "updated_date")
    private LocalDateTime updatedDate;

    @Column(name = "is_delete")
    @Builder.Default
    private Boolean isDelete = false;

    @Column(name = "delete_by", length = 100)
    private String deleteBy;

    @Column(name = "delete_date")
    private LocalDateTime deleteDate;
}

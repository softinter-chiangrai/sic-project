package com.softinter.sicapi.entity.db;

import com.softinter.sicapi.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "db_mail_config")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class DbMailConfig extends BaseEntity {

    @Column(name = "config_name", nullable = false, length = 100)
    private String configName;

    @Column(name = "smtp_server", nullable = false, length = 255)
    private String smtpServer;

    @Column(name = "smtp_port", nullable = false)
    private Integer smtpPort;

    @Column(name = "email_from", nullable = false, length = 320)
    private String emailFrom;

    @Column(name = "username", nullable = false, length = 100)
    private String username;

    @Column(name = "password", nullable = false, length = 500)
    private String password;

    @Column(name = "enable_ssl")
    private Boolean enableSsl = false;

    @Column(name = "sort_order")
    private Integer sortOrder = 1;

    @Column(name = "is_active")
    private Boolean isActive = false;

    @Column(name = "max_retry")
    private Integer maxRetry = 3;

    @Column(name = "description", length = 500)
    private String description;

    @OneToMany(mappedBy = "mailConfig") // assuming DbMailQueue has a field 'mailConfig'
    private List<DbMailQueue> mailQueues = new ArrayList<>();
}

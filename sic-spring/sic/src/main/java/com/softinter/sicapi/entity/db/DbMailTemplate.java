package com.softinter.sicapi.entity.db;

import com.softinter.sicapi.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "db_mail_template",
       indexes = {
           @Index(name = "idx_template_code", columnList = "template_code", unique = true)
       })
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class DbMailTemplate extends BaseEntity {

    @Column(name = "template_code", nullable = false, length = 50)
    private String templateCode;

    @Column(name = "template_name", nullable = false, length = 255)
    private String templateName;

    @Column(name = "subject_en", nullable = false, length = 255)
    private String subjectEn;

    @Column(name = "subject_local", nullable = false, length = 255)
    private String subjectLocal;

    @Column(name = "content_en", nullable = false, columnDefinition = "TEXT")
    private String contentEn;

    @Column(name = "content_local", nullable = false, columnDefinition = "TEXT")
    private String contentLocal;

    @Column(name = "is_html")
    private Boolean isHtml = false;

    @Column(name = "is_active")
    private Boolean isActive = false;

    @Column(name = "variables", length = 3000)
    private String variables;

    @OneToMany(mappedBy = "mailTemplate") // assuming DbMailQueue has a field 'mailTemplate'
    private List<DbMailQueue> mailQueues = new ArrayList<>();
}
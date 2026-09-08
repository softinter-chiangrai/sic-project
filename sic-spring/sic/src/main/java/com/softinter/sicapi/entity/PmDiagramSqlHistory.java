package com.softinter.sicapi.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "pm_diagram_sql_history")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PmDiagramSqlHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "tab_id", nullable = false, length = 100)
    private String tabId;

    @Column(name = "page_name", length = 255)
    private String pageName;

    @Column(name = "version_no", nullable = false)
    private Integer versionNo;

    @Column(name = "generation_type", nullable = false, length = 20)
    private String generationType; // 'FULL' or 'MIGRATION'

    @Column(name = "vendor", nullable = false, length = 50)
    private String vendor;

    @Column(name = "engine", nullable = false, length = 20)
    private String engine; // 'ai' or 'parser'

    @Column(name = "summary_note", columnDefinition = "TEXT")
    private String summaryNote;

    @Column(name = "schema_json", columnDefinition = "TEXT")
    private String schemaJson;

    @Column(name = "generated_sql", nullable = false, columnDefinition = "TEXT")
    private String generatedSql;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "created_by", length = 100)
    private String createdBy;
}

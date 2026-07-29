package com.softinter.sicapi.entity.pm;

import com.softinter.sicapi.entity.base.BaseBusinessEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.Map;

@Entity
@Table(name = "pm_specification_api")
@Data
@EqualsAndHashCode(callSuper = true)
public class PmSpecificationApi extends BaseBusinessEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "specification_id", nullable = false)
    private PmSpecification specification;

    @Column(name = "http_method", nullable = false, length = 10)
    private String httpMethod;

    @Column(name = "url", nullable = false, length = 500)
    private String url;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "request_schema", columnDefinition = "JSONB")
    private Map<String, Object> requestSchema;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "response_schema", columnDefinition = "JSONB")
    private Map<String, Object> responseSchema;

    @Column(length = 50)
    private String authentication;
}
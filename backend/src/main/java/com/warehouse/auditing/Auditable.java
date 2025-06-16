package com.warehouse.auditing;

import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.Temporal;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

import static jakarta.persistence.TemporalType.TIMESTAMP;

@Data
@NoArgsConstructor
@AllArgsConstructor
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class Auditable{

    @CreatedBy
    @Column(name = "created_by",
            nullable = false,
            updatable = false)
    protected String createdBy;

    @CreatedDate
    @Temporal(TIMESTAMP)
    @Column(name = "created_at",
            nullable = false,
            updatable = false)
    protected LocalDateTime createdAt;

    @LastModifiedBy
    @Column(name = "modified_by",
            insertable = false)
    protected String modifiedBy;

    @LastModifiedDate
    @Temporal(TIMESTAMP)
    @Column(name = "modified_at",
            insertable = false)
    protected LocalDateTime modifiedAt;

}

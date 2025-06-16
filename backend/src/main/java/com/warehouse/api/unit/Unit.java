package com.warehouse.api.unit;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.warehouse.auditing.Auditable;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
@Entity
@Table(name = "unit")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Unit extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "unit_id")
    private Long unitId;

    @NotBlank
    @Size(max = 50)
    @Column(unique = true)
    private String name;
}
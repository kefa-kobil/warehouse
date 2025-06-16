package com.warehouse.api.warehouse;

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
@Table(name = "warehouse")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Warehouse extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "warehouse_id")
    private Long warehouseId;

    @NotBlank
    @Size(max = 100)
    private String name;

    @NotBlank
    @Size(max = 200)
    private String location;

    @NotBlank
    @Size(max = 100)
    private String manager;

    @Size(max = 500)
    private String description;
}
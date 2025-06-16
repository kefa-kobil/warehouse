package com.warehouse.api.product;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.warehouse.api.category.Category;
import com.warehouse.api.unit.Unit;
import com.warehouse.api.warehouse.Warehouse;
import com.warehouse.auditing.Auditable;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@EqualsAndHashCode(callSuper = true)
@Data
@Entity
@Table(name = "product")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Product extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_id")
    private Long productId;

    @NotBlank
    @Size(max = 50)
    @Column(unique = true)
    private String code;

    @NotBlank
    @Size(max = 200)
    private String name;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Category category;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "warehouse_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Warehouse warehouse;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "unit_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Unit unit;

    @DecimalMin(value = "0.0", inclusive = true)
    @Column(name = "total_cost_price", precision = 10, scale = 2)
    private BigDecimal totalCostPrice = BigDecimal.ZERO;

    @DecimalMin(value = "0.0", inclusive = true)
    @Column(name = "sale_price", precision = 10, scale = 2)
    private BigDecimal salePrice = BigDecimal.ZERO;

    @Size(max = 1000)
    private String description;

    @DecimalMin(value = "0.0", inclusive = true)
    @Column(precision = 10, scale = 3)
    private BigDecimal quantity = BigDecimal.ZERO;

}
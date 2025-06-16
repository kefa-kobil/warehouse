package com.warehouse.api.production;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.warehouse.api.product.Product;
import com.warehouse.api.user.User;
import com.warehouse.api.warehouse.Warehouse;
import com.warehouse.auditing.Auditable;
import com.warehouse.enums.ProductionStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Data
@Entity
@Table(name = "production")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Production extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "production_id")
    private Long productionId;

    @Size(max = 100)
    @Column(name = "production_number", unique = true)
    private String productionNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Product product;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "warehouse_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Warehouse warehouse;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User user;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    @Column(name = "planned_quantity", precision = 10, scale = 3)
    private BigDecimal plannedQuantity;

    @DecimalMin(value = "0.0", inclusive = true)
    @Column(name = "produced_quantity", precision = 10, scale = 3)
    private BigDecimal producedQuantity = BigDecimal.ZERO;

    @NotNull
    @Enumerated(EnumType.STRING)
    private ProductionStatus status = ProductionStatus.PLANNED;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @Column(name = "planned_date")
    private LocalDateTime plannedDate;

    @Size(max = 1000)
    private String notes;

    @OneToMany(mappedBy = "production", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ProductionItem> productionItems;

    @DecimalMin(value = "0.0", inclusive = true)
    @Column(name = "total_cost", precision = 10, scale = 2)
    private BigDecimal totalCost = BigDecimal.ZERO;
}
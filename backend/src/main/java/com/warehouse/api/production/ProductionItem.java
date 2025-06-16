package com.warehouse.api.production;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.warehouse.api.item.Item;
import com.warehouse.auditing.Auditable;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@EqualsAndHashCode(callSuper = true)
@Data
@Entity
@Table(name = "production_item")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ProductionItem extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "production_item_id")
    private Long productionItemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "production_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Production production;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "item_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Item item;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    @Column(name = "required_quantity", precision = 10, scale = 3)
    private BigDecimal requiredQuantity;

    @DecimalMin(value = "0.0", inclusive = true)
    @Column(name = "used_quantity", precision = 10, scale = 3)
    private BigDecimal usedQuantity = BigDecimal.ZERO;

    @DecimalMin(value = "0.0", inclusive = true)
    @Column(name = "unit_cost", precision = 10, scale = 2)
    private BigDecimal unitCost = BigDecimal.ZERO;

    @DecimalMin(value = "0.0", inclusive = true)
    @Column(name = "total_cost", precision = 10, scale = 2)
    private BigDecimal totalCost = BigDecimal.ZERO;
}
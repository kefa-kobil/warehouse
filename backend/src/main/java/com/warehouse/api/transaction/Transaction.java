package com.warehouse.api.transaction;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.warehouse.api.item.Item;
import com.warehouse.api.product.Product;
import com.warehouse.api.user.User;
import com.warehouse.api.warehouse.Warehouse;
import com.warehouse.auditing.Auditable;
import com.warehouse.enums.EntityType;
import com.warehouse.enums.TransactionType;
import com.warehouse.enums.TransactionStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@EqualsAndHashCode(callSuper = true)
@Data
@Entity
@Table(name = "transaction")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Transaction extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "transaction_id")
    private Long transactionId;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type")
    private TransactionType transactionType;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "entity_type")
    private EntityType entityType;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "item_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Item item;

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
    @Column(precision = 10, scale = 3)
    private BigDecimal quantity;

    @DecimalMin(value = "0.0", inclusive = true)
    @Column(name = "unit_price", precision = 10, scale = 2)
    private BigDecimal unitPrice = BigDecimal.ZERO;

    @DecimalMin(value = "0.0", inclusive = true)
    @Column(name = "total_price", precision = 10, scale = 2)
    private BigDecimal totalPrice = BigDecimal.ZERO;

    @NotNull
    @Enumerated(EnumType.STRING)
    private TransactionStatus status = TransactionStatus.COMPLETED;

    @Size(max = 1000)
    private String notes;

    @Column(name = "transaction_date")
    private LocalDateTime transactionDate = LocalDateTime.now();

    @Size(max = 100)
    @Column(name = "reference_number")
    private String referenceNumber;
}
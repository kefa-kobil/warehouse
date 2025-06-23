package com.warehouse.api.materialreceipt;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.warehouse.api.item.Item;
import com.warehouse.auditing.Auditable;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@EqualsAndHashCode(callSuper = true, exclude = {"materialReceipt"})
@Data
@Entity
@Table(name = "material_receipt_item")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class MaterialReceiptItem extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "receipt_item_id")
    private Long receiptItemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receipt_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "materialReceiptItems"})
    private MaterialReceipt materialReceipt;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "item_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Item item;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    @Column(name = "ordered_quantity", precision = 10, scale = 3)
    private BigDecimal orderedQuantity;

    @DecimalMin(value = "0.0", inclusive = true)
    @Column(name = "received_quantity", precision = 10, scale = 3)
    private BigDecimal receivedQuantity = BigDecimal.ZERO;

    @DecimalMin(value = "0.0", inclusive = true)
    @Column(name = "unit_price", precision = 10, scale = 2)
    private BigDecimal unitPrice = BigDecimal.ZERO;

    @DecimalMin(value = "0.0", inclusive = true)
    @Column(name = "total_price", precision = 10, scale = 2)
    private BigDecimal totalPrice = BigDecimal.ZERO;
}
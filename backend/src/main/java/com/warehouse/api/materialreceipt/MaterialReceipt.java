package com.warehouse.api.materialreceipt;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.warehouse.api.user.User;
import com.warehouse.api.warehouse.Warehouse;
import com.warehouse.auditing.Auditable;
import com.warehouse.enums.MaterialReceiptStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@EqualsAndHashCode(callSuper = true, exclude = {"materialReceiptItems"})
@Data
@Entity
@Table(name = "material_receipt")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class MaterialReceipt extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "receipt_id")
    private Long receiptId;

    @Size(max = 100)
    @Column(name = "receipt_number", unique = true)
    private String receiptNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "warehouse_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Warehouse warehouse;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User user;

    @Enumerated(EnumType.STRING)
    private MaterialReceiptStatus status = MaterialReceiptStatus.PENDING;

    @Column(name = "receipt_date")
    private LocalDateTime receiptDate = LocalDateTime.now();

    @Column(name = "received_date")
    private LocalDateTime receivedDate;

    @Column(name = "total_amount", precision = 10, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Size(max = 1000)
    private String notes;

    @Size(max = 200)
    private String supplier;

    @OneToMany(mappedBy = "materialReceipt", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"materialReceipt"})
    private List<MaterialReceiptItem> materialReceiptItems;
}
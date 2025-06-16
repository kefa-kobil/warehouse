package com.warehouse.api.transaction;

import com.warehouse.enums.EntityType;
import com.warehouse.enums.TransactionType;
import com.warehouse.enums.TransactionStatus;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/transactions")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping
    public ResponseEntity<List<Transaction>> getAllTransactions() {
        return ResponseEntity.ok(transactionService.getAllTransactions());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Transaction> getTransactionById(@PathVariable Long id) {
        Transaction transaction = transactionService.getTransactionById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
        return ResponseEntity.ok(transaction);
    }

    @PostMapping
    public ResponseEntity<Transaction> createTransaction(@Valid @RequestBody Transaction transaction) {
        Transaction createdTransaction = transactionService.createTransaction(transaction);
        return ResponseEntity.ok(createdTransaction);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Transaction> updateTransaction(@PathVariable Long id,
                                                        @Valid @RequestBody Transaction transactionDetails) {
        Transaction updatedTransaction = transactionService.updateTransaction(id, transactionDetails);
        return ResponseEntity.ok(updatedTransaction);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTransaction(@PathVariable Long id) {
        transactionService.deleteTransaction(id);
        return ResponseEntity.ok(Map.of("message", "Transaction deleted successfully"));
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<Transaction>> getTransactionsByType(@PathVariable TransactionType type) {
        return ResponseEntity.ok(transactionService.getTransactionsByType(type));
    }

    @GetMapping("/entity-type/{entityType}")
    public ResponseEntity<List<Transaction>> getTransactionsByEntityType(@PathVariable EntityType entityType) {
        return ResponseEntity.ok(transactionService.getTransactionsByEntityType(entityType));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Transaction>> getTransactionsByStatus(@PathVariable TransactionStatus status) {
        return ResponseEntity.ok(transactionService.getTransactionsByStatus(status));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Transaction>> getTransactionsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(transactionService.getTransactionsByUserId(userId));
    }

    @GetMapping("/warehouse/{warehouseId}")
    public ResponseEntity<List<Transaction>> getTransactionsByWarehouseId(@PathVariable Long warehouseId) {
        return ResponseEntity.ok(transactionService.getTransactionsByWarehouseId(warehouseId));
    }

    @GetMapping("/item/{itemId}")
    public ResponseEntity<List<Transaction>> getTransactionsByItemId(@PathVariable Long itemId) {
        return ResponseEntity.ok(transactionService.getTransactionsByItemId(itemId));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<Transaction>> getTransactionsByProductId(@PathVariable Long productId) {
        return ResponseEntity.ok(transactionService.getTransactionsByProductId(productId));
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<Transaction>> getTransactionsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return ResponseEntity.ok(transactionService.getTransactionsByDateRange(startDate, endDate));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Transaction>> searchTransactionsByReference(@RequestParam String reference) {
        return ResponseEntity.ok(transactionService.searchTransactionsByReference(reference));
    }

    @GetMapping("/recent")
    public ResponseEntity<List<Transaction>> getRecentTransactions() {
        return ResponseEntity.ok(transactionService.getRecentTransactions());
    }

    // Quick transaction creation endpoints
    @PostMapping("/item/inbound")
    public ResponseEntity<Transaction> createItemInboundTransaction(@RequestBody Map<String, Object> request) {
        Long itemId = Long.valueOf(request.get("itemId").toString());
        Long warehouseId = Long.valueOf(request.get("warehouseId").toString());
        Long userId = Long.valueOf(request.get("userId").toString());
        BigDecimal quantity = new BigDecimal(request.get("quantity").toString());
        BigDecimal unitPrice = new BigDecimal(request.get("unitPrice").toString());
        String notes = request.get("notes") != null ? request.get("notes").toString() : "";

        Transaction transaction = transactionService.createItemInboundTransaction(
                itemId, warehouseId, userId, quantity, unitPrice, notes);
        return ResponseEntity.ok(transaction);
    }

    @PostMapping("/product/inbound")
    public ResponseEntity<Transaction> createProductInboundTransaction(@RequestBody Map<String, Object> request) {
        Long productId = Long.valueOf(request.get("productId").toString());
        Long warehouseId = Long.valueOf(request.get("warehouseId").toString());
        Long userId = Long.valueOf(request.get("userId").toString());
        BigDecimal quantity = new BigDecimal(request.get("quantity").toString());
        BigDecimal unitPrice = new BigDecimal(request.get("unitPrice").toString());
        String notes = request.get("notes") != null ? request.get("notes").toString() : "";

        Transaction transaction = transactionService.createProductInboundTransaction(
                productId, warehouseId, userId, quantity, unitPrice, notes);
        return ResponseEntity.ok(transaction);
    }

    @PostMapping("/item/outbound")
    public ResponseEntity<Transaction> createItemOutboundTransaction(@RequestBody Map<String, Object> request) {
        Long itemId = Long.valueOf(request.get("itemId").toString());
        Long warehouseId = Long.valueOf(request.get("warehouseId").toString());
        Long userId = Long.valueOf(request.get("userId").toString());
        BigDecimal quantity = new BigDecimal(request.get("quantity").toString());
        BigDecimal unitPrice = new BigDecimal(request.get("unitPrice").toString());
        String notes = request.get("notes") != null ? request.get("notes").toString() : "";

        Transaction transaction = transactionService.createItemOutboundTransaction(
                itemId, warehouseId, userId, quantity, unitPrice, notes);
        return ResponseEntity.ok(transaction);
    }

    @PostMapping("/product/outbound")
    public ResponseEntity<Transaction> createProductOutboundTransaction(@RequestBody Map<String, Object> request) {
        Long productId = Long.valueOf(request.get("productId").toString());
        Long warehouseId = Long.valueOf(request.get("warehouseId").toString());
        Long userId = Long.valueOf(request.get("userId").toString());
        BigDecimal quantity = new BigDecimal(request.get("quantity").toString());
        BigDecimal unitPrice = new BigDecimal(request.get("unitPrice").toString());
        String notes = request.get("notes") != null ? request.get("notes").toString() : "";

        Transaction transaction = transactionService.createProductOutboundTransaction(
                productId, warehouseId, userId, quantity, unitPrice, notes);
        return ResponseEntity.ok(transaction);
    }
}
package com.warehouse.api.transaction;

import com.warehouse.enums.EntityType;
import com.warehouse.enums.TransactionType;
import com.warehouse.enums.TransactionStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface TransactionService {

    List<Transaction> getAllTransactions();

    Optional<Transaction> getTransactionById(Long id);

    Transaction createTransaction(Transaction transaction);

    Transaction updateTransaction(Long id, Transaction transactionDetails);

    void deleteTransaction(Long id);

    List<Transaction> getTransactionsByType(TransactionType type);

    List<Transaction> getTransactionsByEntityType(EntityType entityType);

    List<Transaction> getTransactionsByStatus(TransactionStatus status);

    List<Transaction> getTransactionsByUserId(Long userId);

    List<Transaction> getTransactionsByWarehouseId(Long warehouseId);

    List<Transaction> getTransactionsByItemId(Long itemId);

    List<Transaction> getTransactionsByProductId(Long productId);

    List<Transaction> getTransactionsByDateRange(LocalDateTime startDate, LocalDateTime endDate);

    List<Transaction> searchTransactionsByReference(String reference);

    List<Transaction> getRecentTransactions();

    Transaction createItemInboundTransaction(Long itemId, Long warehouseId, Long userId, 
                                           java.math.BigDecimal quantity, java.math.BigDecimal unitPrice, String notes);

    Transaction createProductInboundTransaction(Long productId, Long warehouseId, Long userId, 
                                              java.math.BigDecimal quantity, java.math.BigDecimal unitPrice, String notes);

    Transaction createItemOutboundTransaction(Long itemId, Long warehouseId, Long userId, 
                                            java.math.BigDecimal quantity, java.math.BigDecimal unitPrice, String notes);

    Transaction createProductOutboundTransaction(Long productId, Long warehouseId, Long userId, 
                                               java.math.BigDecimal quantity, java.math.BigDecimal unitPrice, String notes);
}
package com.warehouse.api.transaction;

import com.warehouse.api.item.Item;
import com.warehouse.api.product.Product;
import com.warehouse.api.user.User;
import com.warehouse.api.warehouse.Warehouse;
import com.warehouse.enums.EntityType;
import com.warehouse.enums.TransactionType;
import com.warehouse.enums.TransactionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    
    List<Transaction> findByTransactionType(TransactionType transactionType);
    
    List<Transaction> findByEntityType(EntityType entityType);
    
    List<Transaction> findByStatus(TransactionStatus status);
    
    List<Transaction> findByUser(User user);
    
    List<Transaction> findByWarehouse(Warehouse warehouse);
    
    List<Transaction> findByItem(Item item);
    
    List<Transaction> findByProduct(Product product);
    
    @Query("SELECT t FROM Transaction t WHERE t.transactionDate BETWEEN :startDate AND :endDate")
    List<Transaction> findByTransactionDateBetween(@Param("startDate") LocalDateTime startDate, 
                                                  @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT t FROM Transaction t WHERE t.user.userId = :userId")
    List<Transaction> findByUserId(@Param("userId") Long userId);
    
    @Query("SELECT t FROM Transaction t WHERE t.warehouse.warehouseId = :warehouseId")
    List<Transaction> findByWarehouseId(@Param("warehouseId") Long warehouseId);
    
    @Query("SELECT t FROM Transaction t WHERE t.item.itemId = :itemId")
    List<Transaction> findByItemId(@Param("itemId") Long itemId);
    
    @Query("SELECT t FROM Transaction t WHERE t.product.productId = :productId")
    List<Transaction> findByProductId(@Param("productId") Long productId);
    
    @Query("SELECT t FROM Transaction t WHERE t.transactionType = :type AND t.entityType = :entityType")
    List<Transaction> findByTransactionTypeAndEntityType(@Param("type") TransactionType type, 
                                                        @Param("entityType") EntityType entityType);
    
    @Query("SELECT t FROM Transaction t WHERE t.referenceNumber LIKE %:reference%")
    List<Transaction> findByReferenceNumberContaining(@Param("reference") String reference);
    
    @Query("SELECT t FROM Transaction t ORDER BY t.transactionDate DESC")
    List<Transaction> findAllOrderByTransactionDateDesc();
}
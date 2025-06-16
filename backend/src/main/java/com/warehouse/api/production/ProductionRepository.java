package com.warehouse.api.production;

import com.warehouse.api.product.Product;
import com.warehouse.api.user.User;
import com.warehouse.api.warehouse.Warehouse;
import com.warehouse.enums.ProductionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductionRepository extends JpaRepository<Production, Long> {
    
    Optional<Production> findByProductionNumber(String productionNumber);
    
    List<Production> findByStatus(ProductionStatus status);
    
    List<Production> findByProduct(Product product);
    
    List<Production> findByWarehouse(Warehouse warehouse);
    
    List<Production> findByUser(User user);
    
    @Query("SELECT p FROM Production p WHERE p.plannedDate BETWEEN :startDate AND :endDate")
    List<Production> findByPlannedDateBetween(@Param("startDate") LocalDateTime startDate, 
                                            @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT p FROM Production p WHERE p.startDate BETWEEN :startDate AND :endDate")
    List<Production> findByStartDateBetween(@Param("startDate") LocalDateTime startDate, 
                                          @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT p FROM Production p WHERE p.user.userId = :userId")
    List<Production> findByUserId(@Param("userId") Long userId);
    
    @Query("SELECT p FROM Production p WHERE p.warehouse.warehouseId = :warehouseId")
    List<Production> findByWarehouseId(@Param("warehouseId") Long warehouseId);
    
    @Query("SELECT p FROM Production p WHERE p.product.productId = :productId")
    List<Production> findByProductId(@Param("productId") Long productId);
    
    @Query("SELECT p FROM Production p ORDER BY p.plannedDate DESC")
    List<Production> findAllOrderByPlannedDateDesc();
}
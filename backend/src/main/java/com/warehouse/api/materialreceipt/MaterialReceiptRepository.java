package com.warehouse.api.materialreceipt;

import com.warehouse.api.user.User;
import com.warehouse.api.warehouse.Warehouse;
import com.warehouse.enums.MaterialReceiptStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface MaterialReceiptRepository extends JpaRepository<MaterialReceipt, Long> {
    
    Optional<MaterialReceipt> findByReceiptNumber(String receiptNumber);
    
    List<MaterialReceipt> findByStatus(MaterialReceiptStatus status);
    
    List<MaterialReceipt> findByWarehouse(Warehouse warehouse);
    
    List<MaterialReceipt> findByUser(User user);
    
    @Query("SELECT mr FROM MaterialReceipt mr WHERE mr.receiptDate BETWEEN :startDate AND :endDate")
    List<MaterialReceipt> findByReceiptDateBetween(@Param("startDate") LocalDateTime startDate, 
                                                  @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT mr FROM MaterialReceipt mr WHERE mr.user.userId = :userId")
    List<MaterialReceipt> findByUserId(@Param("userId") Long userId);
    
    @Query("SELECT mr FROM MaterialReceipt mr WHERE mr.warehouse.warehouseId = :warehouseId")
    List<MaterialReceipt> findByWarehouseId(@Param("warehouseId") Long warehouseId);
    
    @Query("SELECT mr FROM MaterialReceipt mr WHERE mr.supplier LIKE %:supplier%")
    List<MaterialReceipt> findBySupplierContaining(@Param("supplier") String supplier);
    
    @Query("SELECT mr FROM MaterialReceipt mr ORDER BY mr.receiptDate DESC")
    List<MaterialReceipt> findAllOrderByReceiptDateDesc();
}
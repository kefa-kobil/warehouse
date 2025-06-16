package com.warehouse.api.product;

import com.warehouse.api.category.Category;
import com.warehouse.api.warehouse.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    Optional<Product> findByCode(String code);
    
    boolean existsByCode(String code);
    
    List<Product> findByCategory(Category category);
    
    List<Product> findByWarehouse(Warehouse warehouse);
    
    @Query("SELECT p FROM Product p WHERE p.name LIKE %:name%")
    List<Product> findByNameContaining(@Param("name") String name);
    
    @Query("SELECT p FROM Product p WHERE p.code LIKE %:code%")
    List<Product> findByCodeContaining(@Param("code") String code);
    
    @Query("SELECT p FROM Product p WHERE p.warehouse.id = :warehouseId")
    List<Product> findByWarehouseId(@Param("warehouseId") UUID warehouseId);
    
    @Query("SELECT p FROM Product p WHERE p.category.id = :categoryId")
    List<Product> findByCategoryId(@Param("categoryId") UUID categoryId);
}
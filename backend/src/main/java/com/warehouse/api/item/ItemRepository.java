package com.warehouse.api.item;

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
public interface ItemRepository extends JpaRepository<Item, Long> {
    
    Optional<Item> findByCode(String code);
    
    boolean existsByCode(String code);
    
    List<Item> findByCategory(Category category);
    
    List<Item> findByWarehouse(Warehouse warehouse);
    
    @Query("SELECT i FROM Item i WHERE i.name LIKE %:name%")
    List<Item> findByNameContaining(@Param("name") String name);
    
    @Query("SELECT i FROM Item i WHERE i.code LIKE %:code%")
    List<Item> findByCodeContaining(@Param("code") String code);
    
    @Query("SELECT i FROM Item i WHERE i.warehouse.id = :warehouseId")
    List<Item> findByWarehouseId(@Param("warehouseId") UUID warehouseId);
    
    @Query("SELECT i FROM Item i WHERE i.category.id = :categoryId")
    List<Item> findByCategoryId(@Param("categoryId") UUID categoryId);
}
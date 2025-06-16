package com.warehouse.api.warehouse;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WarehouseRepository extends JpaRepository<Warehouse, Long> {
    
    Optional<Warehouse> findByName(String name);
    
    List<Warehouse> findByLocation(String location);
    
    List<Warehouse> findByManager(String manager);
    
    @Query("SELECT w FROM Warehouse w WHERE w.name LIKE %:name%")
    List<Warehouse> findByNameContaining(@Param("name") String name);
    
    @Query("SELECT w FROM Warehouse w WHERE w.location LIKE %:location%")
    List<Warehouse> findByLocationContaining(@Param("location") String location);
}
package com.warehouse.api.production;

import com.warehouse.api.item.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductionItemRepository extends JpaRepository<ProductionItem, Long> {
    
    List<ProductionItem> findByProduction(Production production);
    
    List<ProductionItem> findByItem(Item item);
    
    @Query("SELECT pi FROM ProductionItem pi WHERE pi.production.productionId = :productionId")
    List<ProductionItem> findByProductionId(@Param("productionId") Long productionId);
    
    @Query("SELECT pi FROM ProductionItem pi WHERE pi.item.itemId = :itemId")
    List<ProductionItem> findByItemId(@Param("itemId") Long itemId);
}
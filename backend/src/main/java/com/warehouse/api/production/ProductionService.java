package com.warehouse.api.production;

import com.warehouse.enums.ProductionStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ProductionService {

    List<Production> getAllProductions();

    Optional<Production> getProductionById(Long id);

    Optional<Production> getProductionByNumber(String productionNumber);

    Production createProduction(Production production);

    Production updateProduction(Long id, Production productionDetails);

    void deleteProduction(Long id);

    List<Production> getProductionsByStatus(ProductionStatus status);

    List<Production> getProductionsByUserId(Long userId);

    List<Production> getProductionsByWarehouseId(Long warehouseId);

    List<Production> getProductionsByProductId(Long productId);

    List<Production> getProductionsByDateRange(LocalDateTime startDate, LocalDateTime endDate);

    Production startProduction(Long productionId);

    Production completeProduction(Long productionId);

    Production cancelProduction(Long productionId);

    List<ProductionItem> getProductionItems(Long productionId);

    ProductionItem addProductionItem(Long productionId, ProductionItem productionItem);

    ProductionItem updateProductionItem(Long productionItemId, ProductionItem productionItemDetails);

    void removeProductionItem(Long productionItemId);
}
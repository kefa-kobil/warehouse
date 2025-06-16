package com.warehouse.api.production;

import com.warehouse.enums.ProductionStatus;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/productions")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
public class ProductionController {

    private final ProductionService productionService;

    @GetMapping
    public ResponseEntity<List<Production>> getAllProductions() {
        return ResponseEntity.ok(productionService.getAllProductions());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Production> getProductionById(@PathVariable Long id) {
        Production production = productionService.getProductionById(id)
                .orElseThrow(() -> new RuntimeException("Production not found"));
        return ResponseEntity.ok(production);
    }

    @PostMapping
    public ResponseEntity<Production> createProduction(@Valid @RequestBody Production production) {
        Production createdProduction = productionService.createProduction(production);
        return ResponseEntity.ok(createdProduction);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Production> updateProduction(@PathVariable Long id,
                                                      @Valid @RequestBody Production productionDetails) {
        Production updatedProduction = productionService.updateProduction(id, productionDetails);
        return ResponseEntity.ok(updatedProduction);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduction(@PathVariable Long id) {
        productionService.deleteProduction(id);
        return ResponseEntity.ok(Map.of("message", "Production deleted successfully"));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Production>> getProductionsByStatus(@PathVariable ProductionStatus status) {
        return ResponseEntity.ok(productionService.getProductionsByStatus(status));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Production>> getProductionsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(productionService.getProductionsByUserId(userId));
    }

    @GetMapping("/warehouse/{warehouseId}")
    public ResponseEntity<List<Production>> getProductionsByWarehouseId(@PathVariable Long warehouseId) {
        return ResponseEntity.ok(productionService.getProductionsByWarehouseId(warehouseId));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<Production>> getProductionsByProductId(@PathVariable Long productId) {
        return ResponseEntity.ok(productionService.getProductionsByProductId(productId));
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<Production>> getProductionsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return ResponseEntity.ok(productionService.getProductionsByDateRange(startDate, endDate));
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<Production> startProduction(@PathVariable Long id) {
        Production production = productionService.startProduction(id);
        return ResponseEntity.ok(production);
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<Production> completeProduction(@PathVariable Long id) {
        Production production = productionService.completeProduction(id);
        return ResponseEntity.ok(production);
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<Production> cancelProduction(@PathVariable Long id) {
        Production production = productionService.cancelProduction(id);
        return ResponseEntity.ok(production);
    }

    @GetMapping("/{id}/items")
    public ResponseEntity<List<ProductionItem>> getProductionItems(@PathVariable Long id) {
        return ResponseEntity.ok(productionService.getProductionItems(id));
    }

    @PostMapping("/{id}/items")
    public ResponseEntity<ProductionItem> addProductionItem(@PathVariable Long id,
                                                           @Valid @RequestBody ProductionItem productionItem) {
        ProductionItem createdItem = productionService.addProductionItem(id, productionItem);
        return ResponseEntity.ok(createdItem);
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<ProductionItem> updateProductionItem(@PathVariable Long itemId,
                                                              @Valid @RequestBody ProductionItem productionItemDetails) {
        ProductionItem updatedItem = productionService.updateProductionItem(itemId, productionItemDetails);
        return ResponseEntity.ok(updatedItem);
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<?> removeProductionItem(@PathVariable Long itemId) {
        productionService.removeProductionItem(itemId);
        return ResponseEntity.ok(Map.of("message", "Production item removed successfully"));
    }
}
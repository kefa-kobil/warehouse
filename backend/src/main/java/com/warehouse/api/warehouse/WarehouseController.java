package com.warehouse.api.warehouse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/warehouses")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
public class WarehouseController {


    private final WarehouseService warehouseService;

    @GetMapping
    public ResponseEntity<List<Warehouse>> getAllWarehouses() {
        return ResponseEntity.ok(warehouseService.getAllWarehouses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Warehouse> getWarehouseById(@PathVariable Long id) {
        Warehouse warehouse = warehouseService.getWarehouseById(id)
                .orElseThrow(() -> new RuntimeException("Warehouse not found"));
        return ResponseEntity.ok(warehouse);
    }

    @PostMapping
    public ResponseEntity<Warehouse> createWarehouse(@Valid @RequestBody Warehouse warehouse) {
        Warehouse createdWarehouse = warehouseService.createWarehouse(warehouse);
        return ResponseEntity.ok(createdWarehouse);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Warehouse> updateWarehouse(@PathVariable Long id,
                                                    @Valid @RequestBody Warehouse warehouseDetails) {
        Warehouse updatedWarehouse = warehouseService.updateWarehouse(id, warehouseDetails);
        return ResponseEntity.ok(updatedWarehouse);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteWarehouse(@PathVariable Long id) {
        warehouseService.deleteWarehouse(id);
        return ResponseEntity.ok(Map.of("message", "Warehouse deleted successfully"));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Warehouse>> searchWarehouses(@RequestParam String name) {
        return ResponseEntity.ok(warehouseService.searchWarehousesByName(name));
    }

    @GetMapping("/location/{location}")
    public ResponseEntity<List<Warehouse>> getWarehousesByLocation(@PathVariable String location) {
        return ResponseEntity.ok(warehouseService.getWarehousesByLocation(location));
    }

    @GetMapping("/manager/{manager}")
    public ResponseEntity<List<Warehouse>> getWarehousesByManager(@PathVariable String manager) {
        return ResponseEntity.ok(warehouseService.getWarehousesByManager(manager));
    }
}
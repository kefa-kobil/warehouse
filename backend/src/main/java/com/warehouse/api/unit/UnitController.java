package com.warehouse.api.unit;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/units")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
public class UnitController {


    private final UnitService unitService;

    @GetMapping
    public ResponseEntity<List<Unit>> getAllUnits() {
        return ResponseEntity.ok(unitService.getAllUnits());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Unit> getUnitById(@PathVariable Long id) {
        Unit unit = unitService.getUnitById(id)
                .orElseThrow(() -> new RuntimeException("Unit not found"));
        return ResponseEntity.ok(unit);
    }

    @PostMapping
    public ResponseEntity<Unit> createUnit(@Valid @RequestBody Unit unit) {
        Unit createdUnit = unitService.createUnit(unit);
        return ResponseEntity.ok(createdUnit);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Unit> updateUnit(@PathVariable Long id,
                                          @Valid @RequestBody Unit unitDetails) {
        Unit updatedUnit = unitService.updateUnit(id, unitDetails);
        return ResponseEntity.ok(updatedUnit);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUnit(@PathVariable Long id) {
        unitService.deleteUnit(id);
        return ResponseEntity.ok(Map.of("message", "Unit deleted successfully"));
    }

    @DeleteMapping("/{name}")
    public ResponseEntity<?> deleteUnitByName(@PathVariable String name) {
        unitService.deleteUnitByName(name);
        return ResponseEntity.ok(Map.of("message", "Unit deleted successfully"));
    }
}
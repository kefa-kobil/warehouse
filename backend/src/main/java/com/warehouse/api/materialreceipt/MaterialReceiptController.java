package com.warehouse.api.materialreceipt;

import com.warehouse.enums.MaterialReceiptStatus;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/material-receipts")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
public class MaterialReceiptController {

    private final MaterialReceiptService materialReceiptService;

    @GetMapping
    public ResponseEntity<List<MaterialReceipt>> getAllMaterialReceipts() {
        return ResponseEntity.ok(materialReceiptService.getAllMaterialReceipts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MaterialReceipt> getMaterialReceiptById(@PathVariable Long id) {
        MaterialReceipt materialReceipt = materialReceiptService.getMaterialReceiptById(id)
                .orElseThrow(() -> new RuntimeException("Material receipt not found"));
        return ResponseEntity.ok(materialReceipt);
    }

    @PostMapping
    public ResponseEntity<MaterialReceipt> createMaterialReceipt(@Valid @RequestBody MaterialReceipt materialReceipt) {
        MaterialReceipt createdMaterialReceipt = materialReceiptService.createMaterialReceipt(materialReceipt);
        return ResponseEntity.ok(createdMaterialReceipt);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MaterialReceipt> updateMaterialReceipt(@PathVariable Long id,
                                                               @Valid @RequestBody MaterialReceipt materialReceiptDetails) {
        MaterialReceipt updatedMaterialReceipt = materialReceiptService.updateMaterialReceipt(id, materialReceiptDetails);
        return ResponseEntity.ok(updatedMaterialReceipt);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMaterialReceipt(@PathVariable Long id) {
        materialReceiptService.deleteMaterialReceipt(id);
        return ResponseEntity.ok(Map.of("message", "Material receipt deleted successfully"));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<MaterialReceipt>> getMaterialReceiptsByStatus(@PathVariable MaterialReceiptStatus status) {
        return ResponseEntity.ok(materialReceiptService.getMaterialReceiptsByStatus(status));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<MaterialReceipt>> getMaterialReceiptsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(materialReceiptService.getMaterialReceiptsByUserId(userId));
    }

    @GetMapping("/warehouse/{warehouseId}")
    public ResponseEntity<List<MaterialReceipt>> getMaterialReceiptsByWarehouseId(@PathVariable Long warehouseId) {
        return ResponseEntity.ok(materialReceiptService.getMaterialReceiptsByWarehouseId(warehouseId));
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<MaterialReceipt>> getMaterialReceiptsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return ResponseEntity.ok(materialReceiptService.getMaterialReceiptsByDateRange(startDate, endDate));
    }

    @GetMapping("/search")
    public ResponseEntity<List<MaterialReceipt>> searchMaterialReceiptsBySupplier(@RequestParam String supplier) {
        return ResponseEntity.ok(materialReceiptService.searchMaterialReceiptsBySupplier(supplier));
    }

    @PostMapping("/{id}/receive")
    public ResponseEntity<MaterialReceipt> receiveMaterialReceipt(@PathVariable Long id) {
        MaterialReceipt materialReceipt = materialReceiptService.receiveMaterialReceipt(id);
        return ResponseEntity.ok(materialReceipt);
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<MaterialReceipt> cancelMaterialReceipt(@PathVariable Long id) {
        MaterialReceipt materialReceipt = materialReceiptService.cancelMaterialReceipt(id);
        return ResponseEntity.ok(materialReceipt);
    }

    @GetMapping("/{id}/items")
    public ResponseEntity<List<MaterialReceiptItem>> getMaterialReceiptItems(@PathVariable Long id) {
        return ResponseEntity.ok(materialReceiptService.getMaterialReceiptItems(id));
    }

    @PostMapping("/{id}/items")
    public ResponseEntity<MaterialReceiptItem> addMaterialReceiptItem(@PathVariable Long id,
                                                                    @Valid @RequestBody MaterialReceiptItem materialReceiptItem) {
        MaterialReceiptItem createdItem = materialReceiptService.addMaterialReceiptItem(id, materialReceiptItem);
        return ResponseEntity.ok(createdItem);
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<MaterialReceiptItem> updateMaterialReceiptItem(@PathVariable Long itemId,
                                                                       @Valid @RequestBody MaterialReceiptItem materialReceiptItemDetails) {
        MaterialReceiptItem updatedItem = materialReceiptService.updateMaterialReceiptItem(itemId, materialReceiptItemDetails);
        return ResponseEntity.ok(updatedItem);
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<?> removeMaterialReceiptItem(@PathVariable Long itemId) {
        materialReceiptService.removeMaterialReceiptItem(itemId);
        return ResponseEntity.ok(Map.of("message", "Material receipt item removed successfully"));
    }
}
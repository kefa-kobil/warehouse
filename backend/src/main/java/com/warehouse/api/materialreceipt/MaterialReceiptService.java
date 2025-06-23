package com.warehouse.api.materialreceipt;

import com.warehouse.enums.MaterialReceiptStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface MaterialReceiptService {

    List<MaterialReceipt> getAllMaterialReceipts();

    Optional<MaterialReceipt> getMaterialReceiptById(Long id);

    Optional<MaterialReceipt> getMaterialReceiptByNumber(String receiptNumber);

    MaterialReceipt createMaterialReceipt(MaterialReceipt materialReceipt);

    MaterialReceipt updateMaterialReceipt(Long id, MaterialReceipt materialReceiptDetails);

    void deleteMaterialReceipt(Long id);

    List<MaterialReceipt> getMaterialReceiptsByStatus(MaterialReceiptStatus status);

    List<MaterialReceipt> getMaterialReceiptsByUserId(Long userId);

    List<MaterialReceipt> getMaterialReceiptsByWarehouseId(Long warehouseId);

    List<MaterialReceipt> getMaterialReceiptsByDateRange(LocalDateTime startDate, LocalDateTime endDate);

    List<MaterialReceipt> searchMaterialReceiptsBySupplier(String supplier);

    MaterialReceipt receiveMaterialReceipt(Long receiptId);

    MaterialReceipt cancelMaterialReceipt(Long receiptId);

    List<MaterialReceiptItem> getMaterialReceiptItems(Long receiptId);

    MaterialReceiptItem addMaterialReceiptItem(Long receiptId, MaterialReceiptItem materialReceiptItem);

    MaterialReceiptItem updateMaterialReceiptItem(Long receiptItemId, MaterialReceiptItem materialReceiptItemDetails);

    void removeMaterialReceiptItem(Long receiptItemId);
}
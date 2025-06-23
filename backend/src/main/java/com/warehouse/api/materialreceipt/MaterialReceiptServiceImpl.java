package com.warehouse.api.materialreceipt;

import com.warehouse.api.item.Item;
import com.warehouse.api.item.ItemRepository;
import com.warehouse.api.transaction.Transaction;
import com.warehouse.api.transaction.TransactionRepository;
import com.warehouse.api.user.UserRepository;
import com.warehouse.api.warehouse.WarehouseRepository;
import com.warehouse.enums.EntityType;
import com.warehouse.enums.MaterialReceiptStatus;
import com.warehouse.enums.TransactionStatus;
import com.warehouse.enums.TransactionType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class MaterialReceiptServiceImpl implements MaterialReceiptService {

    private final MaterialReceiptRepository materialReceiptRepository;
    private final MaterialReceiptItemRepository materialReceiptItemRepository;
    private final ItemRepository itemRepository;
    private final UserRepository userRepository;
    private final WarehouseRepository warehouseRepository;
    private final TransactionRepository transactionRepository;

    @Override
    public List<MaterialReceipt> getAllMaterialReceipts() {
        return materialReceiptRepository.findAllOrderByReceiptDateDesc();
    }

    @Override
    public Optional<MaterialReceipt> getMaterialReceiptById(Long id) {
        return materialReceiptRepository.findById(id);
    }

    @Override
    public Optional<MaterialReceipt> getMaterialReceiptByNumber(String receiptNumber) {
        return materialReceiptRepository.findByReceiptNumber(receiptNumber);
    }

    @Override
    public MaterialReceipt createMaterialReceipt(MaterialReceipt materialReceipt) {
        // Generate receipt number if not provided
        if (materialReceipt.getReceiptNumber() == null || materialReceipt.getReceiptNumber().isEmpty()) {
            materialReceipt.setReceiptNumber(generateReceiptNumber());
        }
        
        return materialReceiptRepository.save(materialReceipt);
    }

    @Override
    public MaterialReceipt updateMaterialReceipt(Long id, MaterialReceipt materialReceiptDetails) {
        MaterialReceipt materialReceipt = materialReceiptRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Material receipt not found"));

        materialReceipt.setWarehouse(materialReceiptDetails.getWarehouse());
        materialReceipt.setUser(materialReceiptDetails.getUser());
        materialReceipt.setStatus(materialReceiptDetails.getStatus());
        materialReceipt.setReceiptDate(materialReceiptDetails.getReceiptDate());
        materialReceipt.setReceivedDate(materialReceiptDetails.getReceivedDate());
        materialReceipt.setTotalAmount(materialReceiptDetails.getTotalAmount());
        materialReceipt.setNotes(materialReceiptDetails.getNotes());
        materialReceipt.setSupplier(materialReceiptDetails.getSupplier());

        return materialReceiptRepository.save(materialReceipt);
    }

    @Override
    public void deleteMaterialReceipt(Long id) {
        MaterialReceipt materialReceipt = materialReceiptRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Material receipt not found"));
        materialReceiptRepository.delete(materialReceipt);
    }

    @Override
    public List<MaterialReceipt> getMaterialReceiptsByStatus(MaterialReceiptStatus status) {
        return materialReceiptRepository.findByStatus(status);
    }

    @Override
    public List<MaterialReceipt> getMaterialReceiptsByUserId(Long userId) {
        return materialReceiptRepository.findByUserId(userId);
    }

    @Override
    public List<MaterialReceipt> getMaterialReceiptsByWarehouseId(Long warehouseId) {
        return materialReceiptRepository.findByWarehouseId(warehouseId);
    }

    @Override
    public List<MaterialReceipt> getMaterialReceiptsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return materialReceiptRepository.findByReceiptDateBetween(startDate, endDate);
    }

    @Override
    public List<MaterialReceipt> searchMaterialReceiptsBySupplier(String supplier) {
        return materialReceiptRepository.findBySupplierContaining(supplier);
    }

    @Override
    public MaterialReceipt receiveMaterialReceipt(Long receiptId) {
        MaterialReceipt materialReceipt = materialReceiptRepository.findById(receiptId)
                .orElseThrow(() -> new RuntimeException("Material receipt not found"));

        if (materialReceipt.getStatus() != MaterialReceiptStatus.PENDING) {
            throw new RuntimeException("Material receipt can only be received from PENDING status");
        }

        // Add all receipt items to inventory and create transactions
        List<MaterialReceiptItem> receiptItems = materialReceiptItemRepository.findByMaterialReceipt(materialReceipt);
        for (MaterialReceiptItem receiptItem : receiptItems) {
            Item item = receiptItem.getItem();
            
            // Update item quantity
            BigDecimal newQuantity = item.getQuantity().add(receiptItem.getOrderedQuantity());
            item.setQuantity(newQuantity);
            itemRepository.save(item);

            // Create inbound transaction
            Transaction transaction = new Transaction();
            transaction.setTransactionType(TransactionType.INBOUND);
            transaction.setEntityType(EntityType.ITEMS);
            transaction.setItem(item);
            transaction.setWarehouse(materialReceipt.getWarehouse());
            transaction.setUser(materialReceipt.getUser());
            transaction.setQuantity(receiptItem.getOrderedQuantity());
            transaction.setUnitPrice(receiptItem.getUnitPrice());
            transaction.setTotalPrice(receiptItem.getTotalPrice());
            transaction.setStatus(TransactionStatus.COMPLETED);
            transaction.setTransactionDate(LocalDateTime.now());
            transaction.setReferenceNumber("RECEIPT-" + materialReceipt.getReceiptNumber());
            transaction.setNotes("Material received - " + materialReceipt.getReceiptNumber() + " from " + materialReceipt.getSupplier());
            transactionRepository.save(transaction);

            // Update received quantity
            receiptItem.setReceivedQuantity(receiptItem.getOrderedQuantity());
            materialReceiptItemRepository.save(receiptItem);
        }

        materialReceipt.setStatus(MaterialReceiptStatus.RECEIVED);
        materialReceipt.setReceivedDate(LocalDateTime.now());
        return materialReceiptRepository.save(materialReceipt);
    }

    @Override
    public MaterialReceipt cancelMaterialReceipt(Long receiptId) {
        MaterialReceipt materialReceipt = materialReceiptRepository.findById(receiptId)
                .orElseThrow(() -> new RuntimeException("Material receipt not found"));

        if (materialReceipt.getStatus() == MaterialReceiptStatus.RECEIVED) {
            throw new RuntimeException("Cannot cancel received material receipt");
        }

        materialReceipt.setStatus(MaterialReceiptStatus.CANCELLED);
        return materialReceiptRepository.save(materialReceipt);
    }

    @Override
    public List<MaterialReceiptItem> getMaterialReceiptItems(Long receiptId) {
        MaterialReceipt materialReceipt = materialReceiptRepository.findById(receiptId)
                .orElseThrow(() -> new RuntimeException("Material receipt not found"));
        return materialReceiptItemRepository.findByMaterialReceipt(materialReceipt);
    }

    @Override
    public MaterialReceiptItem addMaterialReceiptItem(Long receiptId, MaterialReceiptItem materialReceiptItem) {
        MaterialReceipt materialReceipt = materialReceiptRepository.findById(receiptId)
                .orElseThrow(() -> new RuntimeException("Material receipt not found"));

        materialReceiptItem.setMaterialReceipt(materialReceipt);
        
        // Calculate total price
        BigDecimal totalPrice = materialReceiptItem.getOrderedQuantity().multiply(materialReceiptItem.getUnitPrice());
        materialReceiptItem.setTotalPrice(totalPrice);

        MaterialReceiptItem savedItem = materialReceiptItemRepository.save(materialReceiptItem);
        
        // Update receipt total amount
        updateReceiptTotalAmount(materialReceipt);
        
        return savedItem;
    }

    @Override
    public MaterialReceiptItem updateMaterialReceiptItem(Long receiptItemId, MaterialReceiptItem materialReceiptItemDetails) {
        MaterialReceiptItem materialReceiptItem = materialReceiptItemRepository.findById(receiptItemId)
                .orElseThrow(() -> new RuntimeException("Material receipt item not found"));

        materialReceiptItem.setItem(materialReceiptItemDetails.getItem());
        materialReceiptItem.setOrderedQuantity(materialReceiptItemDetails.getOrderedQuantity());
        materialReceiptItem.setReceivedQuantity(materialReceiptItemDetails.getReceivedQuantity());
        materialReceiptItem.setUnitPrice(materialReceiptItemDetails.getUnitPrice());

        // Recalculate total price
        BigDecimal totalPrice = materialReceiptItem.getOrderedQuantity().multiply(materialReceiptItem.getUnitPrice());
        materialReceiptItem.setTotalPrice(totalPrice);

        MaterialReceiptItem savedItem = materialReceiptItemRepository.save(materialReceiptItem);
        
        // Update receipt total amount
        updateReceiptTotalAmount(materialReceiptItem.getMaterialReceipt());
        
        return savedItem;
    }

    @Override
    public void removeMaterialReceiptItem(Long receiptItemId) {
        MaterialReceiptItem materialReceiptItem = materialReceiptItemRepository.findById(receiptItemId)
                .orElseThrow(() -> new RuntimeException("Material receipt item not found"));
        
        MaterialReceipt materialReceipt = materialReceiptItem.getMaterialReceipt();
        materialReceiptItemRepository.delete(materialReceiptItem);
        
        // Update receipt total amount
        updateReceiptTotalAmount(materialReceipt);
    }

    private void updateReceiptTotalAmount(MaterialReceipt materialReceipt) {
        List<MaterialReceiptItem> receiptItems = materialReceiptItemRepository.findByMaterialReceipt(materialReceipt);
        BigDecimal totalAmount = receiptItems.stream()
                .map(MaterialReceiptItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        materialReceipt.setTotalAmount(totalAmount);
        materialReceiptRepository.save(materialReceipt);
    }

    private String generateReceiptNumber() {
        return "REC-" + System.currentTimeMillis();
    }
}
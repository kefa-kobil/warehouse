package com.warehouse.api.production;

import com.warehouse.api.item.Item;
import com.warehouse.api.item.ItemRepository;
import com.warehouse.api.product.Product;
import com.warehouse.api.product.ProductRepository;
import com.warehouse.api.transaction.Transaction;
import com.warehouse.api.transaction.TransactionRepository;
import com.warehouse.api.user.UserRepository;
import com.warehouse.api.warehouse.WarehouseRepository;
import com.warehouse.enums.EntityType;
import com.warehouse.enums.ProductionStatus;
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
public class ProductionServiceImpl implements ProductionService {

    private final ProductionRepository productionRepository;
    private final ProductionItemRepository productionItemRepository;
    private final ItemRepository itemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final WarehouseRepository warehouseRepository;
    private final TransactionRepository transactionRepository;

    @Override
    public List<Production> getAllProductions() {
        return productionRepository.findAllOrderByPlannedDateDesc();
    }

    @Override
    public Optional<Production> getProductionById(Long id) {
        return productionRepository.findById(id);
    }

    @Override
    public Optional<Production> getProductionByNumber(String productionNumber) {
        return productionRepository.findByProductionNumber(productionNumber);
    }

    @Override
    public Production createProduction(Production production) {
        // Generate production number if not provided
        if (production.getProductionNumber() == null || production.getProductionNumber().isEmpty()) {
            production.setProductionNumber(generateProductionNumber());
        }
        
        return productionRepository.save(production);
    }

    @Override
    public Production updateProduction(Long id, Production productionDetails) {
        Production production = productionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Production not found"));

        production.setProduct(productionDetails.getProduct());
        production.setWarehouse(productionDetails.getWarehouse());
        production.setUser(productionDetails.getUser());
        production.setPlannedQuantity(productionDetails.getPlannedQuantity());
        production.setProducedQuantity(productionDetails.getProducedQuantity());
        production.setStatus(productionDetails.getStatus());
        production.setStartDate(productionDetails.getStartDate());
        production.setEndDate(productionDetails.getEndDate());
        production.setPlannedDate(productionDetails.getPlannedDate());
        production.setNotes(productionDetails.getNotes());
        production.setTotalCost(productionDetails.getTotalCost());

        return productionRepository.save(production);
    }

    @Override
    public void deleteProduction(Long id) {
        Production production = productionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Production not found"));
        productionRepository.delete(production);
    }

    @Override
    public List<Production> getProductionsByStatus(ProductionStatus status) {
        return productionRepository.findByStatus(status);
    }

    @Override
    public List<Production> getProductionsByUserId(Long userId) {
        return productionRepository.findByUserId(userId);
    }

    @Override
    public List<Production> getProductionsByWarehouseId(Long warehouseId) {
        return productionRepository.findByWarehouseId(warehouseId);
    }

    @Override
    public List<Production> getProductionsByProductId(Long productId) {
        return productionRepository.findByProductId(productId);
    }

    @Override
    public List<Production> getProductionsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return productionRepository.findByPlannedDateBetween(startDate, endDate);
    }

    @Override
    public Production startProduction(Long productionId) {
        Production production = productionRepository.findById(productionId)
                .orElseThrow(() -> new RuntimeException("Production not found"));

        if (production.getStatus() != ProductionStatus.PLANNED) {
            throw new RuntimeException("Production can only be started from PLANNED status");
        }

        // Check if all required items are available
        List<ProductionItem> productionItems = productionItemRepository.findByProduction(production);
        for (ProductionItem productionItem : productionItems) {
            Item item = productionItem.getItem();
            if (item.getQuantity().compareTo(productionItem.getRequiredQuantity()) < 0) {
                throw new RuntimeException("Insufficient quantity for item: " + item.getName());
            }
        }

        // Deduct items from inventory and create transactions
        for (ProductionItem productionItem : productionItems) {
            Item item = productionItem.getItem();
            BigDecimal newQuantity = item.getQuantity().subtract(productionItem.getRequiredQuantity());
            item.setQuantity(newQuantity);
            itemRepository.save(item);

            // Create outbound transaction for used items
            Transaction transaction = new Transaction();
            transaction.setTransactionType(TransactionType.PRODUCTION);
            transaction.setEntityType(EntityType.ITEMS);
            transaction.setItem(item);
            transaction.setWarehouse(production.getWarehouse());
            transaction.setUser(production.getUser());
            transaction.setQuantity(productionItem.getRequiredQuantity());
            transaction.setUnitPrice(productionItem.getUnitCost());
            transaction.setTotalPrice(productionItem.getTotalCost());
            transaction.setStatus(TransactionStatus.COMPLETED);
            transaction.setTransactionDate(LocalDateTime.now());
            transaction.setReferenceNumber("PROD-" + production.getProductionNumber());
            transaction.setNotes("Production consumption - " + production.getProductionNumber());
            transactionRepository.save(transaction);

            // Update used quantity
            productionItem.setUsedQuantity(productionItem.getRequiredQuantity());
            productionItemRepository.save(productionItem);
        }

        production.setStatus(ProductionStatus.IN_PROGRESS);
        production.setStartDate(LocalDateTime.now());
        return productionRepository.save(production);
    }

    @Override
    public Production completeProduction(Long productionId) {
        Production production = productionRepository.findById(productionId)
                .orElseThrow(() -> new RuntimeException("Production not found"));

        if (production.getStatus() != ProductionStatus.IN_PROGRESS) {
            throw new RuntimeException("Production can only be completed from IN_PROGRESS status");
        }

        // Add produced quantity to product inventory
        Product product = production.getProduct();
        BigDecimal newQuantity = product.getQuantity().add(production.getPlannedQuantity());
        product.setQuantity(newQuantity);
        productRepository.save(product);

        // Create inbound transaction for produced product
        Transaction transaction = new Transaction();
        transaction.setTransactionType(TransactionType.PRODUCTION);
        transaction.setEntityType(EntityType.PRODUCTS);
        transaction.setProduct(product);
        transaction.setWarehouse(production.getWarehouse());
        transaction.setUser(production.getUser());
        transaction.setQuantity(production.getPlannedQuantity());
        transaction.setUnitPrice(product.getSalePrice());
        transaction.setTotalPrice(product.getSalePrice().multiply(production.getPlannedQuantity()));
        transaction.setStatus(TransactionStatus.COMPLETED);
        transaction.setTransactionDate(LocalDateTime.now());
        transaction.setReferenceNumber("PROD-" + production.getProductionNumber());
        transaction.setNotes("Production output - " + production.getProductionNumber());
        transactionRepository.save(transaction);

        production.setStatus(ProductionStatus.COMPLETED);
        production.setEndDate(LocalDateTime.now());
        production.setProducedQuantity(production.getPlannedQuantity());
        return productionRepository.save(production);
    }

    @Override
    public Production cancelProduction(Long productionId) {
        Production production = productionRepository.findById(productionId)
                .orElseThrow(() -> new RuntimeException("Production not found"));

        if (production.getStatus() == ProductionStatus.COMPLETED) {
            throw new RuntimeException("Cannot cancel completed production");
        }

        // If production was in progress, return used items to inventory
        if (production.getStatus() == ProductionStatus.IN_PROGRESS) {
            List<ProductionItem> productionItems = productionItemRepository.findByProduction(production);
            for (ProductionItem productionItem : productionItems) {
                if (productionItem.getUsedQuantity().compareTo(BigDecimal.ZERO) > 0) {
                    Item item = productionItem.getItem();
                    BigDecimal newQuantity = item.getQuantity().add(productionItem.getUsedQuantity());
                    item.setQuantity(newQuantity);
                    itemRepository.save(item);

                    // Create adjustment transaction
                    Transaction transaction = new Transaction();
                    transaction.setTransactionType(TransactionType.ADJUSTMENT);
                    transaction.setEntityType(EntityType.ITEMS);
                    transaction.setItem(item);
                    transaction.setWarehouse(production.getWarehouse());
                    transaction.setUser(production.getUser());
                    transaction.setQuantity(productionItem.getUsedQuantity());
                    transaction.setUnitPrice(productionItem.getUnitCost());
                    transaction.setTotalPrice(productionItem.getTotalCost());
                    transaction.setStatus(TransactionStatus.COMPLETED);
                    transaction.setTransactionDate(LocalDateTime.now());
                    transaction.setReferenceNumber("PROD-CANCEL-" + production.getProductionNumber());
                    transaction.setNotes("Production cancellation return - " + production.getProductionNumber());
                    transactionRepository.save(transaction);
                }
            }
        }

        production.setStatus(ProductionStatus.CANCELLED);
        production.setEndDate(LocalDateTime.now());
        return productionRepository.save(production);
    }

    @Override
    public List<ProductionItem> getProductionItems(Long productionId) {
        Production production = productionRepository.findById(productionId)
                .orElseThrow(() -> new RuntimeException("Production not found"));
        return productionItemRepository.findByProduction(production);
    }

    @Override
    public ProductionItem addProductionItem(Long productionId, ProductionItem productionItem) {
        Production production = productionRepository.findById(productionId)
                .orElseThrow(() -> new RuntimeException("Production not found"));

        productionItem.setProduction(production);
        
        // Calculate total cost
        BigDecimal totalCost = productionItem.getRequiredQuantity().multiply(productionItem.getUnitCost());
        productionItem.setTotalCost(totalCost);

        return productionItemRepository.save(productionItem);
    }

    @Override
    public ProductionItem updateProductionItem(Long productionItemId, ProductionItem productionItemDetails) {
        ProductionItem productionItem = productionItemRepository.findById(productionItemId)
                .orElseThrow(() -> new RuntimeException("Production item not found"));

        productionItem.setItem(productionItemDetails.getItem());
        productionItem.setRequiredQuantity(productionItemDetails.getRequiredQuantity());
        productionItem.setUsedQuantity(productionItemDetails.getUsedQuantity());
        productionItem.setUnitCost(productionItemDetails.getUnitCost());

        // Recalculate total cost
        BigDecimal totalCost = productionItem.getRequiredQuantity().multiply(productionItem.getUnitCost());
        productionItem.setTotalCost(totalCost);

        return productionItemRepository.save(productionItem);
    }

    @Override
    public void removeProductionItem(Long productionItemId) {
        ProductionItem productionItem = productionItemRepository.findById(productionItemId)
                .orElseThrow(() -> new RuntimeException("Production item not found"));
        productionItemRepository.delete(productionItem);
    }

    private String generateProductionNumber() {
        return "PROD-" + System.currentTimeMillis();
    }
}
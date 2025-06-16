package com.warehouse.api.transaction;

import com.warehouse.api.item.Item;
import com.warehouse.api.item.ItemRepository;
import com.warehouse.api.product.Product;
import com.warehouse.api.product.ProductRepository;
import com.warehouse.api.user.User;
import com.warehouse.api.user.UserRepository;
import com.warehouse.api.warehouse.Warehouse;
import com.warehouse.api.warehouse.WarehouseRepository;
import com.warehouse.enums.EntityType;
import com.warehouse.enums.TransactionType;
import com.warehouse.enums.TransactionStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final ItemRepository itemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final WarehouseRepository warehouseRepository;

    @Override
    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAllOrderByTransactionDateDesc();
    }

    @Override
    public Optional<Transaction> getTransactionById(Long id) {
        return transactionRepository.findById(id);
    }

    @Override
    public Transaction createTransaction(Transaction transaction) {
        // Generate reference number if not provided
        if (transaction.getReferenceNumber() == null || transaction.getReferenceNumber().isEmpty()) {
            transaction.setReferenceNumber(generateReferenceNumber());
        }
        
        // Calculate total price
        if (transaction.getUnitPrice() != null && transaction.getQuantity() != null) {
            BigDecimal totalPrice = transaction.getUnitPrice().multiply(transaction.getQuantity());
            transaction.setTotalPrice(totalPrice);
        }
        
        return transactionRepository.save(transaction);
    }

    @Override
    public Transaction updateTransaction(Long id, Transaction transactionDetails) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        transaction.setTransactionType(transactionDetails.getTransactionType());
        transaction.setEntityType(transactionDetails.getEntityType());
        transaction.setItem(transactionDetails.getItem());
        transaction.setProduct(transactionDetails.getProduct());
        transaction.setWarehouse(transactionDetails.getWarehouse());
        transaction.setUser(transactionDetails.getUser());
        transaction.setQuantity(transactionDetails.getQuantity());
        transaction.setUnitPrice(transactionDetails.getUnitPrice());
        transaction.setStatus(transactionDetails.getStatus());
        transaction.setNotes(transactionDetails.getNotes());
        transaction.setTransactionDate(transactionDetails.getTransactionDate());

        // Recalculate total price
        if (transaction.getUnitPrice() != null && transaction.getQuantity() != null) {
            BigDecimal totalPrice = transaction.getUnitPrice().multiply(transaction.getQuantity());
            transaction.setTotalPrice(totalPrice);
        }

        return transactionRepository.save(transaction);
    }

    @Override
    public void deleteTransaction(Long id) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
        transactionRepository.delete(transaction);
    }

    @Override
    public List<Transaction> getTransactionsByType(TransactionType type) {
        return transactionRepository.findByTransactionType(type);
    }

    @Override
    public List<Transaction> getTransactionsByEntityType(EntityType entityType) {
        return transactionRepository.findByEntityType(entityType);
    }

    @Override
    public List<Transaction> getTransactionsByStatus(TransactionStatus status) {
        return transactionRepository.findByStatus(status);
    }

    @Override
    public List<Transaction> getTransactionsByUserId(Long userId) {
        return transactionRepository.findByUserId(userId);
    }

    @Override
    public List<Transaction> getTransactionsByWarehouseId(Long warehouseId) {
        return transactionRepository.findByWarehouseId(warehouseId);
    }

    @Override
    public List<Transaction> getTransactionsByItemId(Long itemId) {
        return transactionRepository.findByItemId(itemId);
    }

    @Override
    public List<Transaction> getTransactionsByProductId(Long productId) {
        return transactionRepository.findByProductId(productId);
    }

    @Override
    public List<Transaction> getTransactionsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return transactionRepository.findByTransactionDateBetween(startDate, endDate);
    }

    @Override
    public List<Transaction> searchTransactionsByReference(String reference) {
        return transactionRepository.findByReferenceNumberContaining(reference);
    }

    @Override
    public List<Transaction> getRecentTransactions() {
        return transactionRepository.findAllOrderByTransactionDateDesc();
    }

    @Override
    public Transaction createItemInboundTransaction(Long itemId, Long warehouseId, Long userId, 
                                                   BigDecimal quantity, BigDecimal unitPrice, String notes) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new RuntimeException("Warehouse not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Transaction transaction = new Transaction();
        transaction.setTransactionType(TransactionType.INBOUND);
        transaction.setEntityType(EntityType.ITEMS);
        transaction.setItem(item);
        transaction.setWarehouse(warehouse);
        transaction.setUser(user);
        transaction.setQuantity(quantity);
        transaction.setUnitPrice(unitPrice);
        transaction.setTotalPrice(unitPrice.multiply(quantity));
        transaction.setStatus(TransactionStatus.COMPLETED);
        transaction.setNotes(notes);
        transaction.setTransactionDate(LocalDateTime.now());
        transaction.setReferenceNumber(generateReferenceNumber());

        // Update item quantity
        BigDecimal currentQuantity = item.getQuantity() != null ? item.getQuantity() : BigDecimal.ZERO;
        item.setQuantity(currentQuantity.add(quantity));
        itemRepository.save(item);

        return transactionRepository.save(transaction);
    }

    @Override
    public Transaction createProductInboundTransaction(Long productId, Long warehouseId, Long userId, 
                                                      BigDecimal quantity, BigDecimal unitPrice, String notes) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new RuntimeException("Warehouse not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Transaction transaction = new Transaction();
        transaction.setTransactionType(TransactionType.INBOUND);
        transaction.setEntityType(EntityType.PRODUCTS);
        transaction.setProduct(product);
        transaction.setWarehouse(warehouse);
        transaction.setUser(user);
        transaction.setQuantity(quantity);
        transaction.setUnitPrice(unitPrice);
        transaction.setTotalPrice(unitPrice.multiply(quantity));
        transaction.setStatus(TransactionStatus.COMPLETED);
        transaction.setNotes(notes);
        transaction.setTransactionDate(LocalDateTime.now());
        transaction.setReferenceNumber(generateReferenceNumber());

        // Update product quantity
        BigDecimal currentQuantity = product.getQuantity() != null ? product.getQuantity() : BigDecimal.ZERO;
        product.setQuantity(currentQuantity.add(quantity));
        productRepository.save(product);

        return transactionRepository.save(transaction);
    }

    @Override
    public Transaction createItemOutboundTransaction(Long itemId, Long warehouseId, Long userId, 
                                                    BigDecimal quantity, BigDecimal unitPrice, String notes) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new RuntimeException("Warehouse not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if enough quantity is available
        BigDecimal currentQuantity = item.getQuantity() != null ? item.getQuantity() : BigDecimal.ZERO;
        if (currentQuantity.compareTo(quantity) < 0) {
            throw new RuntimeException("Insufficient quantity available");
        }

        Transaction transaction = new Transaction();
        transaction.setTransactionType(TransactionType.OUTBOUND);
        transaction.setEntityType(EntityType.ITEMS);
        transaction.setItem(item);
        transaction.setWarehouse(warehouse);
        transaction.setUser(user);
        transaction.setQuantity(quantity);
        transaction.setUnitPrice(unitPrice);
        transaction.setTotalPrice(unitPrice.multiply(quantity));
        transaction.setStatus(TransactionStatus.COMPLETED);
        transaction.setNotes(notes);
        transaction.setTransactionDate(LocalDateTime.now());
        transaction.setReferenceNumber(generateReferenceNumber());

        // Update item quantity
        item.setQuantity(currentQuantity.subtract(quantity));
        itemRepository.save(item);

        return transactionRepository.save(transaction);
    }

    @Override
    public Transaction createProductOutboundTransaction(Long productId, Long warehouseId, Long userId, 
                                                       BigDecimal quantity, BigDecimal unitPrice, String notes) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new RuntimeException("Warehouse not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if enough quantity is available
        BigDecimal currentQuantity = product.getQuantity() != null ? product.getQuantity() : BigDecimal.ZERO;
        if (currentQuantity.compareTo(quantity) < 0) {
            throw new RuntimeException("Insufficient quantity available");
        }

        Transaction transaction = new Transaction();
        transaction.setTransactionType(TransactionType.OUTBOUND);
        transaction.setEntityType(EntityType.PRODUCTS);
        transaction.setProduct(product);
        transaction.setWarehouse(warehouse);
        transaction.setUser(user);
        transaction.setQuantity(quantity);
        transaction.setUnitPrice(unitPrice);
        transaction.setTotalPrice(unitPrice.multiply(quantity));
        transaction.setStatus(TransactionStatus.COMPLETED);
        transaction.setNotes(notes);
        transaction.setTransactionDate(LocalDateTime.now());
        transaction.setReferenceNumber(generateReferenceNumber());

        // Update product quantity
        product.setQuantity(currentQuantity.subtract(quantity));
        productRepository.save(product);

        return transactionRepository.save(transaction);
    }

    private String generateReferenceNumber() {
        return "TXN-" + System.currentTimeMillis();
    }
}
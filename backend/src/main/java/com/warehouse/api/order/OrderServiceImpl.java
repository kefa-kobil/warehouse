package com.warehouse.api.order;

import com.warehouse.api.item.Item;
import com.warehouse.api.item.ItemRepository;
import com.warehouse.api.transaction.Transaction;
import com.warehouse.api.transaction.TransactionRepository;
import com.warehouse.api.user.UserRepository;
import com.warehouse.api.warehouse.WarehouseRepository;
import com.warehouse.enums.EntityType;
import com.warehouse.enums.OrderStatus;
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
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ItemRepository itemRepository;
    private final UserRepository userRepository;
    private final WarehouseRepository warehouseRepository;
    private final TransactionRepository transactionRepository;

    @Override
    public List<Order> getAllOrders() {
        return orderRepository.findAllOrderByOrderDateDesc();
    }

    @Override
    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findById(id);
    }

    @Override
    public Optional<Order> getOrderByNumber(String orderNumber) {
        return orderRepository.findByOrderNumber(orderNumber);
    }

    @Override
    public Order createOrder(Order order) {
        // Generate order number if not provided
        if (order.getOrderNumber() == null || order.getOrderNumber().isEmpty()) {
            order.setOrderNumber(generateOrderNumber());
        }
        
        return orderRepository.save(order);
    }

    @Override
    public Order updateOrder(Long id, Order orderDetails) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setWarehouse(orderDetails.getWarehouse());
        order.setUser(orderDetails.getUser());
        order.setStatus(orderDetails.getStatus());
        order.setOrderDate(orderDetails.getOrderDate());
        order.setReceivedDate(orderDetails.getReceivedDate());
        order.setTotalAmount(orderDetails.getTotalAmount());
        order.setNotes(orderDetails.getNotes());
        order.setSupplier(orderDetails.getSupplier());

        return orderRepository.save(order);
    }

    @Override
    public void deleteOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        orderRepository.delete(order);
    }

    @Override
    public List<Order> getOrdersByStatus(OrderStatus status) {
        return orderRepository.findByStatus(status);
    }

    @Override
    public List<Order> getOrdersByUserId(Long userId) {
        return orderRepository.findByUserId(userId);
    }

    @Override
    public List<Order> getOrdersByWarehouseId(Long warehouseId) {
        return orderRepository.findByWarehouseId(warehouseId);
    }

    @Override
    public List<Order> getOrdersByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return orderRepository.findByOrderDateBetween(startDate, endDate);
    }

    @Override
    public List<Order> searchOrdersBySupplier(String supplier) {
        return orderRepository.findBySupplierContaining(supplier);
    }

    @Override
    public Order confirmOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new RuntimeException("Order can only be confirmed from PENDING status");
        }

        order.setStatus(OrderStatus.CONFIRMED);
        return orderRepository.save(order);
    }

    @Override
    public Order receiveOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getStatus() != OrderStatus.CONFIRMED) {
            throw new RuntimeException("Order can only be received from CONFIRMED status");
        }

        // Add all order items to inventory and create transactions
        List<OrderItem> orderItems = orderItemRepository.findByOrder(order);
        for (OrderItem orderItem : orderItems) {
            Item item = orderItem.getItem();
            
            // Update item quantity
            BigDecimal newQuantity = item.getQuantity().add(orderItem.getOrderedQuantity());
            item.setQuantity(newQuantity);
            itemRepository.save(item);

            // Create inbound transaction
            Transaction transaction = new Transaction();
            transaction.setTransactionType(TransactionType.INBOUND);
            transaction.setEntityType(EntityType.ITEMS);
            transaction.setItem(item);
            transaction.setWarehouse(order.getWarehouse());
            transaction.setUser(order.getUser());
            transaction.setQuantity(orderItem.getOrderedQuantity());
            transaction.setUnitPrice(orderItem.getUnitPrice());
            transaction.setTotalPrice(orderItem.getTotalPrice());
            transaction.setStatus(TransactionStatus.COMPLETED);
            transaction.setTransactionDate(LocalDateTime.now());
            transaction.setReferenceNumber("ORDER-" + order.getOrderNumber());
            transaction.setNotes("Order received - " + order.getOrderNumber() + " from " + order.getSupplier());
            transactionRepository.save(transaction);

            // Update received quantity
            orderItem.setReceivedQuantity(orderItem.getOrderedQuantity());
            orderItemRepository.save(orderItem);
        }

        order.setStatus(OrderStatus.RECEIVED);
        order.setReceivedDate(LocalDateTime.now());
        return orderRepository.save(order);
    }

    @Override
    public Order cancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getStatus() == OrderStatus.RECEIVED) {
            throw new RuntimeException("Cannot cancel received order");
        }

        order.setStatus(OrderStatus.CANCELLED);
        return orderRepository.save(order);
    }

    @Override
    public List<OrderItem> getOrderItems(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return orderItemRepository.findByOrder(order);
    }

    @Override
    public OrderItem addOrderItem(Long orderId, OrderItem orderItem) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        orderItem.setOrder(order);
        
        // Calculate total price
        BigDecimal totalPrice = orderItem.getOrderedQuantity().multiply(orderItem.getUnitPrice());
        orderItem.setTotalPrice(totalPrice);

        OrderItem savedItem = orderItemRepository.save(orderItem);
        
        // Update order total amount
        updateOrderTotalAmount(order);
        
        return savedItem;
    }

    @Override
    public OrderItem updateOrderItem(Long orderItemId, OrderItem orderItemDetails) {
        OrderItem orderItem = orderItemRepository.findById(orderItemId)
                .orElseThrow(() -> new RuntimeException("Order item not found"));

        orderItem.setItem(orderItemDetails.getItem());
        orderItem.setOrderedQuantity(orderItemDetails.getOrderedQuantity());
        orderItem.setReceivedQuantity(orderItemDetails.getReceivedQuantity());
        orderItem.setUnitPrice(orderItemDetails.getUnitPrice());

        // Recalculate total price
        BigDecimal totalPrice = orderItem.getOrderedQuantity().multiply(orderItem.getUnitPrice());
        orderItem.setTotalPrice(totalPrice);

        OrderItem savedItem = orderItemRepository.save(orderItem);
        
        // Update order total amount
        updateOrderTotalAmount(orderItem.getOrder());
        
        return savedItem;
    }

    @Override
    public void removeOrderItem(Long orderItemId) {
        OrderItem orderItem = orderItemRepository.findById(orderItemId)
                .orElseThrow(() -> new RuntimeException("Order item not found"));
        
        Order order = orderItem.getOrder();
        orderItemRepository.delete(orderItem);
        
        // Update order total amount
        updateOrderTotalAmount(order);
    }

    private void updateOrderTotalAmount(Order order) {
        List<OrderItem> orderItems = orderItemRepository.findByOrder(order);
        BigDecimal totalAmount = orderItems.stream()
                .map(OrderItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        order.setTotalAmount(totalAmount);
        orderRepository.save(order);
    }

    private String generateOrderNumber() {
        return "ORD-" + System.currentTimeMillis();
    }
}
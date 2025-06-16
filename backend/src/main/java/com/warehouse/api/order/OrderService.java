package com.warehouse.api.order;

import com.warehouse.enums.OrderStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderService {

    List<Order> getAllOrders();

    Optional<Order> getOrderById(Long id);

    Optional<Order> getOrderByNumber(String orderNumber);

    Order createOrder(Order order);

    Order updateOrder(Long id, Order orderDetails);

    void deleteOrder(Long id);

    List<Order> getOrdersByStatus(OrderStatus status);

    List<Order> getOrdersByUserId(Long userId);

    List<Order> getOrdersByWarehouseId(Long warehouseId);

    List<Order> getOrdersByDateRange(LocalDateTime startDate, LocalDateTime endDate);

    List<Order> searchOrdersBySupplier(String supplier);

    Order confirmOrder(Long orderId);

    Order receiveOrder(Long orderId);

    Order cancelOrder(Long orderId);

    List<OrderItem> getOrderItems(Long orderId);

    OrderItem addOrderItem(Long orderId, OrderItem orderItem);

    OrderItem updateOrderItem(Long orderItemId, OrderItem orderItemDetails);

    void removeOrderItem(Long orderItemId);
}
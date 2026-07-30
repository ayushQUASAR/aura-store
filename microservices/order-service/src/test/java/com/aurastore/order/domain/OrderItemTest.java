package com.aurastore.order.domain;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class OrderItemTest {

    @Test
    void createOrderItem() {
        OrderItem item = new OrderItem(1L, "Laptop", 2, 999.99);
        assertEquals(1L, item.getProductId());
        assertEquals("Laptop", item.getProductName());
        assertEquals(2, item.getQuantity());
        assertEquals(999.99, item.getPrice());
    }

    @Test
    void defaultConstructor() {
        OrderItem item = new OrderItem();
        assertNull(item.getId());
        assertNull(item.getProductName());
    }

    @Test
    void updateQuantity() {
        OrderItem item = new OrderItem(1L, "Laptop", 1, 999.99);
        item.setQuantity(3);
        assertEquals(3, item.getQuantity());
    }
}

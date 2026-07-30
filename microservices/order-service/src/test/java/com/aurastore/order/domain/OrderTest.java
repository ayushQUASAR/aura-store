package com.aurastore.order.domain;

import org.junit.jupiter.api.Test;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

class OrderTest {

    @Test
    void createOrder() {
        OrderItem item = new OrderItem(1L, "Laptop", 1, 999.99);
        Order o = new Order("user@test.com", List.of(item), 999.99, "PENDING");
        assertEquals("user@test.com", o.getUserEmail());
        assertEquals(999.99, o.getTotalAmount());
        assertEquals("PENDING", o.getStatus());
        assertEquals(1, o.getItems().size());
        assertNotNull(o.getCreatedAt());
    }

    @Test
    void updateStatus() {
        Order o = new Order("user@test.com", List.of(), 0.0, "PENDING");
        o.setStatus("PROCESSING");
        assertEquals("PROCESSING", o.getStatus());
    }

    @Test
    void defaultConstructor() {
        Order o = new Order();
        assertNull(o.getId());
        assertNull(o.getUserEmail());
    }
}

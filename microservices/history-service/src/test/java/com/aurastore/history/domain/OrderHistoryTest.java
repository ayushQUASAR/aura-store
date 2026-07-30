package com.aurastore.history.domain;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class OrderHistoryTest {

    @Test
    void createOrderHistory() {
        OrderHistory h = new OrderHistory(1L, "user@test.com", "CREATED", 99.99, "PROCESSING", "Order placed");
        assertEquals(1L, h.getOrderId());
        assertEquals("user@test.com", h.getUserEmail());
        assertEquals("CREATED", h.getAction());
        assertEquals(99.99, h.getTotalAmount());
        assertEquals("PROCESSING", h.getStatus());
        assertEquals("Order placed", h.getDetails());
        assertNotNull(h.getEventTime());
    }

    @Test
    void defaultConstructor() {
        OrderHistory h = new OrderHistory();
        assertNull(h.getId());
        assertNull(h.getOrderId());
    }

    @Test
    void updateDetails() {
        OrderHistory h = new OrderHistory(1L, "user@test.com", "CREATED", 99.99, "PROCESSING", "Order placed");
        h.setDetails("Updated details");
        h.setStatus("SHIPPED");
        assertEquals("Updated details", h.getDetails());
        assertEquals("SHIPPED", h.getStatus());
    }
}

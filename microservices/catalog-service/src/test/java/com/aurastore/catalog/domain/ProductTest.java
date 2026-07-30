package com.aurastore.catalog.domain;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class ProductTest {

    @Test
    void createProduct() {
        Product p = new Product("Laptop", "High-end laptop", 1299.99, "Electronics", "laptop.jpg", 10);
        assertEquals("Laptop", p.getName());
        assertEquals("High-end laptop", p.getDescription());
        assertEquals(1299.99, p.getPrice());
        assertEquals("Electronics", p.getCategory());
        assertEquals("laptop.jpg", p.getImageUrl());
        assertEquals(10, p.getStock());
    }

    @Test
    void updateProduct() {
        Product p = new Product("Laptop", "High-end laptop", 1299.99, "Electronics", "laptop.jpg", 10);
        p.setName("Gaming Laptop");
        p.setPrice(1599.99);
        p.setStock(5);
        assertEquals("Gaming Laptop", p.getName());
        assertEquals(1599.99, p.getPrice());
        assertEquals(5, p.getStock());
    }

    @Test
    void defaultConstructor() {
        Product p = new Product();
        assertNull(p.getId());
        assertNull(p.getName());
    }
}

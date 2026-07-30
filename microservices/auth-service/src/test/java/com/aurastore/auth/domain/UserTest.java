package com.aurastore.auth.domain;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class UserTest {

    @Test
    void createUser() {
        User user = new User("test@example.com", "Test User", "password123", "CUSTOMER");
        assertEquals("test@example.com", user.getEmail());
        assertEquals("Test User", user.getName());
        assertEquals("password123", user.getPassword());
        assertEquals("CUSTOMER", user.getRole());
    }

    @Test
    void updateUser() {
        User user = new User("test@example.com", "Test User", "password123", "CUSTOMER");
        user.setEmail("updated@example.com");
        user.setName("Updated User");
        user.setPassword("newpassword");
        user.setRole("ADMIN");
        assertEquals("updated@example.com", user.getEmail());
        assertEquals("Updated User", user.getName());
        assertEquals("newpassword", user.getPassword());
        assertEquals("ADMIN", user.getRole());
    }

    @Test
    void defaultConstructor() {
        User user = new User();
        assertNull(user.getId());
        assertNull(user.getEmail());
    }
}

package com.aurastore.auth.controller;

import com.aurastore.auth.domain.User;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserRepository userRepository;

    @Test
    void register_withMissingEmail_returnsBadRequest() throws Exception {
        Map<String, String> body = Map.of("name", "Test", "password", "pass123", "role", "CUSTOMER");
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Email is required"));
    }

    @Test
    void login_withMissingCredentials_returnsUnauthorized() throws Exception {
        when(userRepository.findByEmail("nonexistent@test.com")).thenReturn(Optional.empty());
        Map<String, String> body = Map.of("email", "nonexistent@test.com", "password", "wrong");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Invalid credentials"));
    }

    @Test
    void register_withInvalidRole_returnsBadRequest() throws Exception {
        Map<String, String> body = Map.of(
                "email", "test@test.com",
                "name", "Test",
                "password", "pass123",
                "role", "INVALID"
        );
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Role must be CUSTOMER or ADMIN"));
    }

    @Test
    void register_withExistingEmail_returnsBadRequest() throws Exception {
        User existing = new User("test@test.com", "Test", "pass123", "CUSTOMER");
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(existing));
        Map<String, String> body = Map.of(
                "email", "test@test.com",
                "name", "Test",
                "password", "pass123",
                "role", "CUSTOMER"
        );
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Email already exists"));
    }

    @Test
    void register_withMissingPassword_returnsBadRequest() throws Exception {
        Map<String, String> body = Map.of(
                "email", "test@test.com",
                "name", "Test",
                "role", "CUSTOMER"
        );
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Password is required"));
    }

    @Test
    void register_withMissingName_returnsBadRequest() throws Exception {
        Map<String, String> body = Map.of(
                "email", "test@test.com",
                "password", "pass123",
                "role", "CUSTOMER"
        );
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Name is required"));
    }
}

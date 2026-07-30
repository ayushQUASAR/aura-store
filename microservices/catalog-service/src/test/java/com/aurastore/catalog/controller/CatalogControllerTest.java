package com.aurastore.catalog.controller;

import com.aurastore.catalog.domain.Product;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CatalogController.class)
@Import(SimpleMeterRegistry.class)
@TestPropertySource(properties = "spring.cache.type=none")
class CatalogControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ProductRepository productRepository;

    @MockBean
    private CatalogService catalogService;

    @MockBean
    private KafkaTemplate<String, String> kafkaTemplate;

    @Test
    void getAllProducts_returnsList() throws Exception {
        when(productRepository.findAll(any(Pageable.class))).thenReturn(new PageImpl<>(List.of(
                new Product("Laptop", "Desc", 999.99, "Electronics", "img.jpg", 5)
        )));

        mockMvc.perform(get("/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].name").value("Laptop"));
    }

    @Test
    void getProductsByCategory_filtersResults() throws Exception {
        when(productRepository.findByCategory(any(), any(Pageable.class))).thenReturn(new PageImpl<>(List.of(
                new Product("Laptop", "Desc", 999.99, "Electronics", "img.jpg", 5)
        )));

        mockMvc.perform(get("/products?category=Electronics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].category").value("Electronics"));
    }

    @Test
    void getCategories_returnsList() throws Exception {
        mockMvc.perform(get("/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0]").value("Electronics"));
    }

    @Test
    void getProductById_found() throws Exception {
        Product p = new Product("Laptop", "Desc", 999.99, "Electronics", "img.jpg", 5);
        when(catalogService.getProductById(1L)).thenReturn(p);

        mockMvc.perform(get("/products/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Laptop"));
    }

    @Test
    void getProductById_notFound() throws Exception {
        when(catalogService.getProductById(99L)).thenReturn(null);

        mockMvc.perform(get("/products/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Product not found"));
    }

    @Test
    void createProduct_returnsCreated() throws Exception {
        Product p = new Product("New", "Desc", 10.0, "Books", "img.jpg", 1);
        when(productRepository.save(any())).thenReturn(p);

        mockMvc.perform(post("/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(p)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("New"));
    }

    @Test
    void updateProduct_found() throws Exception {
        Product existing = new Product("Old", "Desc", 5.0, "Books", "img.jpg", 1);
        when(productRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(productRepository.save(any())).thenReturn(existing);

        mockMvc.perform(put("/products/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Updated\",\"price\":15.0,\"category\":\"Books\",\"stock\":2}"))
                .andExpect(status().isOk());
    }

    @Test
    void updateProduct_notFound() throws Exception {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        mockMvc.perform(put("/products/99")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Nope\",\"price\":1.0,\"category\":\"X\",\"stock\":1}"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Product not found"));
    }

    @Test
    void deleteProduct_found() throws Exception {
        when(productRepository.existsById(1L)).thenReturn(true);

        mockMvc.perform(delete("/products/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void deleteProduct_notFound() throws Exception {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        mockMvc.perform(delete("/products/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Product not found"));
    }
}

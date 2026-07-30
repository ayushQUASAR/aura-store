package com.aurastore.order.controller;

import com.aurastore.order.domain.Order;
import com.aurastore.order.domain.OrderItem;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(OrderController.class)
@Import(SimpleMeterRegistry.class)
class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private OrderRepository orderRepository;

    @MockBean
    private KafkaTemplate<String, String> kafkaTemplate;

    @Test
    void getOrders_returnsList() throws Exception {
        when(orderRepository.findAll()).thenReturn(List.of(
                new Order("user@test.com", List.of(), 99.99, "PROCESSING")
        ));

        mockMvc.perform(get("/api/orders"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].userEmail").value("user@test.com"));
    }

    @Test
    void createOrder_returnsCreated() throws Exception {
        Order order = new Order("user@test.com", List.of(), 99.99, null);
        Order saved = new Order("user@test.com", List.of(), 99.99, null);
        when(orderRepository.save(any())).thenReturn(saved);

        mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(order)))
                .andExpect(status().isCreated());
    }

    @Test
    void updateStatus_found() throws Exception {
        Order existing = new Order("user@test.com", List.of(), 99.99, "PROCESSING");
        when(orderRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(orderRepository.save(any())).thenReturn(existing);

        mockMvc.perform(put("/api/orders/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"SHIPPED\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SHIPPED"));
    }

    @Test
    void updateStatus_notFound() throws Exception {
        when(orderRepository.findById(99L)).thenReturn(Optional.empty());

        mockMvc.perform(put("/api/orders/99/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"SHIPPED\"}"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Order not found"));
    }
}

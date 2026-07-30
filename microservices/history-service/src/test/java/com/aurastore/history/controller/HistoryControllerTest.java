package com.aurastore.history.controller;

import com.aurastore.history.domain.OrderHistory;
import com.aurastore.history.domain.OrderHistoryRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(HistoryController.class)
@Import(SimpleMeterRegistry.class)
class HistoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private OrderHistoryRepository orderHistoryRepository;

    @Test
    void getHistoryByEmail_returnsList() throws Exception {
        when(orderHistoryRepository.findByUserEmailOrderByEventTimeDesc("user@test.com"))
                .thenReturn(List.of(new OrderHistory(1L, "user@test.com", "CREATED", 99.99, "PROCESSING", "Order placed")));

        mockMvc.perform(get("/api/history/user@test.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].action").value("CREATED"));
    }

    @Test
    void getHistoryByOrderId_returnsList() throws Exception {
        when(orderHistoryRepository.findByOrderIdOrderByEventTimeDesc(1L))
                .thenReturn(List.of(new OrderHistory(1L, "user@test.com", "CREATED", 99.99, "PROCESSING", "Order placed")));

        mockMvc.perform(get("/api/history/order/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].orderId").value(1));
    }

    @Test
    void getHistoryByEmailAndOrder_returnsList() throws Exception {
        when(orderHistoryRepository.findByUserEmailAndOrderIdOrderByEventTimeDesc("user@test.com", 1L))
                .thenReturn(List.of(new OrderHistory(1L, "user@test.com", "CREATED", 99.99, "PROCESSING", "Order placed")));

        mockMvc.perform(get("/api/history/user@test.com/order/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].action").value("CREATED"));
    }

    @Test
    void getUserStats_returnsStats() throws Exception {
        when(orderHistoryRepository.findByUserEmailOrderByEventTimeDesc("user@test.com"))
                .thenReturn(List.of(
                        new OrderHistory(1L, "user@test.com", "CREATED", 100.0, "PROCESSING", "Order placed"),
                        new OrderHistory(1L, "user@test.com", "STATUS_UPDATE", null, "SHIPPED", "Status changed"),
                        new OrderHistory(2L, "user@test.com", "CREATED", 50.0, "PROCESSING", "Order placed")
                ));

        mockMvc.perform(get("/api/history/user@test.com/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userEmail").value("user@test.com"))
                .andExpect(jsonPath("$.totalOrders").value(2))
                .andExpect(jsonPath("$.totalSpent").value(150.0))
                .andExpect(jsonPath("$.totalStatusUpdates").value(1))
                .andExpect(jsonPath("$.totalEvents").value(3));
    }

    @Test
    void getAllHistory_returnsAll() throws Exception {
        when(orderHistoryRepository.findAll()).thenReturn(List.of(
                new OrderHistory(1L, "user@test.com", "CREATED", 99.99, "PROCESSING", "Order placed")
        ));

        mockMvc.perform(get("/api/history"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].action").value("CREATED"));
    }

    @Test
    void getAllHistory_withEmailFilter() throws Exception {
        when(orderHistoryRepository.findByUserEmailOrderByEventTimeDesc("filtered@test.com"))
                .thenReturn(List.of(new OrderHistory(1L, "filtered@test.com", "CREATED", 99.99, "PROCESSING", "Order placed")));

        mockMvc.perform(get("/api/history?email=filtered@test.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].userEmail").value("filtered@test.com"));
    }
}

package com.aurastore.history.consumer;

import com.aurastore.history.domain.OrderHistory;
import com.aurastore.history.domain.OrderHistoryRepository;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderCreatedConsumerTest {

    @Mock
    private OrderHistoryRepository orderHistoryRepository;

    @InjectMocks
    private OrderCreatedConsumer consumer;

    @Captor
    private ArgumentCaptor<OrderHistory> historyCaptor;

    @Test
    void consumeOrderCreated_savesHistory() {
        ConsumerRecord<String, String> record = new ConsumerRecord<>("orders-created", 0, 0, "1",
                "{\"orderId\": 1, \"userEmail\": \"user@test.com\", \"amount\": 99.99}");

        consumer.consumeOrderCreated(record);

        verify(orderHistoryRepository).save(historyCaptor.capture());
        OrderHistory saved = historyCaptor.getValue();
        assertEquals(1L, saved.getOrderId());
        assertEquals("user@test.com", saved.getUserEmail());
        assertEquals("CREATED", saved.getAction());
        assertEquals(99.99, saved.getTotalAmount());
    }

    @Test
    void consumeOrderStatusUpdate_savesHistory() {
        when(orderHistoryRepository.findByOrderIdOrderByEventTimeDesc(1L))
                .thenReturn(java.util.List.of(new OrderHistory(1L, "user@test.com", "CREATED", 99.99, "PROCESSING", "Order placed")));

        ConsumerRecord<String, String> record = new ConsumerRecord<>("order-fulfillment-updates", 0, 0, "1",
                "{\"orderId\": 1, \"status\": \"SHIPPED\"}");

        consumer.consumeOrderStatusUpdate(record);

        verify(orderHistoryRepository).save(historyCaptor.capture());
        OrderHistory saved = historyCaptor.getValue();
        assertEquals(1L, saved.getOrderId());
        assertEquals("STATUS_UPDATE", saved.getAction());
        assertEquals("SHIPPED", saved.getStatus());
    }

    @Test
    void consumeOrderCreated_malformedJson_doesNotSave() {
        ConsumerRecord<String, String> record = new ConsumerRecord<>("orders-created", 0, 0, "1", "not-json");
        consumer.consumeOrderCreated(record);
        verify(orderHistoryRepository, never()).save(any());
    }

    @Test
    void consumeOrderStatusUpdate_noPreviousHistory_doesNotSave() {
        when(orderHistoryRepository.findByOrderIdOrderByEventTimeDesc(1L))
                .thenReturn(java.util.List.of());

        ConsumerRecord<String, String> record = new ConsumerRecord<>("order-fulfillment-updates", 0, 0, "1",
                "{\"orderId\": 1, \"status\": \"SHIPPED\"}");

        consumer.consumeOrderStatusUpdate(record);
        verify(orderHistoryRepository, never()).save(any());
    }
}

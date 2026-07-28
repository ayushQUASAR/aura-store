package com.aurastore.history.consumer;

import com.aurastore.history.domain.OrderHistory;
import com.aurastore.history.domain.OrderHistoryRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class OrderCreatedConsumer {

    private final OrderHistoryRepository historyRepository;
    private final ObjectMapper objectMapper;

    public OrderCreatedConsumer(OrderHistoryRepository historyRepository) {
        this.historyRepository = historyRepository;
        this.objectMapper = new ObjectMapper();
    }

    @KafkaListener(topics = "orders-created", groupId = "history-group")
    public void consumeOrderCreated(ConsumerRecord<String, String> record) {
        try {
            JsonNode json = objectMapper.readTree(record.value());
            Long orderId = json.get("orderId").asLong();
            String userEmail = json.get("userEmail").asText();
            Double amount = json.get("amount").asDouble();

            OrderHistory history = new OrderHistory(
                    orderId,
                    userEmail,
                    "CREATED",
                    amount,
                    "PROCESSING",
                    "Order placed successfully"
            );
            historyRepository.save(history);
            System.out.printf("History: recorded creation of order %d for %s%n", orderId, userEmail);
        } catch (Exception e) {
            System.err.println("History: failed to process orders-created event: " + e.getMessage());
        }
    }

    @KafkaListener(topics = "order-fulfillment-updates", groupId = "history-group")
    public void consumeOrderStatusUpdate(ConsumerRecord<String, String> record) {
        try {
            JsonNode json = objectMapper.readTree(record.value());
            Long orderId = json.get("orderId").asLong();
            String status = json.get("status").asText();

            String userEmail = historyRepository.findByOrderIdOrderByEventTimeDesc(orderId)
                    .stream()
                    .findFirst()
                    .map(OrderHistory::getUserEmail)
                    .orElse(null);

            OrderHistory history = new OrderHistory(
                    orderId,
                    userEmail,
                    "STATUS_UPDATE",
                    null,
                    status,
                    "Order status changed to " + status
            );
            historyRepository.save(history);
            System.out.printf("History: recorded status update for order %d -> %s%n", orderId, status);
        } catch (Exception e) {
            System.err.println("History: failed to process order-fulfillment-updates event: " + e.getMessage());
        }
    }
}

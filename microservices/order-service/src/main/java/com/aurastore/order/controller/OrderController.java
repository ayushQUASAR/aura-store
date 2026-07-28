package com.aurastore.order.controller;

import com.aurastore.order.domain.Order;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserEmail(String userEmail);
}

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderRepository orderRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;
    // Prometheus Metrics
    private final Counter orderCreatedCounter;
    private final Counter orderStatusUpdatesCounter;

    public OrderController(OrderRepository orderRepository,
                           KafkaTemplate<String, String> kafkaTemplate,
                           MeterRegistry meterRegistry) {
        this.orderRepository = orderRepository;
        this.kafkaTemplate = kafkaTemplate;

        this.orderCreatedCounter = Counter.builder("orders_placed_total")
                .description("Total transactions created in Order Service")
                .register(meterRegistry);

        this.orderStatusUpdatesCounter = Counter.builder("orders_status_updates_total")
                .description("Total order status modifications processed")
                .register(meterRegistry);
    }

    @GetMapping
    public ResponseEntity<?> getOrders() {
        return ResponseEntity.ok(orderRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody Order order) {
        order.setStatus("PROCESSING");
        order.setCreatedAt(LocalDateTime.now());

        Order saved = orderRepository.save(order);
        orderCreatedCounter.increment();

        // Kafka publish
        try {
            String kafkaMessage = String.format("{\"orderId\": %d, \"userEmail\": \"%s\", \"amount\": %.2f}",
                    saved.getId(), saved.getUserEmail(), saved.getTotalAmount());
            kafkaTemplate.send("orders-created", String.valueOf(saved.getId()), kafkaMessage);
        } catch (Exception e) {
            System.err.println("Kafka order placement event dispatch failed: " + e.getMessage());
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        Optional<Order> orderOpt = orderRepository.findById(id);
        if (orderOpt.isPresent()) {
            Order dbOrder = orderOpt.get();
            String newStatus = request.get("status");
            dbOrder.setStatus(newStatus);
            Order updated = orderRepository.save(dbOrder);
            orderStatusUpdatesCounter.increment();

            // Kafka event dispatch
            try {
                String kafkaMessage = String.format("{\"orderId\": %d, \"status\": \"%s\"}",
                        updated.getId(), updated.getStatus());
                kafkaTemplate.send("order-fulfillment-updates", String.valueOf(updated.getId()), kafkaMessage);
            } catch (Exception e) {
                System.err.println("Kafka order status update event dispatch failed: " + e.getMessage());
            }

            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Order not found"));
    }
}

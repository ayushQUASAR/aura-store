package com.aurastore.history.controller;

import com.aurastore.history.domain.OrderHistory;
import com.aurastore.history.domain.OrderHistoryRepository;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/history")
public class HistoryController {

    private final OrderHistoryRepository historyRepository;
    private final Counter historyFetchCounter;

    public HistoryController(OrderHistoryRepository historyRepository, MeterRegistry meterRegistry) {
        this.historyRepository = historyRepository;

        this.historyFetchCounter = Counter.builder("history_fetches_total")
                .description("Total number of order history lookups")
                .register(meterRegistry);
    }

    @GetMapping("/{userEmail}")
    public ResponseEntity<?> getHistoryByEmail(@PathVariable String userEmail) {
        historyFetchCounter.increment();
        List<OrderHistory> history = historyRepository.findByUserEmailOrderByEventTimeDesc(userEmail);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<?> getHistoryByOrderId(@PathVariable Long orderId) {
        historyFetchCounter.increment();
        List<OrderHistory> history = historyRepository.findByOrderIdOrderByEventTimeDesc(orderId);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/{userEmail}/order/{orderId}")
    public ResponseEntity<?> getHistoryByEmailAndOrder(
            @PathVariable String userEmail, @PathVariable Long orderId) {
        historyFetchCounter.increment();
        List<OrderHistory> history = historyRepository
                .findByUserEmailAndOrderIdOrderByEventTimeDesc(userEmail, orderId);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/{userEmail}/stats")
    public ResponseEntity<?> getUserStats(@PathVariable String userEmail) {
        historyFetchCounter.increment();
        List<OrderHistory> allHistory = historyRepository.findByUserEmailOrderByEventTimeDesc(userEmail);

        long totalOrders = allHistory.stream()
                .filter(h -> "CREATED".equals(h.getAction()))
                .count();

        double totalSpent = allHistory.stream()
                .filter(h -> h.getTotalAmount() != null)
                .mapToDouble(OrderHistory::getTotalAmount)
                .sum();

        long statusUpdates = allHistory.stream()
                .filter(h -> "STATUS_UPDATE".equals(h.getAction()))
                .count();

        return ResponseEntity.ok(Map.of(
                "userEmail", userEmail,
                "totalOrders", totalOrders,
                "totalSpent", totalSpent,
                "totalStatusUpdates", statusUpdates,
                "totalEvents", allHistory.size()
        ));
    }

    @GetMapping
    public ResponseEntity<?> getAllHistory(@RequestParam(required = false) String email) {
        historyFetchCounter.increment();
        if (email != null && !email.isEmpty()) {
            return ResponseEntity.ok(historyRepository.findByUserEmailOrderByEventTimeDesc(email));
        }
        return ResponseEntity.ok(historyRepository.findAll());
    }
}

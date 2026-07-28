package com.aurastore.history.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderHistoryRepository extends JpaRepository<OrderHistory, Long> {
    List<OrderHistory> findByUserEmailOrderByEventTimeDesc(String userEmail);
    List<OrderHistory> findByOrderIdOrderByEventTimeDesc(Long orderId);
    List<OrderHistory> findByUserEmailAndOrderIdOrderByEventTimeDesc(String userEmail, Long orderId);
}

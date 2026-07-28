package com.aurastore.history.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "order_history")
public class OrderHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_id", nullable = false)
    private Long orderId;

    @Column(name = "user_email")
    private String userEmail;

    @Column(nullable = false)
    private String action;

    @Column(name = "total_amount")
    private Double totalAmount;

    @Column(nullable = false)
    private String status;

    @Column(name = "details")
    private String details;

    @Column(name = "event_time", nullable = false)
    private LocalDateTime eventTime;

    public OrderHistory() {}

    public OrderHistory(Long orderId, String userEmail, String action, Double totalAmount,
                        String status, String details) {
        this.orderId = orderId;
        this.userEmail = userEmail;
        this.action = action;
        this.totalAmount = totalAmount;
        this.status = status;
        this.details = details;
        this.eventTime = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }
    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }
    public LocalDateTime getEventTime() { return eventTime; }
    public void setEventTime(LocalDateTime eventTime) { this.eventTime = eventTime; }
}

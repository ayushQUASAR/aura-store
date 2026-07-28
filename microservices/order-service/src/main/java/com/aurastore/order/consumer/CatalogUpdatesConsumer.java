package com.aurastore.order.consumer;

import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class CatalogUpdatesConsumer {

    @KafkaListener(topics = "catalog-updates", groupId = "order-group")
    public void consumeCatalogUpdate(ConsumerRecord<String, String> record) {
        System.out.printf("Received catalog event payload in Order Service. Key: %s, Value: %s%n", 
                record.key(), record.value());
        
        // This simulates a real microservice synchronizing catalog items
        // or performing stock checks in its local database copy
        try {
            String event = record.value();
            if (event.contains("DELETED")) {
                System.out.println("Processing product deletion event. Flashing invalid order states...");
            } else if (event.contains("UPDATED")) {
                System.out.println("Processing stock adjustments or catalog price changes...");
            }
        } catch (Exception e) {
            System.err.println("Failed to process consumed Kafka message: " + e.getMessage());
        }
    }
}

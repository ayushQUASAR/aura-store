package com.aurastore.order.consumer;

import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

@ExtendWith(MockitoExtension.class)
class CatalogUpdatesConsumerTest {

    @InjectMocks
    private CatalogUpdatesConsumer consumer;

    @Test
    void consumeCatalogUpdate_withDeleteEvent() {
        ConsumerRecord<String, String> record = new ConsumerRecord<>("catalog-updates", 0, 0, "1", "{\"event\":\"DELETED\"}");
        assertDoesNotThrow(() -> consumer.consumeCatalogUpdate(record));
    }

    @Test
    void consumeCatalogUpdate_withUpdateEvent() {
        ConsumerRecord<String, String> record = new ConsumerRecord<>("catalog-updates", 0, 0, "1", "{\"event\":\"UPDATED\"}");
        assertDoesNotThrow(() -> consumer.consumeCatalogUpdate(record));
    }

    @Test
    void consumeCatalogUpdate_withMalformedMessage() {
        ConsumerRecord<String, String> record = new ConsumerRecord<>("catalog-updates", 0, 0, "1", "not-json");
        assertDoesNotThrow(() -> consumer.consumeCatalogUpdate(record));
    }
}

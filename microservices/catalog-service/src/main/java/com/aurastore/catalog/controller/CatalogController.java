package com.aurastore.catalog.controller;

import com.aurastore.catalog.domain.Product;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategory(String category);
}

@Service
class CatalogService {

    private final ProductRepository productRepository;

    public CatalogService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Cacheable(value = "products", key = "#id")
    public Product getProductById(Long id) {
        return productRepository.findById(id).orElse(null);
    }
}

@RestController
@RequestMapping
public class CatalogController {

    private final ProductRepository productRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final CatalogService catalogService;
    // Custom Prometheus metrics
    private final Counter fetchCounter;
    private final Counter cacheEvictionCounter;
    private final Counter kafkaEventCounter;


    public CatalogController(ProductRepository productRepository, 
                             KafkaTemplate<String, String> kafkaTemplate,
                             MeterRegistry meterRegistry,
                             CatalogService catalogService) {
        this.productRepository = productRepository;
        this.kafkaTemplate = kafkaTemplate;
        this.catalogService = catalogService;


        // Scrape Counters
        this.fetchCounter = Counter.builder("catalog_fetches_total")
                .description("Total number of catalog fetch lookups")
                .register(meterRegistry);

        this.cacheEvictionCounter = Counter.builder("catalog_cache_evictions_total")
                .description("Total Redis cache flushes triggered by mutations")
                .register(meterRegistry);

        this.kafkaEventCounter = Counter.builder("catalog_kafka_published_total")
                .description("Total catalog Kafka events broadcasted to brokers")
                .register(meterRegistry);
    }

    @GetMapping("/products")
    public List<Product> getAllProducts(@RequestParam(required = false) String category) {
        fetchCounter.increment();
        if (category != null && !category.equalsIgnoreCase("All")) {
            return productRepository.findByCategory(category);
        }
        return productRepository.findAll();
    }

    @GetMapping("/categories")
    public List<String> getCategories() {
        return List.of("Electronics", "Apparel", "Home & Living", "Books", "Fitness");
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id) {
        fetchCounter.increment();
        Product product = catalogService.getProductById(id);
        if (product != null) {
            return ResponseEntity.ok(product);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Product not found"));
    }

    @PostMapping("/products")
    @CacheEvict(value = "products", allEntries = true)
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {

        cacheEvictionCounter.increment();

        Product saved = productRepository.save(product);

        
        // Broadcast Event-Driven Kafka updates
        try {
            String kafkaMessage = String.format("{\"id\": %d, \"action\": \"CREATED\", \"name\": \"%s\"}", saved.getId(), saved.getName());
            kafkaTemplate.send("catalog-updates", String.valueOf(saved.getId()), kafkaMessage);
            kafkaEventCounter.increment();
        } catch (Exception e) {
            System.err.println("Failed to dispatch event to Kafka topic: " + e.getMessage());
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/products/{id}")
    @CacheEvict(value = "products", allEntries = true)
    public ResponseEntity<?> updateProduct(
            @PathVariable Long id,
            @RequestBody Product productDetails) {

        cacheEvictionCounter.increment();

        Optional<Product> prodOpt = productRepository.findById(id);

        
        if (prodOpt.isPresent()) {
            Product dbProd = prodOpt.get();
            dbProd.setName(productDetails.getName());
            dbProd.setDescription(productDetails.getDescription());
            dbProd.setPrice(productDetails.getPrice());
            dbProd.setCategory(productDetails.getCategory());
            dbProd.setImageUrl(productDetails.getImageUrl());
            dbProd.setStock(productDetails.getStock());

            Product updated = productRepository.save(dbProd);

            // Kafka Event Dispatch
            try {
                String kafkaMessage = String.format("{\"id\": %d, \"action\": \"UPDATED\", \"stock\": %d}", updated.getId(), updated.getStock());
                kafkaTemplate.send("catalog-updates", String.valueOf(updated.getId()), kafkaMessage);
                kafkaEventCounter.increment();
            } catch (Exception e) {
                System.err.println("Failed to publish to Kafka: " + e.getMessage());
            }

            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Product not found"));
    }

    @DeleteMapping("/products/{id}")
    @CacheEvict(value = "products", allEntries = true)
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {

        cacheEvictionCounter.increment();

        if (productRepository.existsById(id)) {

            productRepository.deleteById(id);

            // Kafka event dispatch
            try {
                String kafkaMessage = String.format("{\"id\": %d, \"action\": \"DELETED\"}", id);
                kafkaTemplate.send("catalog-updates", String.valueOf(id), kafkaMessage);
                kafkaEventCounter.increment();
            } catch (Exception e) {
                System.err.println("Failed to publish deletion to Kafka: " + e.getMessage());
            }

            return ResponseEntity.ok(Map.of("success", true, "message", "Product deleted"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Product not found"));
    }
}

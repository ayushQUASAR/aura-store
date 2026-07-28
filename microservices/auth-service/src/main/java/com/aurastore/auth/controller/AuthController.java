package com.aurastore.auth.controller;

import com.aurastore.auth.domain.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Repository
interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final String JWT_SECRET = "AuraStoreSecretKey2026!SecureJWTToken_HMACSHA256";
    private static final long JWT_EXPIRATION_MS = 86400000L; // 24 hours

    private final UserRepository userRepository;
    private final Counter loginCounter;
    private final Counter registrationCounter;

    public AuthController(UserRepository userRepository, MeterRegistry meterRegistry) {
        this.userRepository = userRepository;

        this.loginCounter = Counter.builder("auth_login_attempts_total")
                .description("Total login requests dispatched to Auth Service")
                .register(meterRegistry);

        this.registrationCounter = Counter.builder("auth_registrations_total")
                .description("Total register requests processed by Auth Service")
                .register(meterRegistry);

    }

    private String generateToken(String email, String role) {
        SecretKey key = Keys.hmacShaKeyFor(JWT_SECRET.getBytes(StandardCharsets.UTF_8));
        Date now = new Date();
        Date expiry = new Date(now.getTime() + JWT_EXPIRATION_MS);

        return Jwts.builder()
                .subject(email)
                .claim("role", role)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(key)
                .compact();
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        registrationCounter.increment();
        String email = request.get("email");
        String name = request.get("name");
        String password = request.get("password");
        String role = request.getOrDefault("role", "CUSTOMER");

        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }
        if (name == null || name.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Name is required"));
        }
        if (password == null || password.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password is required"));
        }
        if (!role.equals("CUSTOMER") && !role.equals("ADMIN")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Role must be CUSTOMER or ADMIN"));
        }

        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already exists"));
        }

        User newUser = new User(email.trim(), name.trim(), password, role);
        userRepository.save(newUser);

        String token = generateToken(email, role);
        Map<String, Object> response = new HashMap<>();
        response.put("user", Map.of("email", email, "name", name, "role", role));
        response.put("token", token);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        loginCounter.increment();
        String email = request.get("email");
        String password = request.get("password");

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent() && userOpt.get().getPassword().equals(password)) {
            User user = userOpt.get();
            String token = generateToken(email, user.getRole());
            Map<String, Object> response = new HashMap<>();
            response.put("user", Map.of(
                    "email", email,
                    "name", user.getName(),
                    "role", user.getRole()
            ));
            response.put("token", token);
            return ResponseEntity.ok(response);
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid credentials"));
    }

}

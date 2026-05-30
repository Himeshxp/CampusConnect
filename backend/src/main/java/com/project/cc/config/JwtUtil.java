package com.project.cc.config;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Date;

@Component
public class JwtUtil {

    // Must be at least 32 chars for HS256
    @Value("${JWT_SECRET}")
    private String secret;

    private Key key;
    private final Map<String, Date> revokedTokens = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() {
        key = Keys.hmacShaKeyFor(secret.getBytes());
    }

    public String generateToken(String email, String role, Integer id) {
        return Jwts.builder()
                .setSubject(email)
                .claim("role", role)
                .claim("id", id)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 12)) // 12 hours
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String extractRole(String token) {
        return extractAllClaims(token).get("role", String.class);
    }

    public Integer extractId(String token) {
        return extractAllClaims(token).get("id", Integer.class);
    }

    public String extractEmail(String token) {
        return extractAllClaims(token).getSubject();
    }

    public Date extractExpiration(String token) {
        return extractAllClaims(token).getExpiration();
    }

    public void revokeToken(String token) {
        try {
            revokedTokens.put(token, extractExpiration(token));
        } catch (Exception ignored) {
            // Ignore malformed tokens during logout.
        }
    }

    public boolean isTokenRevoked(String token) {
        cleanupRevokedTokens();
        Date expiry = revokedTokens.get(token);
        return expiry != null && expiry.after(new Date());
    }

    private void cleanupRevokedTokens() {
        Date now = new Date();
        revokedTokens.entrySet().removeIf(entry -> entry.getValue() == null || !entry.getValue().after(now));
    }

    public boolean validateToken(String token) {
        try {
            extractAllClaims(token);
            return !isTokenRevoked(token);
        } catch (Exception e) {
            return false;
        }
    }
}

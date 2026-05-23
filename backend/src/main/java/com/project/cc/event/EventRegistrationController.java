package com.project.cc.event;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/events/register")
public class EventRegistrationController {

    private EventService eventService;

    public EventRegistrationController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping("/counts")
    public ResponseEntity<?> getRegistrationCounts() {
        return ResponseEntity.ok(eventService.getRegistrationCounts());
    }

    @GetMapping("/student/me")
    public ResponseEntity<?> getMyRegisteredEventIds(HttpServletRequest request) {
        Integer userId = (Integer) request.getAttribute("userId");
        String role = (String) request.getAttribute("role");

        if (userId == null || !"student".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Students only");
        }

        return ResponseEntity.ok(eventService.getMyRegisteredEventIds(userId));
    }

    @PostMapping("/{id}")
    public ResponseEntity<?> registerToEvent(@PathVariable Integer id, HttpServletRequest request) {
        Integer userId = (Integer) request.getAttribute("userId");
        String role = (String) request.getAttribute("role");

        if (userId == null || !"student".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Students only");
        }

        eventService.registerToEvent(id, userId);
        return ResponseEntity.ok(Map.of("success", true, "message", "Registered successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> unregisterFromEvent(@PathVariable Integer id, HttpServletRequest request) {
        Integer userId = (Integer) request.getAttribute("userId");
        String role = (String) request.getAttribute("role");

        if (userId == null || !"student".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Students only");
        }

        eventService.unregisterFromEvent(id, userId);
        return ResponseEntity.ok(Map.of("success", true, "message", "Unregistered successfully"));
    }

    @GetMapping("/{eventId}")
    public ResponseEntity<?> getEventRegistrations(@PathVariable Integer eventId) {
        return ResponseEntity.ok(eventService.getEventRegistrations(eventId));
    }
}

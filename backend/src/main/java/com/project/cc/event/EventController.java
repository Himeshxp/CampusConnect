package com.project.cc.event;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @PostMapping("/add")
    public ResponseEntity<?> addEvent(@Valid @RequestBody EventRequestDTO event, HttpServletRequest request) {
        String role = (String) request.getAttribute("role");
        Integer userId = (Integer) request.getAttribute("userId");
        if (userId == null || !"staff".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Only staff can add events");
        }
        return ResponseEntity.ok(eventService.addEvent(event));
    }

    @GetMapping("/all")
    public ResponseEntity<List<Event>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getEventById(@PathVariable Integer id) {
        return ResponseEntity.ok(eventService.getEventById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEventById(@PathVariable Integer id, HttpServletRequest request) {
        String role = (String) request.getAttribute("role");
        if (!"staff".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Only staff can delete events");
        }
        eventService.deleteEventById(id);
        return ResponseEntity.ok("Event deleted successfully");
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateEvent(
            @PathVariable Integer id,
            @Valid @RequestBody EventRequestDTO eventData,
            HttpServletRequest request
    ) {
        String role = (String) request.getAttribute("role");
        Integer userId = (Integer) request.getAttribute("userId");
        if (userId == null || !"staff".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Only staff can update events");
        }
        return ResponseEntity.ok(eventService.updateEvent(id, eventData));
    }
}

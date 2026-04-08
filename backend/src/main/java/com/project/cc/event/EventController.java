package com.project.cc.event;

import jakarta.servlet.http.HttpSession;
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

    // CREATE EVENT (should be staff only)
    @PostMapping("/add")
    public ResponseEntity<?> addEvent(@RequestBody Event event, HttpSession session) {
        String role = (String) session.getAttribute("role");
        if (!"staff".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Only staff can add events");
        }
        return ResponseEntity.ok(eventService.addEvent(event));
    }

    // GET ALL EVENTS
    @GetMapping("/all")
    public ResponseEntity<List<Event>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    // GET EVENT BY ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getEventById(@PathVariable Integer id) {
        return ResponseEntity.ok(eventService.getEventById(id));
    }

    // DELETE EVENT (staff only)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEventById(@PathVariable Integer id, HttpSession session) {

        String role = (String) session.getAttribute("role");

        if (!"staff".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Only staff can delete events");
        }

        eventService.deleteEventById(id);
        return ResponseEntity.ok("Event deleted successfully");
    }

    // UPDATE EVENT (staff only)
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateEvent(
            @PathVariable Integer id,
            @RequestBody Event eventData,
            HttpSession session
    ) {
        String role = (String) session.getAttribute("role");

        if (!"staff".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Only staff can update events");
        }

        return ResponseEntity.ok(eventService.updateEvent(id, eventData));
    }
}
package com.project.cc.event;

import com.project.cc.student.Student;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/events/register")
public class EventRegistrationController {

    private EventService eventService;


    public EventRegistrationController(EventService eventService) {
        this.eventService = eventService;
    }

// Count of registrations
    @GetMapping("/counts")
    public ResponseEntity<?> getRegistrationCounts() {
       return eventService.getRegistrationCounts();

    }

    // GET EVENTS CURRENT STUDENT REGISTERED IN
    @GetMapping("/student/me")
    public ResponseEntity<?> getMyRegisteredEventIds(HttpSession request) {
        return eventService.getMyRegisteredEventIds(request);
    }


    @PostMapping("/{id}")
    public ResponseEntity<?> registerToEvent(@PathVariable Integer id, HttpSession request) {
        return eventService.registerToEvent(id, request);
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<?> unregisterFromEvent(@PathVariable Integer id, HttpSession request) {
        return eventService.unregisterFromEvent(id, request);
    }


    @GetMapping("/{eventId}")
    public ResponseEntity<?> getEventRegistrations(@PathVariable Integer eventId) {
        return eventService.getEventRegistrations(eventId);
    }
}

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
    @Autowired
    private EventRegistrationRepo eventRegistrationRepo;

    @Autowired
    private EventRepo eventRepo;

    public EventRegistrationController(EventRegistrationRepo eventRegistrationRepo, EventRepo eventRepo) {
        this.eventRegistrationRepo = eventRegistrationRepo;
        this.eventRepo = eventRepo;
    }

    /**
     * GET /api/events/register/counts - returns { "eventId": count, ... } (public)
     */
    @GetMapping("/counts")
    public ResponseEntity<Map<String, Integer>> getRegistrationCounts() {
        List<Object[]> rows = eventRegistrationRepo.countRegistrationsGroupByEvent();
        Map<String, Integer> counts = new HashMap<>();
        for (Object[] row : rows) {
            Integer eventId = (Integer) row[0];
            Long count = (Long) row[1];
            counts.put(String.valueOf(eventId), count != null ? count.intValue() : 0);
        }
        return ResponseEntity.ok(counts);
    }

    /**
     * GET /api/events/register/student/me - returns [eventId, ...] for current student. 401 if not student.
     */
    @GetMapping("/student/me")
    public ResponseEntity<?> getMyRegisteredEventIds(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("success", false, "message", "Not logged in"));
        }
        Object user = session.getAttribute("user");
        Object roleObj = session.getAttribute("role");
        if (user == null || !"student".equals(roleObj)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("success", false, "message", "Students only"));
        }
        Student student = (Student) user;
        List<EventRegistration> list = eventRegistrationRepo.findByStudentId(student.getId());
        List<Integer> eventIds = list.stream().map(EventRegistration::getEventId).distinct().toList();
        return ResponseEntity.ok(eventIds);
    }

    /**
     * POST /api/events/register/{id} - register current student for event
     */
    @PostMapping("/{id}")
    public ResponseEntity<?> registerToEvent(@PathVariable Integer id, HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("success", false, "message", "Not logged in"));
        }
        Object user = session.getAttribute("user");
        Object roleObj = session.getAttribute("role");
        if (user == null || !"student".equals(roleObj)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("success", false, "message", "Students only"));
        }
        Student student = (Student) user;
        Event event = eventRepo.findById(id).orElse(null);
        if (event == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Event not found"));
        }
        if (eventRegistrationRepo.findByEventIdAndStudentId(id, student.getId()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("success", false, "message", "Already registered for this event"));
        }
        EventRegistration reg = new EventRegistration();
        reg.setEventId(event.getId());
        reg.setEventName(event.getEventName());
        reg.setStudentId(student.getId());
        String fname = student.getFirstName() != null ? student.getFirstName() : "";
        String lname = student.getLastName() != null ? student.getLastName() : "";
        reg.setStudentName((fname + " " + lname).trim());
        reg.setEmail(student.getEmail() != null ? student.getEmail() : "");
        eventRegistrationRepo.save(reg);
        return ResponseEntity.ok(Map.of("success", true, "message", "Registered successfully"));
    }

    /**
     * DELETE /api/events/register/{id} - unregister current student from event
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> unregisterFromEvent(@PathVariable Integer id, HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("success", false, "message", "Not logged in"));
        }
        Object user = session.getAttribute("user");
        Object roleObj = session.getAttribute("role");
        if (user == null || !"student".equals(roleObj)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("success", false, "message", "Students only"));
        }
        Student student = (Student) user;
        Optional<EventRegistration> opt = eventRegistrationRepo.findByEventIdAndStudentId(id, student.getId());
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Not registered for this event"));
        }
        eventRegistrationRepo.delete(opt.get());
        return ResponseEntity.ok(Map.of("success", true, "message", "Unregistered successfully"));
    }

    /**
     * GET /api/events/register/{eventId} - list registrations for an event (e.g. for staff)
     */
    @GetMapping("/{eventId}")
    public List<EventRegistration> getEventRegistrations(@PathVariable Integer eventId) {
        return eventRegistrationRepo.findByEventId(eventId);
    }
}

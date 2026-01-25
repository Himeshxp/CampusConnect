package com.project.cc.event;

import com.project.cc.student.Student;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class EventService {

    private final EventRepo eventRepo;
    private final EventRegistrationRepo eventRegistrationRepo;

    public EventService(EventRepo eventRepo, EventRegistrationRepo eventRegistrationRepo) {
        this.eventRepo = eventRepo;
        this.eventRegistrationRepo = eventRegistrationRepo;
    }

    // =================================================
    // ADDING EVENT
    // =================================================
    public ResponseEntity<?> addEvent( Event event){
        Event saved=eventRepo.save(event);
        return new ResponseEntity<>(saved, HttpStatus.OK);
    }

    public ResponseEntity<?> getEventById( Integer id)
    {
        return eventRepo.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(null));
    }

    public ResponseEntity<?> deleteEventById( Integer id)
    {
        if(!eventRepo.existsById(id))
        {
            return ResponseEntity.notFound().build();
        }
        eventRepo.deleteById(id);
        return ResponseEntity.ok("Event deleted successfully");
    }
    // =================================================
    // Getting all events
    // =================================================
    public List<Event> getAllEvents()
    {
        return eventRepo.findAll();
    }
    // =================================================
    // UNREGISTER FROM EVENT
    // =================================================
    public ResponseEntity<?> unregisterFromEvent(Integer eventId, HttpSession session) {

        if (session == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Not logged in"));
        }

        Object userObj = session.getAttribute("user");
        String role = (String) session.getAttribute("role");

        if (userObj == null || !"student".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Students only"));
        }

        Student student = (Student) userObj;

        Optional<EventRegistration> opt =
                eventRegistrationRepo.findByEventIdAndStudentId(eventId, student.getId());

        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "Not registered for this event"));
        }

        eventRegistrationRepo.delete(opt.get());

        return ResponseEntity.ok(Map.of("success", true, "message", "Unregistered successfully"));
    }


    // =================================================
    // REGISTER FOR EVENT
    // =================================================
    public ResponseEntity<?> registerToEvent(Integer eventId, HttpSession session) {

        if (session == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Not logged in"));
        }

        Object userObj = session.getAttribute("user");
        String role = (String) session.getAttribute("role");

        if (userObj == null || !"student".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Students only"));
        }

        Student student = (Student) userObj;

        Event event = eventRepo.findById(eventId).orElse(null);
        if (event == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "Event not found"));
        }

        if (eventRegistrationRepo.findByEventIdAndStudentId(eventId, student.getId()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("success", false, "message", "Already registered for this event"));
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


    // =================================================
    // GET MY REGISTERED EVENT IDs
    // =================================================
    public ResponseEntity<?> getMyRegisteredEventIds(HttpSession session) {

        if (session == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Not logged in"));
        }

        Object userObj = session.getAttribute("user");
        String role = (String) session.getAttribute("role");

        if (userObj == null || !"student".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Students only"));
        }

        Student student = (Student) userObj;

        List<EventRegistration> list = eventRegistrationRepo.findByStudentId(student.getId());

        List<Integer> eventIds = list.stream()
                .map(EventRegistration::getEventId)
                .distinct()
                .toList();

        return ResponseEntity.ok(eventIds);
    }


    // =================================================
    // GET REGISTRATION COUNTS GROUPED BY EVENT
    // =================================================
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


    // =================================================
    // GET ALL REGISTRATIONS OF AN EVENT
    // =================================================
    public ResponseEntity<?> getEventRegistrations(Integer eventId) {
        return ResponseEntity.ok(eventRegistrationRepo.findByEventId(eventId));
    }

    public ResponseEntity<?> updateEvent( Integer id, Event eventdata)
    {
        return eventRepo.findById(id).map(event ->{
            //updating the fields
            event.setEventName(eventdata.getEventName());
            event.setEventDescription(eventdata.getEventDescription());
            event.setEventDate(eventdata.getEventDate());
            Event updated=eventRepo.save(event);
            return ResponseEntity.ok(updated);

        }).orElse(ResponseEntity.status(404).body(null));
    }
}

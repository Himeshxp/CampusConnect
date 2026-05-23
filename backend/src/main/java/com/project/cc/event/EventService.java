package com.project.cc.event;

import com.project.cc.student.Student;
import com.project.cc.student.StudentRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EventService {
    private final EventRepo eventRepo;
    private final EventRegistrationRepo eventRegistrationRepo;
    private final StudentRepository studentRepository;

    public EventService(EventRepo eventRepo, EventRegistrationRepo eventRegistrationRepo, StudentRepository studentRepository) {
        this.eventRepo = eventRepo;
        this.eventRegistrationRepo = eventRegistrationRepo;
        this.studentRepository = studentRepository;
    }

    // =================================================
    //  EVENT ENDPOINTS
    // =================================================
    public Event addEvent(Event event) {
        return eventRepo.save(event);
    }

    public Event getEventById(Integer id) {
        return eventRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found: " + id));
    }

    public Event updateEvent(Integer id, Event eventData) {
        Event event = eventRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        event.setEventName(eventData.getEventName());
        event.setEventDescription(eventData.getEventDescription());
        event.setEventDate(eventData.getEventDate());
        return eventRepo.save(event);
    }

    public void deleteEventById(Integer id) {
        // Delete all registrations for this event first to avoid FK constraint violation
        List<EventRegistration> registrations = eventRegistrationRepo.findByEventId(id);
        eventRegistrationRepo.deleteAll(registrations);
        eventRepo.deleteById(id);
    }

    public List<Event> getAllEvents() {
        return eventRepo.findAll();
    }

    private Student getStudentById(Integer studentId) {
        return studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
    }

    // =================================================
    // REGISTER FOR EVENT
    // =================================================
    public void registerToEvent(Integer eventId, Integer studentId) {
        Student student = getStudentById(studentId);
        Event event = eventRepo.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        boolean alreadyRegistered = eventRegistrationRepo
                .findByEventIdAndStudentId(eventId, student.getId()).isPresent();

        if (alreadyRegistered) {
            throw new IllegalStateException("Already registered for this event");
        }

        EventRegistration reg = new EventRegistration();
        reg.setEventId(eventId);
        reg.setEventName(event.getEventName());
        reg.setStudentId(student.getId());
        String fname = student.getFirstName() != null ? student.getFirstName() : "";
        String lname = student.getLastName() != null ? student.getLastName() : "";
        reg.setStudentName((fname + " " + lname).trim());
        eventRegistrationRepo.save(reg);
    }

    // =================================================
    // UNREGISTER FROM EVENT
    // =================================================
    public void unregisterFromEvent(Integer eventId, Integer studentId) {
        EventRegistration reg = eventRegistrationRepo
                .findByEventIdAndStudentId(eventId, studentId)
                .orElseThrow(() -> new RuntimeException("Registration not found"));
        eventRegistrationRepo.delete(reg);
    }

    // =================================================
    // GET MY REGISTERED EVENT IDs
    // =================================================
    public List<Integer> getMyRegisteredEventIds(Integer studentId) {
        return eventRegistrationRepo.findByStudentId(studentId)
                .stream()
                .map(EventRegistration::getEventId)
                .distinct()
                .toList();
    }

    // =================================================
    // GET REGISTRATION COUNTS GROUPED BY EVENT
    // =================================================
    public Map<String, Integer> getRegistrationCounts() {
        List<Object[]> rows = eventRegistrationRepo.countRegistrationsGroupByEvent();
        Map<String, Integer> counts = new HashMap<>();
        for (Object[] row : rows) {
            Integer eventId = (Integer) row[0];
            Long count = (Long) row[1];
            counts.put(String.valueOf(eventId), count != null ? count.intValue() : 0);
        }
        return counts;
    }

    // =================================================
    // GET ALL REGISTRATIONS OF AN EVENT
    // =================================================
    public List<EventRegistration> getEventRegistrations(Integer eventId) {
        return eventRegistrationRepo.findByEventId(eventId).stream().toList();
    }
}

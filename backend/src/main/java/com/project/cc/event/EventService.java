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
    //  EVENT ENDPOINTS
    // =================================================
    public Event addEvent( Event event){
        return eventRepo.save(event);
    }

    public Event getEventById( Integer id)
    {
        return eventRepo.findById(id).orElseThrow(()-> new RuntimeException("event not found of id : "+ " " + id));
    }
    public Event updateEvent(Integer id, Event eventData) {
        Event event = eventRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        event.setEventName(eventData.getEventName());
        event.setEventDescription(eventData.getEventDescription());
        event.setEventDate(eventData.getEventDate());

        return eventRepo.save(event);
    }
    public void deleteEventById( Integer id)
    {
    eventRepo.deleteById(id);
    }
    // =================================================
    // Getting all events
    // =================================================
    public List<Event> getAllEvents()
    {
        return eventRepo.findAll();
    }
    //Log-in session

    private Student getLoggedInStudent(HttpSession session) {
        if (session == null) {
            throw new RuntimeException("Not logged in");
        }

        Object userObj = session.getAttribute("user");
        String role = (String) session.getAttribute("role");

        if (userObj == null || !"student".equalsIgnoreCase(role)) {
            throw new RuntimeException("Students only");
        }

        return (Student) userObj;
    }

    // =================================================
    // REGISTER FOR EVENT
    // =================================================
    public void registerToEvent(Integer eventId, HttpSession session) {
        Student student = getLoggedInStudent(session);
        Event event=eventRepo.findById(eventId).orElseThrow(()-> new RuntimeException("Event not found"));

        boolean alreadyregistered=eventRegistrationRepo
                .findByEventIdAndStudentId(eventId,student.getId()).isPresent();

       if (alreadyregistered) {
           throw new RuntimeException("Already registered");
       }
       EventRegistration reg=new EventRegistration();
       reg.setEventId(eventId);
       reg.setEventName(event.getEventName());
       reg.setStudentId(student.getId());
       String fname = student.getFirstName() != null ? student.getFirstName() : "";
       String lname = student.getLastName() != null ? student.getLastName() : "";
       reg.setStudentName((fname+" "+lname).trim());
       eventRegistrationRepo.save(reg);
    }

    // =================================================
    // UNREGISTER FROM EVENT
    // =================================================
    public void unregisterFromEvent(Integer eventId, HttpSession session) {
        Student student = getLoggedInStudent(session);
        EventRegistration reg=eventRegistrationRepo
                .findByEventIdAndStudentId(eventId,student.getId()).orElseThrow(()-> new RuntimeException("Event not found"));
        eventRegistrationRepo.delete(reg);
    }


    // =================================================
    // GET MY REGISTERED EVENT IDs
    // =================================================
    public List<Integer> getMyRegisteredEventIds(HttpSession session) {
        Student student = getLoggedInStudent(session);

        return eventRegistrationRepo.findByEventId(student.getId())
                .stream()
                .map(EventRegistration::getEventId)
                .distinct().toList();
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

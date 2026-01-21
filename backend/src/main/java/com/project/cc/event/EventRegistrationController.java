package com.project.cc.event;

import com.project.cc.student.Student;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    //Registering logged-in student

    @PostMapping("/{id}")
    public ResponseEntity<?> registertoevent(@PathVariable Integer id, HttpServletRequest session) {
        // Check login
        Object user=session.getAttribute("user");
        String role=(String)session.getAttribute("role");

        if(user==null){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        //Finding the event and creating the student
        Student student = (Student)user;
        Event event= eventRepo.findById(id).orElse(null);
        if(event==null){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        //Create Registration Object

        EventRegistration reg=new EventRegistration();
        reg.setEventId(event.getId());
        reg.setEventName(event.getEventName());

        reg.setStudentId(student.getId());
        reg.setStudentName(student.getFirstName()+" "+student.getLastName());
        reg.getEmail(student.getEmail());

        return ResponseEntity.ok("Student Registered successfully");
    }

    @GetMapping("/{eventId}")
    public List<EventRegistration> getEventRegistrations(@PathVariable Integer eventId) {
        return eventRegistrationRepo.findByEventId(eventId);
    }
}

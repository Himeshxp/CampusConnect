package com.project.cc.event;


import com.project.cc.complaint.ComplaintService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {
    @Autowired
    private EventRepo eventrepo;
    @Autowired
    private ComplaintService complaintService;


    public EventController(EventRepo eventrepo) {
        this.eventrepo = eventrepo;
    }

    //creating event
    @PostMapping("/add")
    private ResponseEntity<?> addEvent(@RequestBody Event event){
      Event saved=eventrepo.save(event);
      return new ResponseEntity<>(saved, HttpStatus.OK);
    }

    //fetching events
    @GetMapping("/all")
    private List<Event> getAllEvents()
    {
        return eventrepo.findAll();
    }

    //fetching by id
    @GetMapping("/{id}")
    private ResponseEntity<?> getEventById(@PathVariable Integer id)
    {
        return eventrepo.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(null));
    }

    //deleting by id
    @DeleteMapping("/{id}")
    private ResponseEntity<?> deleteEventById(@PathVariable Integer id)
    {
        if(!eventrepo.existsById(id))
        {
            return ResponseEntity.notFound().build();
        }
        eventrepo.deleteById(id);
        return ResponseEntity.ok("Event deleted successfully");
    }

    // EDIT/UPDATE EVENT
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateEvent(@PathVariable Integer id, @RequestBody Event eventdata)
    {
        return eventrepo.findById(id).map(event ->{
            //updating the fields
            event.setEventName(eventdata.getEventName());
            event.setEventDescription(eventdata.getEventDescription());
            event.setEventDate(eventdata.getEventDate());
            Event updated=eventrepo.save(event);
            return ResponseEntity.ok(updated);

        }).orElse(ResponseEntity.status(404).body(null));
    }



}

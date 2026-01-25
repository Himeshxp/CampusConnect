package com.project.cc.event;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    //creating event
    @PostMapping("/add")
   public ResponseEntity<?> addEvent(@RequestBody Event event){
   return eventService.addEvent(event);
    }

    //fetching events
    @GetMapping("/all")
    public List<?> getAllEvents()
    {
        return eventService.getAllEvents();
    }

    //fetching by id
    @GetMapping("/{id}")
    public ResponseEntity<?> getEventById(@PathVariable Integer id)
    {
        return eventService.getEventById(id);
    }

    //deleting by id
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEventById(@PathVariable Integer id) {
        return eventService.deleteEventById(id);
    }
    // EDIT/UPDATE EVENT
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateEvent(@PathVariable Integer id, @RequestBody Event eventdata) {
        return eventService.updateEvent(id, eventdata);
    }



}

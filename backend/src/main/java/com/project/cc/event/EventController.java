package com.project.cc.event;


import com.project.cc.complaint.ComplaintService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class EventController {
    @Autowired
    private EventService eventService;
    @Autowired
    private ComplaintService complaintService;
}

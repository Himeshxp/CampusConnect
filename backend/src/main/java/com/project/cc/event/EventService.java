package com.project.cc.event;

import org.springframework.stereotype.Service;

@Service
public class EventService {
    private EventRepo eventRepo;
    public EventService(EventRepo eventRepo) {
        this.eventRepo = eventRepo;
    }
}

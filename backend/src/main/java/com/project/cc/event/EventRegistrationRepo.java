package com.project.cc.event;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventRegistrationRepo extends JpaRepository<EventRegistration, Integer> {
    Integer countByEventId(Integer eventId);
    List<EventRegistration> findByEventId(Integer eventId);
}

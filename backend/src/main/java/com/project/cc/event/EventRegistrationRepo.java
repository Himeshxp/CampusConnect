package com.project.cc.event;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventRegistrationRepo extends JpaRepository<EventRegistration, Integer> {
    Integer countByEventId(Integer eventId);
    List<EventRegistration> findByEventId(Integer eventId);
    List<EventRegistration> findByStudentId(Integer studentId);
    Optional<EventRegistration> findByEventIdAndStudentId(Integer eventId, Integer studentId);

    @Query("SELECT r.eventId, COUNT(r) FROM EventRegistration r GROUP BY r.eventId")
    List<Object[]> countRegistrationsGroupByEvent();
}

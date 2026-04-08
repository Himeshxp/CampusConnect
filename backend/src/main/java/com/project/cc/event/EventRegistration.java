package com.project.cc.event;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
@AllArgsConstructor
@Entity
public class EventRegistration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer registrationId;
    private Integer eventId;
    private String eventName;


    private Integer studentId;
    private String studentName;
    private String email;

    public EventRegistration() {
    }

}

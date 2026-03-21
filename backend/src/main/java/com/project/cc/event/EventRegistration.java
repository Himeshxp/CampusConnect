package com.project.cc.event;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
@Entity
public class EventRegistration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    //Event info
    private Integer eventId;
    private String eventName;

    //Registered student info

    private Integer studentId;
    private String studentName;
    private String email;

    public EventRegistration() {
    }

}

package com.project.cc.event;

import com.project.cc.student.Student;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class EventRegistration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    //foreign keys here
    @ManyToOne
    private Student student;

    @ManyToOne
    private Event event;



}

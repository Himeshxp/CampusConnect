package com.project.cc.student;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class StudentController {
    private final StudentRepository studentrepository;
    public StudentController(StudentRepository studentrepository) {
        this.studentrepository = studentrepository;
    }


}

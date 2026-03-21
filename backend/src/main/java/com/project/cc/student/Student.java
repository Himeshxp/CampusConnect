package com.project.cc.student;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.*;

@Data
@AllArgsConstructor
@Entity
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String firstName;
    private String lastName;

    private String email;
    private String password;
    // TODO: SECURITY BUG - Passwords should be hashed using BCrypt or similar
    // Current implementation stores passwords in plain text which is a major security vulnerability
    private String role = "STUDENT";

    public Student(String firstName, String lastName, String email, String password, String role) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
    }

    public Student() {
    }
}


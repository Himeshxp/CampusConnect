package com.project.cc.student;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;


public interface StudentRepository extends JpaRepository<Student, Integer> {
   Student findByEmail(String email);
}

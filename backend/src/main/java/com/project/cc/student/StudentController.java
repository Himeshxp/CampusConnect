package com.project.cc.student;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;



import java.util.List;
import java.util.Optional;

@RestController
@Validated
@RequestMapping("/api/student")
public class StudentController {
    private StudentService studentService;
    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @PostMapping("/add")
    public ResponseEntity<StudentResponseDTO> addStudent( @Valid @RequestBody CreateStudentRequestDTO student)
    {
        return ResponseEntity.ok(studentService.addStudent(student));
    }

    @GetMapping("/all")
    public  List<StudentResponseDTO> getStudents(){
       return  studentService.getStudents();
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudentResponseDTO> getStudentById(@PathVariable Integer id) {
            return ResponseEntity.ok(studentService.getStudentById(id));
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudentById(@PathVariable Integer id) {
           studentService.deleteStudentById(id);
           return ResponseEntity.noContent().build();
       }
    }

package com.project.cc.student;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/student")
public class StudentController {
    @Autowired
    private final StudentRepository studentrepository;
    public StudentController(StudentRepository studentrepository) {
        this.studentrepository = studentrepository;
    }

    @PostMapping("/add")
    private Student addStudent(@RequestBody Student student)
    {
         return studentrepository.save(student);
    }

    @GetMapping("/all")
    public  List<Student> getStudents(){
       return  studentrepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getStudentById(@PathVariable Integer id){
        return studentrepository.findById(id)
                .map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStudentById(@PathVariable Integer id){
        if(!studentrepository.existsById(id)){
            return ResponseEntity.notFound().build();
        }
        studentrepository.deleteById(id);
        return ResponseEntity.ok("Student has been deleted");
    }


}

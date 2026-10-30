package com.project.cc.admin;

import com.project.cc.staff.CreateStaffRequestDTO;
import com.project.cc.staff.StaffResponseDTO;
import com.project.cc.staff.StaffService;
import com.project.cc.student.CreateStudentRequestDTO;
import com.project.cc.student.StudentResponseDTO;
import com.project.cc.student.StudentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final StudentService studentService;
    private final StaffService staffService;

    public AdminController(StudentService studentService, StaffService staffService) {
        this.studentService = studentService;
        this.staffService = staffService;
    }
    @PostMapping({"/students/add", "/student/add"})
    public ResponseEntity<StudentResponseDTO> addStudent(@Valid @RequestBody CreateStudentRequestDTO student) {
        return ResponseEntity.ok(studentService.addStudent(student));
    }

    @PostMapping("/staff/add")
    public ResponseEntity<StaffResponseDTO> addStaff(@Valid @RequestBody CreateStaffRequestDTO staff) {
        return ResponseEntity.ok(staffService.addStaff(staff));
    }
    @DeleteMapping("/student/{id}")
    public ResponseEntity<Void> deleteStudentById(@PathVariable Integer id) {
        studentService.deleteStudentById(id);
        return ResponseEntity.noContent().build();
    }
    @DeleteMapping("/staff/{id}")
    public ResponseEntity<Void> deleteStaff(@PathVariable Integer id) {
        staffService.deleteStaff(id);
        return ResponseEntity.noContent().build();
    }
    @GetMapping("staff/all")
    public List<StaffResponseDTO> getAllStaff() {
        return staffService.getAllStaff();
    }

    @GetMapping("student/all")
    public List<StudentResponseDTO> getAllStudent() {
        return studentService.getStudents();
    }
    @GetMapping("/staff/{id}")
    public ResponseEntity<StaffResponseDTO> getStaffById(@PathVariable Integer id) {
        return ResponseEntity.ok(staffService.getStaffById(id));
    }
    @GetMapping("/student/{id}")
    public ResponseEntity<StudentResponseDTO> getStudentById(@PathVariable Integer id) {
        return ResponseEntity.ok(studentService.getStudentById(id));
    }

}

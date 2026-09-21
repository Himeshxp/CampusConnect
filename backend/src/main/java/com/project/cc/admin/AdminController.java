package com.project.cc.admin;

import com.project.cc.staff.CreateStaffRequestDTO;
import com.project.cc.staff.StaffResponseDTO;
import com.project.cc.staff.StaffService;
import com.project.cc.student.CreateStudentRequestDTO;
import com.project.cc.student.StudentResponseDTO;
import com.project.cc.student.StudentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final StudentService studentService;
    private final StaffService staffService;

    public AdminController(StudentService studentService, StaffService staffService) {
        this.studentService = studentService;
        this.staffService = staffService;
    }
    @PostMapping({"/students", "/student"})
    public ResponseEntity<StudentResponseDTO> addStudent(@Valid @RequestBody CreateStudentRequestDTO student) {
        return ResponseEntity.ok(studentService.addStudent(student));
    }

    @PostMapping("/staff")
    public ResponseEntity<StaffResponseDTO> addStaff(@Valid @RequestBody CreateStaffRequestDTO staff) {
        return ResponseEntity.ok(staffService.addStaff(staff));
    }
}

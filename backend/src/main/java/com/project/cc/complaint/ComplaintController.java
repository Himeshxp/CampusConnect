package com.project.cc.complaint;

import com.project.cc.exception.ResourceNotFoundException;
import com.project.cc.student.Student;
import com.project.cc.student.StudentRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/complaint")
public class ComplaintController {

    private final ComplaintService complaintService;
    private final StudentRepository studentRepository;

    public ComplaintController(ComplaintService complaintService, StudentRepository studentRepository) {
        this.complaintService = complaintService;
        this.studentRepository = studentRepository;
    }

    // ADD COMPLAINT
    @PostMapping("/add")
    public ResponseEntity<?> addComplaint(
            @RequestBody ComplaintRequestDTO dto,
            HttpServletRequest request
    ) {
        String role = (String) request.getAttribute("role");
        Integer userId = (Integer) request.getAttribute("userId");

        if (userId == null || !"student".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Only students can add complaints");
        }

        Student student = studentRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        return ResponseEntity.ok(complaintService.addComplaint(dto, student));
    }

    // MY COMPLAINTS
    @GetMapping("/mycomplaints")
    public ResponseEntity<?> getMyComplaints(HttpServletRequest request) {
        String role = (String) request.getAttribute("role");
        Integer userId = (Integer) request.getAttribute("userId");

        if (userId == null || !"student".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Only students can view complaints");
        }

        return ResponseEntity.ok(complaintService.getMyComplaints(userId));
    }

    // ALL COMPLAINTS (staff)
    @GetMapping("/all")
    public ResponseEntity<?> getAll(HttpServletRequest request) {
        String role = (String) request.getAttribute("role");

        if (!"staff".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Only staff can view all complaints");
        }

        return ResponseEntity.ok(complaintService.getAll());
    }

    // UPDATE STATUS
    @PostMapping("/status/{id}")
    public ResponseEntity<?> updateStatus(
            @PathVariable Integer id,
            @RequestBody StatusUpdateRequest request2,
            HttpServletRequest request
    ) {
        String role = (String) request.getAttribute("role");

        if (!"staff".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Only staff can update status");
        }

        complaintService.updateStatus(id, request2.getStatus());
        return ResponseEntity.ok("Status updated successfully");
    }

    @DeleteMapping("/mycomplaints/{id}")
    public ResponseEntity<?> deleteComplaint(HttpServletRequest request, @PathVariable Integer id) {
        String role = (String) request.getAttribute("role");
        Integer userId = (Integer) request.getAttribute("userId");

        if (!"student".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Only students can delete complaints");
        }

        complaintService.deleteComplaint(userId, id);
        return ResponseEntity.noContent().build();
    }
}


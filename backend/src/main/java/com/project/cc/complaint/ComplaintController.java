package com.project.cc.complaint;

import com.project.cc.student.Student;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/complaint")
public class ComplaintController {

    private final ComplaintService complaintService;

    public ComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    // ADD COMPLAINT
    @PostMapping("/add")
    public ResponseEntity<?> addComplaint(
            @RequestBody ComplaintRequestDTO dto,
            HttpSession session
    ) {
        Object userObj = session.getAttribute("user");
        String role = (String) session.getAttribute("role");

        if (userObj == null || !"student".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Only students can add complaints");
        }

        Student student = (Student) userObj;
        return ResponseEntity.ok(complaintService.addComplaint(dto, student));
    }

    // MY COMPLAINTS
    @GetMapping("/mycomplaints")
    public ResponseEntity<?> getMyComplaints(HttpSession session) {
        Object userObj = session.getAttribute("user");
        String role = (String) session.getAttribute("role");

        if (userObj == null || !"student".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Only students can view complaints");
        }

        Student student = (Student) userObj;
        return ResponseEntity.ok(complaintService.getMyComplaints(student));
    }

    // ALL COMPLAINTS (staff)
    @GetMapping("/all")
    public ResponseEntity<?> getAll(HttpSession session) {
        String role = (String) session.getAttribute("role");

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
            @RequestBody StatusUpdateRequest request,
            HttpSession session
    ) {
        String role = (String) session.getAttribute("role");

        if (!"staff".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Only staff can update status");
        }

        complaintService.updateStatus(id, request.getStatus());
        return ResponseEntity.ok("Status updated successfully");
    }
}


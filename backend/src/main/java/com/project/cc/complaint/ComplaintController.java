package com.project.cc.complaint;

import com.project.cc.ComplaintStatus;
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
    @Autowired
    private ComplaintRepo complaintRepo;
    public ComplaintController(ComplaintRepo complaintRepo) {
        this.complaintRepo = complaintRepo;
    }
    // ADDING COMPLAINTS
    @PostMapping("/add")
    public ResponseEntity<?> addComplaint(
        @RequestParam String title,
        @RequestParam String category,
        @RequestParam String description,
                HttpSession session){
        Object userObj = session.getAttribute("user");
        String role = (String) session.getAttribute("role");
        if (userObj == null || !"student".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Only logged-in students can file complaints");
        }
        Student student = (Student) userObj;
        Complaints complaint = new Complaints();
        complaint.setTitle(title);
        complaint.setCategory(category);
        complaint.setDescription(description);
        complaint.setStudent(student);
        complaintRepo.save(complaint);
        return ResponseEntity.ok("Complaint has been added successfully");
    }
    @GetMapping("/mycomplaints")
    public ResponseEntity<?> getMyComplaints(HttpSession session){
        Object userObj = session.getAttribute("user");
        String role = (String) session.getAttribute("role");
        if (userObj == null || !"student".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Only logged-in students can file complaints");
        }
        Student student = (Student) userObj;
        return ResponseEntity.ok(complaintRepo.findByStudent_Id(student.getId()));
    }
    // ALL COMPLAINTS
    @GetMapping("/all")
    public List<Complaints> getAll(){
        return complaintRepo.findAll();
    }
    // UPDATE STATUS
    @PostMapping("/status/{id}")
    public ResponseEntity<?> updateStatus(
            @PathVariable Integer id,
            @RequestParam ComplaintStatus complaintStatus,
            HttpSession session
    ){
        Object userObj = session.getAttribute("user");
        String role = (String) session.getAttribute("role");
        if (userObj == null || !"student".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Only staff can update complaint status");
        }
        Complaints complaint = complaintRepo.findById(id).orElse(null);
        if(complaint==null){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Complaint not found");
        }
        complaint.setComplaintStatus(complaintStatus);
        complaintRepo.save(complaint);
        return ResponseEntity.ok("Complaint has been updated successfully");

    }
}


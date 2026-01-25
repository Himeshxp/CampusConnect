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

    // ADDING COMPLAINTS
    @PostMapping("/add")
    public ResponseEntity<?> addComplaint(@RequestBody ComplaintService.ComplaintRequest request,HttpSession session) {
        return complaintService.addComplaint(request,session);
    }

    // Gettting My vcomplaints(student)
    @GetMapping("/mycomplaints")
    public ResponseEntity<?> getMyComplaints(HttpSession session){
       return complaintService.getMyComplaints(session);
    }

    // ALL COMPLAINTS
    @GetMapping("/all")
    public List<Complaints> getAll(){
        return complaintService.getAll();
    }

    // UPDATE STATUS
    @PostMapping("/status/{id}")
    public ResponseEntity<?> updateStatus(
            @PathVariable Integer id,
            @RequestBody ComplaintService.StatusUpdateRequest request,
            HttpSession session
    ) { return complaintService.updateStatus(id, request,session);
    }
}


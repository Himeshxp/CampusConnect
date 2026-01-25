package com.project.cc.complaint;

import com.project.cc.ComplaintStatus;
import com.project.cc.student.Student;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@Service
public class ComplaintService {
    private  ComplaintRepo complaintRepo;
    public ComplaintService(ComplaintRepo complaintRepo) {
        this.complaintRepo = complaintRepo;
    }

    public static class StatusUpdateRequest {
        private ComplaintStatus status;

        public ComplaintStatus getStatus() { return status; }
        public void setStatus(ComplaintStatus status) { this.status = status; }
    }
    // adding complaints
    public static class ComplaintRequest {
        private String title;
        private String category;
        private String description;

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }
    // Adding Complaint
    public ResponseEntity<?> addComplaint(
             ComplaintRequest request,
            HttpSession session){
        Object userObj = session.getAttribute("user");
        String role = (String) session.getAttribute("role");
        if (userObj == null || !"student".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(java.util.Map.of("success", false, "message", "Only logged-in students can file complaints"));
        }
        Student student = (Student) userObj;
        // complaint creation
        Complaints complaint = new Complaints();
        complaint.setTitle(request.getTitle());
        complaint.setCategory(request.getCategory());
        complaint.setDescription(request.getDescription());

        complaint.setStudent(student);
        Complaints saved = complaintRepo.save(complaint);
        return ResponseEntity.ok(java.util.Map.of("success", true, "message", "Complaint has been added successfully", "id", saved.getId()));
    }

    // Updating Status
    public ResponseEntity<?> updateStatus(
            Integer id,
           StatusUpdateRequest request,
            HttpSession session
    ){
        Object userObj = session.getAttribute("user");
        String role = (String) session.getAttribute("role");
        if (userObj == null || !"staff".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(java.util.Map.of("success", false, "message", "Only staff can update complaint status"));
        }
        Complaints complaint = complaintRepo.findById(id).orElse(null);
        if(complaint==null){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(java.util.Map.of("success", false, "message", "Complaint not found"));
        }
        complaint.setComplaintStatus(request.getStatus());
        complaintRepo.save(complaint);

        return ResponseEntity.ok(java.util.Map.of("success", true, "message", "Complaint status updated successfully"));
    }

    // Fetching Complaints

    public ResponseEntity<?> getMyComplaints(HttpSession session){
        Object userObj = session.getAttribute("user");
        String role = (String) session.getAttribute("role");
        if (userObj == null || !"student".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(java.util.Map.of("success", false, "message", "Only logged-in students can view their complaints"));
        }
        Student student = (Student) userObj;
        List<Complaints> complaints = complaintRepo.findByStudent_Id(student.getId());
        return ResponseEntity.ok(complaints);
    }

    //
    public List<Complaints> getAll(){
        return complaintRepo.findAll();
    }
}

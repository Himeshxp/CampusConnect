package com.project.cc.staff;

import com.project.cc.complaint.ComplaintRepo;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@Valid
@RequestMapping("/api/staff")
public class StaffController {
    private StaffService staffService;
    public StaffController(StaffService staffService, ComplaintRepo complaintRepo) {
        this.staffService = staffService;
    }

    @GetMapping("/all")
    public List<StaffResponseDTO> getAllStaff() {
        return staffService.getAllStaff();
    }

    @PostMapping("/add")
    public ResponseEntity<StaffResponseDTO> addStaff( @Valid @RequestBody CreateStaffRequestDTO staffdto) {
       return ResponseEntity.ok(staffService.addStaff(staffdto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStaff(@PathVariable Integer id) {
         staffService.deleteStaff(id);
         return ResponseEntity.noContent().build();
    }


}



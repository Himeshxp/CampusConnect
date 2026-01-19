package com.project.cc.staff;

import com.project.cc.complaint.ComplaintRepo;
import com.project.cc.complaint.ComplaintService;
import com.project.cc.staff.StaffService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/staff")
public class StaffController {
    @Autowired
    private StaffRepository staffRepository;
    @Autowired
    private ComplaintRepo complaintRepo;

    @GetMapping("/all")
    public List<Staff> getAllStaff()
    {
        return staffRepository.findAll();
    }
    @PostMapping("/add")
    public Staff addStaff(@RequestBody Staff staff)
    {
        return staffRepository.save(staff);
    }

    @GetMapping("/{id}")

    public ResponseEntity<?> getStaff(@PathVariable Integer id){
        return staffRepository.findById(id).map(staff -> ResponseEntity.ok().body(staff)).orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStaff(@PathVariable Integer id){
        if(!staffRepository.existsById(id))
        {
            return ResponseEntity.notFound().build();
        }
        staffRepository.deleteById(id);
        return ResponseEntity.ok("Deleted Staff");
    }


}



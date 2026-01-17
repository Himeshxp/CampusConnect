package com.project.cc.staff;

import com.project.cc.complaint.ComplaintRepo;
import com.project.cc.complaint.ComplaintService;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class StaffController {
    private StaffService staffService;
    private ComplaintService complaintService;
    private ComplaintRepo complaintRepo;
    public StaffController(StaffService staffService, ComplaintService complaintService) {
        this.staffService = staffService;
        this.complaintService = complaintService;
    }


}

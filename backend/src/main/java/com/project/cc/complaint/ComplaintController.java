package com.project.cc.complaint;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ComplaintController {
    @Autowired
    private ComplaintRepo complaintRepo;
    public ComplaintController(ComplaintRepo complaintRepo) {
        this.complaintRepo = complaintRepo;
    }
}

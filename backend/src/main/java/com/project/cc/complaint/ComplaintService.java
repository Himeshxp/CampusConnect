package com.project.cc.complaint;

import org.springframework.stereotype.Service;

@Service
public class ComplaintService {
    private  ComplaintRepo complaintRepo;
    public ComplaintService(ComplaintRepo complaintRepo) {
        this.complaintRepo = complaintRepo;
    }
}

package com.project.cc.student;


import com.project.cc.complaint.ComplaintRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class StudentService {
    @Autowired
    private ComplaintRepo complaintRepo;
    @Autowired
    private StudentRepository studentRepo;

}

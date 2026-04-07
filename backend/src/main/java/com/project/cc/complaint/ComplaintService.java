package com.project.cc.complaint;

import com.project.cc.ComplaintStatus;
import com.project.cc.student.Student;

import org.springframework.stereotype.Service;


import java.util.List;
@Service
public class ComplaintService {
    private ComplaintRepo complaintRepo;
    private ComplaintMapper complaintMapper;
    public ComplaintService(ComplaintRepo complaintRepo, ComplaintMapper complaintMapper) {
        this.complaintRepo = complaintRepo;
        this.complaintMapper = complaintMapper;
    }

    // Adding Complaint
    public ComplaintResponseDTO addComplaint(ComplaintRequestDTO dto, Student student) {
        Complaints complaints = complaintMapper.toEntity(dto, student);
        Complaints complaints1 = complaintRepo.save(complaints);
        return complaintMapper.toDTO(complaints1);
    }

   //update status
    public void updateStatus(Integer id, ComplaintStatus status) {
        Complaints complaints = complaintRepo.findById(id).orElseThrow(() -> new RuntimeException("Complaint not found"));
        complaints.setComplaintStatus(status);
        complaintRepo.save(complaints);
    }
    public List<ComplaintResponseDTO> getMyComplaints(Student student) {
        return complaintRepo.findById(student.getId())
                .stream()
                .map(complaintMapper::toDTO)
                .toList();

    }

    public List<ComplaintResponseDTO> getAll() {
        return complaintRepo.findAll().stream().map(complaintMapper::toDTO).toList();

    }
}

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

    public ComplaintResponseDTO addComplaint(ComplaintRequestDTO dto, Student student) {
        Complaints complaints = complaintMapper.toEntity(dto, student);
        Complaints saved = complaintRepo.save(complaints);
        return complaintMapper.toDTO(saved);
    }

    public void updateStatus(Integer id, ComplaintStatus status) {
        Complaints complaints = complaintRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));
        complaints.setComplaintStatus(status);
        complaintRepo.save(complaints);
    }

    public List<ComplaintResponseDTO> getMyComplaints(Integer studentId) {
        return complaintRepo.findByStudent_Id(studentId)
                .stream()
                .map(complaintMapper::toDTO)
                .toList();
    }

    public List<ComplaintResponseDTO> getAll() {
        return complaintRepo.findAll().stream().map(complaintMapper::toDTO).toList();
    }

    public void deleteComplaint(Integer studentId, Integer complaintId) {
        Complaints complaint = complaintRepo.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));
        if (!complaint.getStudent().getId().equals(studentId)) {
            throw new RuntimeException("You can only delete your own complaints");
        }
        complaintRepo.deleteById(complaintId);
    }
}

package com.project.cc.staff;
import com.project.cc.complaint.ComplaintRepo;
import com.project.cc.exception.ResourceNotFoundException;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@Service
public class StaffService {
    private StaffRepository staffRepository;
    private StaffMapper staffMapper;
   public StaffService(StaffRepository staffRepository, StaffMapper staffMapper) {
       this.staffRepository = staffRepository;
       this.staffMapper = staffMapper;
   }
    public List<StaffResponseDTO> getAllStaff() {
        return staffRepository.findAll().stream()
                .map(staffMapper::toDTO).toList();
    }
    public StaffResponseDTO addStaff( CreateStaffRequestDTO staffdto) {
        Staff staff = staffMapper.toEntity(staffdto);
        Staff savedStaff = staffRepository.save(staff);
        return staffMapper.toDTO(savedStaff);
    }
    public StaffResponseDTO getStaff( Integer id) {
        return staffRepository.findById(id)
                .map(staffMapper::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found with id: " + id));
    }
    public void deleteStaff(Integer id) {
        if (!staffRepository.existsById(id)) {
            throw new ResourceNotFoundException("Staff not found with id: " + id);
        }
        staffRepository.deleteById(id);
    }


}

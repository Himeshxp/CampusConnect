package com.project.cc.staff;
import com.project.cc.exception.ResourceNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class StaffService {
    private StaffRepository staffRepository;
    private StaffMapper staffMapper;
    private PasswordEncoder passwordEncoder;

    public StaffService(StaffRepository staffRepository, StaffMapper staffMapper, PasswordEncoder passwordEncoder) {
        this.staffRepository = staffRepository;
        this.staffMapper = staffMapper;
        this.passwordEncoder = passwordEncoder;
    }

    public List<StaffResponseDTO> getAllStaff() {
        return staffRepository.findAll().stream()
                .map(staffMapper::toDTO).toList();
    }

    public StaffResponseDTO addStaff(CreateStaffRequestDTO staffdto) {
        if (staffRepository.existsByEmail(staffdto.email())) {
            throw new IllegalStateException("A staff account with this email already exists");
        }
        Staff staff = staffMapper.toEntity(staffdto);
        staff.setPassword(passwordEncoder.encode(staffdto.password()));
        Staff savedStaff = staffRepository.save(staff);
        return staffMapper.toDTO(savedStaff);
    }

    public StaffResponseDTO getStaff(Integer id) {
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

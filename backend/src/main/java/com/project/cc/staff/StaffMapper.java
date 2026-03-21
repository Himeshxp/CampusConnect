package com.project.cc.staff;

import org.springframework.stereotype.Component;

@Component
public class StaffMapper {
    //Request to Entity
    public Staff toEntity(CreateStaffRequestDTO dto) {
        Staff staff = new Staff();
        staff.setId(dto.id());
        staff.setFirstName(dto.firstName());
        staff.setLastName(dto.lastName());
        staff.setEmail(dto.email());
        staff.setPassword(dto.password());
        return staff;
    }

    //Response
    public StaffResponseDTO toDTO(Staff staff) {
       return new StaffResponseDTO(
               staff.getId(),
               staff.getFirstName(),
               staff.getLastName(),
               staff.getEmail()
       );
    }


}

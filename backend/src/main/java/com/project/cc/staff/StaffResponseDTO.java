package com.project.cc.staff;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;

public record StaffResponseDTO(
        Integer id,
        String firstname,
        String lastname,
        String email
) {
}

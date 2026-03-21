package com.project.cc.staff;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;

@Valid
public record CreateStaffRequestDTO(
        Integer id,
        @NotNull String firstName,
        String lastName,
        @Email String email,
        @NotNull String password
) {
}

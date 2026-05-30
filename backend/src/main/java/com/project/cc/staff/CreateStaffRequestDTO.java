package com.project.cc.staff;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Valid
public record CreateStaffRequestDTO(
        Integer id,
        @NotBlank @Size(max = 80) String firstName,
        @Size(max = 80) String lastName,
        @Email @NotBlank String email,
        @NotBlank @Size(min = 8, max = 72) String password
) {
}

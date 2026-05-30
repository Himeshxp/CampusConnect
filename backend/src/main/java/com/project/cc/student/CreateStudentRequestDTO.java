package com.project.cc.student;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.validation.annotation.Validated;

@Validated
public record CreateStudentRequestDTO(
        @NotBlank @Size(max = 80) String firstName,
        @Size(max = 80) String lastName,
        @Email @NotBlank String email,
        @NotEmpty @Size(min = 8, max = 72) String password
) {
}

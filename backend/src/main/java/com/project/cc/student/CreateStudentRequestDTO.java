package com.project.cc.student;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import org.springframework.validation.annotation.Validated;

@Validated
public record CreateStudentRequestDTO(
        @NotNull String firstName,
        String lastName,
         @NotBlank String email,
        @NotEmpty String password
) {
}

package com.project.cc.student;

import jakarta.validation.constraints.*;

public record StudentResponseDTO(
        Integer id,
        String firstName,
        String lastName,
        String email
) {
}

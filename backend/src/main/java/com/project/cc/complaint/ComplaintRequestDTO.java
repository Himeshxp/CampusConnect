package com.project.cc.complaint;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

@Valid
public record ComplaintRequestDTO(
       @NotEmpty String title,
       @NotNull String category,
        String description,
        Integer studentId
) {
}

package com.project.cc.complaint;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Valid
public record ComplaintRequestDTO(
       @NotBlank @Size(max = 150) String title,
       @NotBlank @Size(max = 80) String category,
       @Size(max = 2000) String description
) {
}

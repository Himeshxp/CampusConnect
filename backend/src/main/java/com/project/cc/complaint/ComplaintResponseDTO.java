package com.project.cc.complaint;

import com.project.cc.ComplaintStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

@Valid
public record ComplaintResponseDTO(
        @NotNull Integer id,
        @NotEmpty String title,
        @NotNull String category,
        String description,
        ComplaintStatus complaintStatus,
        String studentName,
        LocalDateTime createdAt
) {
}

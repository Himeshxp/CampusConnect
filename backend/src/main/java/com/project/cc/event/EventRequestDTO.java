package com.project.cc.event;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record EventRequestDTO(
        @NotBlank @Size(max = 150) String eventName,
        @NotBlank @Size(max = 2000) String eventDescription,
        @NotBlank @Size(max = 40) String eventDate
) {
}

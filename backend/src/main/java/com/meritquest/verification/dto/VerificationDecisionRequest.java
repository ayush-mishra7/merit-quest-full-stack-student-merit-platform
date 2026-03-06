package com.meritquest.verification.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class VerificationDecisionRequest {
    @NotNull private Boolean approved;
    private String comment;
}

package com.meritquest.merit.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MeritCalculationRequest {

    @NotBlank(message = "Scope is required")
    @Pattern(regexp = "SCHOOL|DISTRICT|STATE", message = "Scope must be SCHOOL, DISTRICT, or STATE")
    private String scope;

    @NotBlank(message = "Academic year is required")
    private String academicYear;

    // For SCHOOL scope: institution ID; for DISTRICT/STATE scope: the name
    private String scopeId;
}

package com.meritquest.merit.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MeritConfigUpdateRequest {

    @NotBlank(message = "Config key is required")
    private String configKey;

    @NotNull(message = "Config value is required")
    @DecimalMin(value = "0.0", message = "Weight must be >= 0")
    @DecimalMax(value = "1.0", message = "Weight must be <= 1")
    private BigDecimal configValue;
}

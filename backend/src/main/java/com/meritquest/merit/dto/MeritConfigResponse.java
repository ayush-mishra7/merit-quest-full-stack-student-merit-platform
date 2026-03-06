package com.meritquest.merit.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MeritConfigResponse {
    private Long id;
    private String configKey;
    private BigDecimal configValue;
    private String description;
    private LocalDateTime updatedAt;
}

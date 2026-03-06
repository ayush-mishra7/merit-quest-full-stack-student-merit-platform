package com.meritquest.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubjectPerformance implements Serializable {
    private String subject;
    private long recordCount;
    private BigDecimal avgPercentage;
    private BigDecimal minPercentage;
    private BigDecimal maxPercentage;
}

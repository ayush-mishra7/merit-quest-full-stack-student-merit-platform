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
public class InstitutionComparison implements Serializable {
    private Long institutionId;
    private String institutionName;
    private String district;
    private String state;
    private long studentCount;
    private BigDecimal avgCompositeScore;
    private BigDecimal avgAcademicZScore;
    private BigDecimal avgAttendanceZScore;
}

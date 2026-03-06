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
public class GradeDistribution implements Serializable {
    private String grade;
    private long studentCount;
    private BigDecimal avgCompositeScore;
    private BigDecimal avgAcademicZScore;
    private BigDecimal avgAttendanceZScore;
    private BigDecimal avgActivityZScore;
    private BigDecimal avgCertificateZScore;
}

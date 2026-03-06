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
public class ScoreHistory implements Serializable {
    private String academicYear;
    private BigDecimal compositeScore;
    private BigDecimal academicZScore;
    private BigDecimal attendanceZScore;
    private BigDecimal activityZScore;
    private BigDecimal certificateZScore;
    private Integer rankSchool;
}

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
public class MeritScoreResponse {
    private Long id;
    private Long studentId;
    private String enrollmentNumber;
    private String studentName;
    private String grade;
    private String section;
    private String institutionName;

    private BigDecimal academicZScore;
    private BigDecimal attendanceZScore;
    private BigDecimal activityZScore;
    private BigDecimal certificateZScore;
    private BigDecimal compositeScore;

    private Integer rankSchool;
    private Integer rankDistrict;
    private Integer rankState;

    private String academicYear;
    private Long batchId;
    private LocalDateTime calculatedAt;
}

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
public class TopPerformer implements Serializable {
    private Long studentId;
    private String enrollmentNumber;
    private String studentName;
    private String grade;
    private String institutionName;
    private BigDecimal compositeScore;
    private Integer rankSchool;
    private Integer rankDistrict;
    private Integer rankState;
}

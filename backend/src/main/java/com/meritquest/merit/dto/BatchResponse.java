package com.meritquest.merit.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BatchResponse {
    private Long id;
    private String scope;
    private String scopeId;
    private String academicYear;
    private String status;
    private Integer totalStudents;
    private Integer processed;
    private String errorMessage;
    private String triggeredByName;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
}

package com.meritquest.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OverviewStats implements Serializable {
    private long totalStudents;
    private long approvedStudents;
    private long pendingVerification;
    private long totalInstitutions;
    private BigDecimal averageCompositeScore;
    private BigDecimal highestCompositeScore;
    private long totalMeritBatches;
    private long completedBatches;
}

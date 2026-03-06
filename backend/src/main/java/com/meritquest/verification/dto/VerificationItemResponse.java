package com.meritquest.verification.dto;

import com.meritquest.common.model.RecordType;
import com.meritquest.common.model.VerificationStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class VerificationItemResponse {
    private Long id;
    private RecordType recordType;
    private Long recordId;
    private VerificationStatus status;
    private String reviewerName;
    private String comment;
    private Long institutionId;
    private String institutionName;
    private String submittedByName;
    private String recordSummary;
    private LocalDateTime reviewedAt;
    private LocalDateTime createdAt;
}

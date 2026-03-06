package com.meritquest.audit.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
public class AuditLogResponse {
    private Long id;
    private String action;
    private String entityType;
    private Long entityId;
    private String userEmail;
    private String ipAddress;
    private Map<String, Object> details;
    private Long institutionId;
    private LocalDateTime createdAt;
}

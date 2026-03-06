package com.meritquest.audit.service;

import com.meritquest.audit.dto.AuditLogResponse;
import com.meritquest.audit.entity.AuditLog;
import com.meritquest.audit.repository.AuditLogRepository;
import com.meritquest.user.entity.Institution;
import com.meritquest.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Async
    @Transactional
    public void log(String action, String entityType, Long entityId,
                    User user, String ipAddress, Map<String, Object> details) {
        AuditLog entry = AuditLog.builder()
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .user(user)
                .userEmail(user != null ? user.getEmail() : null)
                .ipAddress(ipAddress)
                .details(details)
                .institution(user != null ? user.getInstitution() : null)
                .build();
        auditLogRepository.save(entry);
        log.debug("Audit: {} {} #{} by {}", action, entityType, entityId,
                user != null ? user.getEmail() : "system");
    }

    public void log(String action, String entityType, Long entityId, User user, String ipAddress) {
        log(action, entityType, entityId, user, ipAddress, null);
    }

    @Transactional(readOnly = true)
    public Page<AuditLogResponse> getByInstitution(Long institutionId, Pageable pageable) {
        return auditLogRepository.findByInstitutionIdOrderByCreatedAtDesc(institutionId, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<AuditLogResponse> getAll(Pageable pageable) {
        return auditLogRepository.findAllByOrderByCreatedAtDesc(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<AuditLogResponse> getByEntity(String entityType, Long entityId, Pageable pageable) {
        return auditLogRepository.findByEntityTypeAndEntityIdOrderByCreatedAtDesc(entityType, entityId, pageable)
                .map(this::toResponse);
    }

    private AuditLogResponse toResponse(AuditLog a) {
        return AuditLogResponse.builder()
                .id(a.getId())
                .action(a.getAction())
                .entityType(a.getEntityType())
                .entityId(a.getEntityId())
                .userEmail(a.getUserEmail())
                .ipAddress(a.getIpAddress())
                .details(a.getDetails())
                .institutionId(a.getInstitution() != null ? a.getInstitution().getId() : null)
                .createdAt(a.getCreatedAt())
                .build();
    }
}

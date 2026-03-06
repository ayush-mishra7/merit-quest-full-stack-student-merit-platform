package com.meritquest.audit.controller;

import com.meritquest.audit.dto.AuditLogResponse;
import com.meritquest.audit.service.AuditLogService;
import com.meritquest.common.dto.ApiResponse;
import com.meritquest.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'GOV_AUTHORITY')")
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<AuditLogResponse>>> getLogs(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) Long entityId,
            @PageableDefault(size = 20) Pageable pageable) {

        if (entityType != null && entityId != null) {
            return ResponseEntity.ok(ApiResponse.success(
                    auditLogService.getByEntity(entityType, entityId, pageable)));
        }

        boolean isSystemAdmin = user.getRole().name().equals("SYSTEM_ADMIN");
        if (isSystemAdmin) {
            return ResponseEntity.ok(ApiResponse.success(auditLogService.getAll(pageable)));
        }

        return ResponseEntity.ok(ApiResponse.success(
                auditLogService.getByInstitution(user.getInstitution().getId(), pageable)));
    }
}

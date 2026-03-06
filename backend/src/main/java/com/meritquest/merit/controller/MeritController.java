package com.meritquest.merit.controller;

import com.meritquest.audit.AuditLogged;
import com.meritquest.common.dto.ApiResponse;
import com.meritquest.merit.dto.*;
import com.meritquest.merit.service.MeritCalculationService;
import com.meritquest.merit.service.MeritConfigService;
import com.meritquest.user.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/merit")
@RequiredArgsConstructor
public class MeritController {

    private final MeritCalculationService calculationService;
    private final MeritConfigService configService;

    // ---- Calculation ----

    @PostMapping("/calculate")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'SYSTEM_ADMIN', 'GOV_AUTHORITY')")
    @AuditLogged(action = "TRIGGER_MERIT_CALCULATION", entityType = "MERIT_BATCH")
    public ResponseEntity<ApiResponse<BatchResponse>> triggerCalculation(
            @Valid @RequestBody MeritCalculationRequest request,
            @AuthenticationPrincipal User user) {
        BatchResponse batch = calculationService.triggerCalculation(request, user);
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(ApiResponse.success("Merit calculation started", batch));
    }

    // ---- Batch status ----

    @GetMapping("/batches")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'SYSTEM_ADMIN', 'GOV_AUTHORITY')")
    public ResponseEntity<ApiResponse<Page<BatchResponse>>> listBatches(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(calculationService.getBatches(pageable)));
    }

    @GetMapping("/batches/{batchId}")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'SYSTEM_ADMIN', 'GOV_AUTHORITY', 'DATA_VERIFIER')")
    public ResponseEntity<ApiResponse<BatchResponse>> getBatch(@PathVariable Long batchId) {
        return ResponseEntity.ok(ApiResponse.success(calculationService.getBatch(batchId)));
    }

    // ---- Merit lists ----

    @GetMapping("/lists/{batchId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Page<MeritScoreResponse>>> getMeritList(
            @PathVariable Long batchId,
            @RequestParam(required = false) Long institutionId,
            @AuthenticationPrincipal User user,
            @PageableDefault(size = 20) Pageable pageable) {
        // School admins, verifiers, students see only their institution
        Long effectiveInstitutionId = resolveInstitutionId(user, institutionId);
        return ResponseEntity.ok(ApiResponse.success(
                calculationService.getMeritList(batchId, effectiveInstitutionId, pageable)));
    }

    @GetMapping("/lists")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Page<MeritScoreResponse>>> getMeritListByYear(
            @RequestParam String academicYear,
            @RequestParam(defaultValue = "SCHOOL") String scope,
            @RequestParam(required = false) String scopeId,
            @AuthenticationPrincipal User user,
            @PageableDefault(size = 20) Pageable pageable) {
        String effectiveScopeId = scopeId;
        if ("SCHOOL".equalsIgnoreCase(scope) && (effectiveScopeId == null || effectiveScopeId.isBlank())) {
            if (user.getInstitution() != null) {
                effectiveScopeId = String.valueOf(user.getInstitution().getId());
            }
        }
        return ResponseEntity.ok(ApiResponse.success(
                calculationService.getMeritListByYear(academicYear, scope, effectiveScopeId, pageable)));
    }

    @GetMapping("/students/{studentId}/history")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<MeritScoreResponse>>> getStudentHistory(
            @PathVariable Long studentId) {
        return ResponseEntity.ok(ApiResponse.success(
                calculationService.getStudentScoreHistory(studentId)));
    }

    // ---- Config ----

    @GetMapping("/config")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'GOV_AUTHORITY')")
    public ResponseEntity<ApiResponse<List<MeritConfigResponse>>> getConfig() {
        return ResponseEntity.ok(ApiResponse.success(configService.getAllConfigs()));
    }

    @PutMapping("/config")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    @AuditLogged(action = "UPDATE_MERIT_CONFIG", entityType = "MERIT_CONFIG")
    public ResponseEntity<ApiResponse<MeritConfigResponse>> updateConfig(
            @Valid @RequestBody MeritConfigUpdateRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success("Config updated",
                configService.updateConfig(request, user)));
    }

    // ---- Helpers ----

    private Long resolveInstitutionId(User user, Long requestedId) {
        String role = user.getRole().name();
        // Gov authorities, NGOs, and system admins can query any institution
        if ("SYSTEM_ADMIN".equals(role) || "GOV_AUTHORITY".equals(role) || "NGO_REP".equals(role)) {
            return requestedId; // null = all
        }
        // Everyone else is scoped to their institution (if they have one)
        if (user.getInstitution() != null) {
            return user.getInstitution().getId();
        }
        return requestedId;
    }
}

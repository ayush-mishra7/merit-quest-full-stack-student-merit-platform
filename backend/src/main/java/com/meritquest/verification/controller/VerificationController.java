package com.meritquest.verification.controller;

import com.meritquest.common.dto.ApiResponse;
import com.meritquest.common.model.VerificationStatus;
import com.meritquest.verification.dto.VerificationDecisionRequest;
import com.meritquest.verification.dto.VerificationItemResponse;
import com.meritquest.verification.service.VerificationService;
import com.meritquest.user.entity.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/verification")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('DATA_VERIFIER', 'SCHOOL_ADMIN', 'SYSTEM_ADMIN')")
public class VerificationController {

    private final VerificationService verificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<VerificationItemResponse>>> getQueue(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) VerificationStatus status,
            @PageableDefault(size = 20) Pageable pageable) {
        Long institutionId = user.getRole().name().equals("SYSTEM_ADMIN") ? null : user.getInstitution().getId();
        return ResponseEntity.ok(ApiResponse.success(verificationService.getQueue(institutionId, status, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VerificationItemResponse>> getItem(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(verificationService.getItem(id)));
    }

    @PutMapping("/{id}/decide")
    @PreAuthorize("hasAnyRole('DATA_VERIFIER', 'SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<VerificationItemResponse>> decide(
            @PathVariable Long id,
            @Valid @RequestBody VerificationDecisionRequest request,
            @AuthenticationPrincipal User user,
            HttpServletRequest httpRequest) {
        String ip = httpRequest.getRemoteAddr();
        return ResponseEntity.ok(ApiResponse.success(
                request.getApproved() ? "Record approved" : "Record rejected",
                verificationService.decide(id, request, user, ip)));
    }
}

package com.meritquest.student.controller;

import com.meritquest.audit.AuditLogged;
import com.meritquest.common.dto.ApiResponse;
import com.meritquest.student.dto.CertificateRequest;
import com.meritquest.student.dto.CertificateResponse;
import com.meritquest.student.service.CertificateService;
import com.meritquest.user.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/certificates")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'SYSTEM_ADMIN')")
public class CertificateController {

    private final CertificateService certificateService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @AuditLogged(action = "UPLOAD_CERTIFICATE", entityType = "CERTIFICATE")
    public ResponseEntity<ApiResponse<CertificateResponse>> upload(
            @RequestPart("file") MultipartFile file,
            @RequestPart("data") @Valid CertificateRequest request,
            @AuthenticationPrincipal User user) {
        Long institutionId = user.getInstitution().getId();
        CertificateResponse response = certificateService.uploadCertificate(request, file, institutionId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Certificate uploaded", response));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<ApiResponse<List<CertificateResponse>>> getByStudent(
            @PathVariable Long studentId,
            @AuthenticationPrincipal User user) {
        Long institutionId = user.getInstitution().getId();
        return ResponseEntity.ok(ApiResponse.success(certificateService.getCertificatesByStudent(studentId, institutionId)));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<ApiResponse<Map<String, String>>> getDownloadUrl(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        Long institutionId = user.getInstitution().getId();
        String url = certificateService.getDownloadUrl(id, institutionId);
        return ResponseEntity.ok(ApiResponse.success(Map.of("url", url)));
    }

    @DeleteMapping("/{id}")
    @AuditLogged(action = "DELETE_CERTIFICATE", entityType = "CERTIFICATE")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        Long institutionId = user.getInstitution().getId();
        certificateService.deleteCertificate(id, institutionId);
        return ResponseEntity.ok(ApiResponse.success("Certificate deleted", null));
    }
}

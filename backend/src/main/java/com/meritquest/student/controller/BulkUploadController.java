package com.meritquest.student.controller;

import com.meritquest.audit.AuditLogged;
import com.meritquest.common.dto.ApiResponse;
import com.meritquest.common.model.UploadType;
import com.meritquest.student.dto.BulkUploadResponse;
import com.meritquest.student.service.BulkUploadService;
import com.meritquest.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/uploads")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'SYSTEM_ADMIN')")
public class BulkUploadController {

    private final BulkUploadService bulkUploadService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @AuditLogged(action = "BULK_UPLOAD", entityType = "BULK_UPLOAD")
    public ResponseEntity<ApiResponse<BulkUploadResponse>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "type", defaultValue = "STUDENTS") UploadType uploadType,
            @AuthenticationPrincipal User user) {

        Long institutionId = user.getInstitution().getId();
        BulkUploadResponse response = bulkUploadService.initUpload(file, uploadType, user, institutionId);

        // Process async
        bulkUploadService.processStudentUpload(response.getId(), file, institutionId);

        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(ApiResponse.success("Upload accepted for processing", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<BulkUploadResponse>>> listUploads(
            @AuthenticationPrincipal User user,
            @PageableDefault(size = 20) Pageable pageable) {
        Long institutionId = user.getInstitution().getId();
        return ResponseEntity.ok(ApiResponse.success(bulkUploadService.getUploads(institutionId, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BulkUploadResponse>> getUpload(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(bulkUploadService.getUpload(id)));
    }
}

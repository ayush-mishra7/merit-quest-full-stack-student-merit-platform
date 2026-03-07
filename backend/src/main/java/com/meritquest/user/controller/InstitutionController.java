package com.meritquest.user.controller;

import com.meritquest.audit.AuditLogged;
import com.meritquest.common.dto.ApiResponse;
import com.meritquest.common.model.InstitutionType;
import com.meritquest.user.entity.Institution;
import com.meritquest.user.repository.InstitutionRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/institutions")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SYSTEM_ADMIN')")
public class InstitutionController {

    private final InstitutionRepository institutionRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Institution>>> list(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(institutionRepository.findAll(pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Institution>> getOne(@PathVariable Long id) {
        Institution inst = institutionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Institution not found: " + id));
        return ResponseEntity.ok(ApiResponse.success(inst));
    }

    @PostMapping
    @AuditLogged(action = "CREATE_INSTITUTION", entityType = "INSTITUTION")
    public ResponseEntity<ApiResponse<Institution>> create(@Valid @RequestBody InstitutionRequest request) {
        Institution inst = Institution.builder()
                .name(request.getName())
                .code(request.getCode())
                .type(request.getType())
                .board(request.getBoard())
                .district(request.getDistrict())
                .state(request.getState())
                .address(request.getAddress())
                .contactEmail(request.getContactEmail())
                .contactPhone(request.getContactPhone())
                .build();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Institution created", institutionRepository.save(inst)));
    }

    @PutMapping("/{id}")
    @AuditLogged(action = "UPDATE_INSTITUTION", entityType = "INSTITUTION")
    public ResponseEntity<ApiResponse<Institution>> update(
            @PathVariable Long id,
            @Valid @RequestBody InstitutionRequest request) {
        Institution inst = institutionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Institution not found: " + id));
        inst.setName(request.getName());
        inst.setCode(request.getCode());
        inst.setType(request.getType());
        inst.setBoard(request.getBoard());
        inst.setDistrict(request.getDistrict());
        inst.setState(request.getState());
        inst.setAddress(request.getAddress());
        inst.setContactEmail(request.getContactEmail());
        inst.setContactPhone(request.getContactPhone());
        return ResponseEntity.ok(ApiResponse.success("Institution updated", institutionRepository.save(inst)));
    }

    @DeleteMapping("/{id}")
    @AuditLogged(action = "DEACTIVATE_INSTITUTION", entityType = "INSTITUTION")
    public ResponseEntity<ApiResponse<Void>> deactivate(@PathVariable Long id) {
        Institution inst = institutionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Institution not found: " + id));
        inst.setActive(false);
        institutionRepository.save(inst);
        return ResponseEntity.ok(ApiResponse.success("Institution deactivated", null));
    }

    @Data
    public static class InstitutionRequest {
        @NotBlank private String name;
        @NotBlank private String code;
        @NotNull  private InstitutionType type;
        private String board;
        @NotBlank private String district;
        @NotBlank private String state;
        private String address;
        private String contactEmail;
        private String contactPhone;
    }
}

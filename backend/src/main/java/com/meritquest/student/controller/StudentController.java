package com.meritquest.student.controller;

import com.meritquest.audit.AuditLogged;
import com.meritquest.common.dto.ApiResponse;
import com.meritquest.student.dto.StudentRequest;
import com.meritquest.student.dto.StudentResponse;
import com.meritquest.student.service.StudentService;
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

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'SYSTEM_ADMIN')")
public class StudentController {

    private final StudentService studentService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<StudentResponse>>> listStudents(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) String grade,
            @PageableDefault(size = 20) Pageable pageable) {
        Long institutionId = user.getInstitution().getId();
        return ResponseEntity.ok(ApiResponse.success(studentService.getStudents(institutionId, grade, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StudentResponse>> getStudent(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        Long institutionId = user.getInstitution().getId();
        return ResponseEntity.ok(ApiResponse.success(studentService.getStudent(id, institutionId)));
    }

    @PostMapping
    @AuditLogged(action = "CREATE_STUDENT", entityType = "STUDENT")
    public ResponseEntity<ApiResponse<StudentResponse>> createStudent(
            @Valid @RequestBody StudentRequest request,
            @AuthenticationPrincipal User user) {
        Long institutionId = user.getInstitution().getId();
        StudentResponse response = studentService.createStudent(request, institutionId, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Student created", response));
    }

    @PutMapping("/{id}")
    @AuditLogged(action = "UPDATE_STUDENT", entityType = "STUDENT")
    public ResponseEntity<ApiResponse<StudentResponse>> updateStudent(
            @PathVariable Long id,
            @Valid @RequestBody StudentRequest request,
            @AuthenticationPrincipal User user) {
        Long institutionId = user.getInstitution().getId();
        return ResponseEntity.ok(ApiResponse.success("Student updated", studentService.updateStudent(id, request, institutionId)));
    }

    @DeleteMapping("/{id}")
    @AuditLogged(action = "DELETE_STUDENT", entityType = "STUDENT")
    public ResponseEntity<ApiResponse<Void>> deleteStudent(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        Long institutionId = user.getInstitution().getId();
        studentService.deleteStudent(id, institutionId);
        return ResponseEntity.ok(ApiResponse.success("Student deactivated", null));
    }
}

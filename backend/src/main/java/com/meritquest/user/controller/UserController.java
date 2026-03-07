package com.meritquest.user.controller;

import com.meritquest.audit.AuditLogged;
import com.meritquest.common.dto.ApiResponse;
import com.meritquest.common.model.Role;
import com.meritquest.common.model.UserStatus;
import com.meritquest.user.entity.User;
import com.meritquest.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SYSTEM_ADMIN')")
public class UserController {

    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<UserSummary>>> listUsers(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20) Pageable pageable) {

        Page<User> page = userRepository.findAll(pageable);
        Page<UserSummary> summaries = page.map(UserSummary::from);
        return ResponseEntity.ok(ApiResponse.success(summaries));
    }

    @PutMapping("/{id}/role")
    @AuditLogged(action = "UPDATE_USER_ROLE", entityType = "USER")
    public ResponseEntity<ApiResponse<UserSummary>> updateRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
        user.setRole(Role.valueOf(body.get("role")));
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success("Role updated", UserSummary.from(user)));
    }

    @PutMapping("/{id}/status")
    @AuditLogged(action = "UPDATE_USER_STATUS", entityType = "USER")
    public ResponseEntity<ApiResponse<UserSummary>> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
        user.setStatus(UserStatus.valueOf(body.get("status")));
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success("Status updated", UserSummary.from(user)));
    }

    // Lightweight DTO to avoid exposing passwordHash
    public record UserSummary(
            Long id, String email, String firstName, String lastName,
            Role role, UserStatus status, Long institutionId,
            String institutionName, String phone, String createdAt) {

        public static UserSummary from(User u) {
            return new UserSummary(
                    u.getId(), u.getEmail(), u.getFirstName(), u.getLastName(),
                    u.getRole(), u.getStatus(),
                    u.getInstitution() != null ? u.getInstitution().getId() : null,
                    u.getInstitution() != null ? u.getInstitution().getName() : null,
                    u.getPhone(),
                    u.getCreatedAt() != null ? u.getCreatedAt().toString() : null);
        }
    }
}

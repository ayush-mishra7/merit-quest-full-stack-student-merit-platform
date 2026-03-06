package com.meritquest.analytics.controller;

import com.meritquest.analytics.dto.*;
import com.meritquest.analytics.service.AnalyticsService;
import com.meritquest.common.dto.ApiResponse;
import com.meritquest.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    // ─── Overview ───────────────────────────────────────────────────────

    @GetMapping("/overview")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'SYSTEM_ADMIN', 'GOV_AUTHORITY', 'NGO_REP', 'DATA_VERIFIER')")
    public ApiResponse<OverviewStats> getOverview(@AuthenticationPrincipal User user) {
        OverviewStats stats;
        String role = user.getRole().name();

        if ("SCHOOL_ADMIN".equals(role) || "DATA_VERIFIER".equals(role)) {
            Long institutionId = user.getInstitution() != null ? user.getInstitution().getId() : null;
            if (institutionId == null) {
                return ApiResponse.error("No institution assigned");
            }
            stats = analyticsService.getSchoolOverview(institutionId);
        } else {
            stats = analyticsService.getPlatformOverview();
        }

        return ApiResponse.success("Overview stats retrieved", stats);
    }

    // ─── Grade Distribution ─────────────────────────────────────────────

    @GetMapping("/grade-distribution")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'SYSTEM_ADMIN', 'GOV_AUTHORITY', 'NGO_REP', 'DATA_VERIFIER')")
    public ApiResponse<List<GradeDistribution>> getGradeDistribution(@AuthenticationPrincipal User user) {
        List<GradeDistribution> distribution;
        String role = user.getRole().name();

        if ("SCHOOL_ADMIN".equals(role) || "DATA_VERIFIER".equals(role)) {
            Long institutionId = user.getInstitution() != null ? user.getInstitution().getId() : null;
            if (institutionId == null) return ApiResponse.error("No institution assigned");
            distribution = analyticsService.getGradeDistribution(institutionId);
        } else {
            distribution = analyticsService.getPlatformGradeDistribution();
        }

        return ApiResponse.success("Grade distribution retrieved", distribution);
    }

    // ─── Subject Performance ────────────────────────────────────────────

    @GetMapping("/subjects")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'SYSTEM_ADMIN', 'GOV_AUTHORITY', 'DATA_VERIFIER')")
    public ApiResponse<List<SubjectPerformance>> getSubjectPerformance(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "2025-2026") String academicYear) {
        Long institutionId = resolveInstitutionId(user);
        if (institutionId == null) return ApiResponse.error("No institution assigned");

        return ApiResponse.success("Subject performance retrieved",
                analyticsService.getSubjectPerformance(institutionId, academicYear));
    }

    // ─── Top Performers ─────────────────────────────────────────────────

    @GetMapping("/top-performers")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'SYSTEM_ADMIN', 'GOV_AUTHORITY', 'NGO_REP', 'DATA_VERIFIER')")
    public ApiResponse<List<TopPerformer>> getTopPerformers(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "10") int limit) {
        List<TopPerformer> performers;
        String role = user.getRole().name();

        if ("SCHOOL_ADMIN".equals(role) || "DATA_VERIFIER".equals(role)) {
            Long institutionId = user.getInstitution() != null ? user.getInstitution().getId() : null;
            if (institutionId == null) return ApiResponse.error("No institution assigned");
            performers = analyticsService.getTopPerformers(institutionId, limit);
        } else {
            performers = analyticsService.getPlatformTopPerformers(limit);
        }

        return ApiResponse.success("Top performers retrieved", performers);
    }

    // ─── Attendance Trends ──────────────────────────────────────────────

    @GetMapping("/attendance-trends")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'SYSTEM_ADMIN', 'GOV_AUTHORITY', 'DATA_VERIFIER')")
    public ApiResponse<List<AttendanceTrend>> getAttendanceTrends(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "2025-2026") String academicYear) {
        Long institutionId = resolveInstitutionId(user);
        if (institutionId == null) return ApiResponse.error("No institution assigned");

        return ApiResponse.success("Attendance trends retrieved",
                analyticsService.getAttendanceTrends(institutionId, academicYear));
    }

    // ─── Score Histogram ────────────────────────────────────────────────

    @GetMapping("/score-histogram")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'SYSTEM_ADMIN', 'GOV_AUTHORITY', 'NGO_REP', 'DATA_VERIFIER')")
    public ApiResponse<List<ScoreHistogramBucket>> getScoreHistogram(@AuthenticationPrincipal User user) {
        List<ScoreHistogramBucket> histogram;
        String role = user.getRole().name();

        if ("SCHOOL_ADMIN".equals(role) || "DATA_VERIFIER".equals(role)) {
            Long institutionId = user.getInstitution() != null ? user.getInstitution().getId() : null;
            if (institutionId == null) return ApiResponse.error("No institution assigned");
            histogram = analyticsService.getScoreHistogram(institutionId);
        } else {
            histogram = analyticsService.getPlatformScoreHistogram();
        }

        return ApiResponse.success("Score histogram retrieved", histogram);
    }

    // ─── Institution Comparison (Gov/Admin only) ────────────────────────

    @GetMapping("/institution-comparison")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'GOV_AUTHORITY')")
    public ApiResponse<List<InstitutionComparison>> getInstitutionComparison() {
        return ApiResponse.success("Institution comparison retrieved",
                analyticsService.getInstitutionComparison());
    }

    // ─── Student Performance (own or scoped) ────────────────────────────

    @GetMapping("/student/{studentId}")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<StudentPerformanceDetail> getStudentPerformance(
            @PathVariable Long studentId,
            @RequestParam(defaultValue = "2025-2026") String academicYear) {
        return ApiResponse.success("Student performance retrieved",
                analyticsService.getStudentPerformance(studentId, academicYear));
    }

    // ─── Cache Eviction (admin only) ────────────────────────────────────

    @PostMapping("/cache/evict")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ApiResponse<Void> evictCaches() {
        analyticsService.evictAllCaches();
        return ApiResponse.success("All analytics caches evicted", null);
    }

    // ─── Helper ─────────────────────────────────────────────────────────

    private Long resolveInstitutionId(User user) {
        String role = user.getRole().name();
        if ("SCHOOL_ADMIN".equals(role) || "DATA_VERIFIER".equals(role)) {
            return user.getInstitution() != null ? user.getInstitution().getId() : null;
        }
        // For GOV/SYSTEM_ADMIN/NGO, if they have an institution, use it; otherwise null (platform-wide)
        return user.getInstitution() != null ? user.getInstitution().getId() : 1L;
    }
}

package com.meritquest.analytics.service;

import com.meritquest.analytics.dto.*;
import com.meritquest.common.model.VerificationStatus;
import com.meritquest.merit.entity.MeritScore;
import com.meritquest.merit.repository.MeritCalculationBatchRepository;
import com.meritquest.merit.repository.MeritScoreRepository;
import com.meritquest.student.entity.AcademicRecord;
import com.meritquest.student.entity.AttendanceRecord;
import com.meritquest.student.entity.Student;
import com.meritquest.student.repository.*;
import com.meritquest.user.entity.Institution;
import com.meritquest.user.repository.InstitutionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AnalyticsService {

    private final StudentRepository studentRepository;
    private final AcademicRecordRepository academicRecordRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final ActivityRepository activityRepository;
    private final CertificateRepository certificateRepository;
    private final MeritScoreRepository meritScoreRepository;
    private final MeritCalculationBatchRepository batchRepository;
    private final InstitutionRepository institutionRepository;

    // ─── Overview Stats ─────────────────────────────────────────────────

    @Cacheable(value = "analytics-overview", key = "'school-' + #institutionId")
    public OverviewStats getSchoolOverview(Long institutionId) {
        log.debug("Computing school overview for institution {}", institutionId);

        List<Student> students = studentRepository.findByInstitutionId(institutionId, PageRequest.of(0, Integer.MAX_VALUE)).getContent();
        long total = students.size();
        long approved = students.stream().filter(s -> s.getVerificationStatus() == VerificationStatus.APPROVED).count();
        long pending = students.stream().filter(s -> s.getVerificationStatus() == VerificationStatus.PENDING_VERIFICATION).count();

        // Merit score stats from latest batch
        BigDecimal avgScore = BigDecimal.ZERO;
        BigDecimal highScore = BigDecimal.ZERO;
        List<MeritScore> scores = getLatestScoresForInstitution(institutionId);
        if (!scores.isEmpty()) {
            avgScore = scores.stream()
                    .map(MeritScore::getCompositeScore)
                    .reduce(BigDecimal.ZERO, BigDecimal::add)
                    .divide(BigDecimal.valueOf(scores.size()), 4, RoundingMode.HALF_UP);
            highScore = scores.stream()
                    .map(MeritScore::getCompositeScore)
                    .max(Comparator.naturalOrder())
                    .orElse(BigDecimal.ZERO);
        }

        long totalBatches = batchRepository.count();
        long completedBatches = batchRepository.findByStatus("COMPLETED").size();

        return OverviewStats.builder()
                .totalStudents(total)
                .approvedStudents(approved)
                .pendingVerification(pending)
                .totalInstitutions(1)
                .averageCompositeScore(avgScore)
                .highestCompositeScore(highScore)
                .totalMeritBatches(totalBatches)
                .completedBatches(completedBatches)
                .build();
    }

    @Cacheable(value = "analytics-overview", key = "'platform'")
    public OverviewStats getPlatformOverview() {
        log.debug("Computing platform-wide overview");

        long totalStudents = studentRepository.count();
        long totalInstitutions = institutionRepository.count();

        List<Student> allStudents = studentRepository.findAll();
        long approved = allStudents.stream().filter(s -> s.getVerificationStatus() == VerificationStatus.APPROVED).count();
        long pending = allStudents.stream().filter(s -> s.getVerificationStatus() == VerificationStatus.PENDING_VERIFICATION).count();

        List<MeritScore> allScores = getLatestScoresPerStudent(meritScoreRepository.findAllWithStudentAndInstitution());
        BigDecimal avgScore = BigDecimal.ZERO;
        BigDecimal highScore = BigDecimal.ZERO;
        if (!allScores.isEmpty()) {
            avgScore = allScores.stream()
                    .map(MeritScore::getCompositeScore)
                    .reduce(BigDecimal.ZERO, BigDecimal::add)
                    .divide(BigDecimal.valueOf(allScores.size()), 4, RoundingMode.HALF_UP);
            highScore = allScores.stream()
                    .map(MeritScore::getCompositeScore)
                    .max(Comparator.naturalOrder())
                    .orElse(BigDecimal.ZERO);
        }

        long totalBatches = batchRepository.count();
        long completedBatches = batchRepository.findByStatus("COMPLETED").size();

        return OverviewStats.builder()
                .totalStudents(totalStudents)
                .approvedStudents(approved)
                .pendingVerification(pending)
                .totalInstitutions(totalInstitutions)
                .averageCompositeScore(avgScore)
                .highestCompositeScore(highScore)
                .totalMeritBatches(totalBatches)
                .completedBatches(completedBatches)
                .build();
    }

    // ─── Grade Distribution ─────────────────────────────────────────────

    @Cacheable(value = "analytics-distribution", key = "'grade-school-' + #institutionId")
    public List<GradeDistribution> getGradeDistribution(Long institutionId) {
        log.debug("Computing grade distribution for institution {}", institutionId);

        List<MeritScore> scores = getLatestScoresForInstitution(institutionId);
        return scores.stream()
                .collect(Collectors.groupingBy(ms -> ms.getStudent().getGrade()))
                .entrySet().stream()
                .map(entry -> {
                    List<MeritScore> gradeScores = entry.getValue();
                    int n = gradeScores.size();
                    return GradeDistribution.builder()
                            .grade(entry.getKey())
                            .studentCount(n)
                            .avgCompositeScore(avg(gradeScores, MeritScore::getCompositeScore))
                            .avgAcademicZScore(avg(gradeScores, MeritScore::getAcademicZScore))
                            .avgAttendanceZScore(avg(gradeScores, MeritScore::getAttendanceZScore))
                            .avgActivityZScore(avg(gradeScores, MeritScore::getActivityZScore))
                            .avgCertificateZScore(avg(gradeScores, MeritScore::getCertificateZScore))
                            .build();
                })
                .sorted(Comparator.comparing(GradeDistribution::getGrade))
                .toList();
    }

    @Cacheable(value = "analytics-distribution", key = "'grade-platform'")
    public List<GradeDistribution> getPlatformGradeDistribution() {
        List<MeritScore> scores = getLatestScoresPerStudent(meritScoreRepository.findAllWithStudentAndInstitution());
        return scores.stream()
                .collect(Collectors.groupingBy(ms -> ms.getStudent().getGrade()))
                .entrySet().stream()
                .map(entry -> {
                    List<MeritScore> gradeScores = entry.getValue();
                    return GradeDistribution.builder()
                            .grade(entry.getKey())
                            .studentCount(gradeScores.size())
                            .avgCompositeScore(avg(gradeScores, MeritScore::getCompositeScore))
                            .avgAcademicZScore(avg(gradeScores, MeritScore::getAcademicZScore))
                            .avgAttendanceZScore(avg(gradeScores, MeritScore::getAttendanceZScore))
                            .avgActivityZScore(avg(gradeScores, MeritScore::getActivityZScore))
                            .avgCertificateZScore(avg(gradeScores, MeritScore::getCertificateZScore))
                            .build();
                })
                .sorted(Comparator.comparing(GradeDistribution::getGrade))
                .toList();
    }

    // ─── Subject Performance ────────────────────────────────────────────

    @Cacheable(value = "analytics-distribution", key = "'subject-school-' + #institutionId + '-' + #academicYear")
    public List<SubjectPerformance> getSubjectPerformance(Long institutionId, String academicYear) {
        log.debug("Computing subject performance for institution {} year {}", institutionId, academicYear);

        List<AcademicRecord> records = academicRecordRepository.findByInstitutionIdAndAcademicYear(institutionId, academicYear);
        return buildSubjectPerformance(records);
    }

    public List<SubjectPerformance> getStudentSubjectPerformance(Long studentId, String academicYear) {
        List<AcademicRecord> records = academicRecordRepository.findByStudentIdAndAcademicYear(studentId, academicYear);
        return buildSubjectPerformance(records);
    }

    private List<SubjectPerformance> buildSubjectPerformance(List<AcademicRecord> records) {
        return records.stream()
                .collect(Collectors.groupingBy(AcademicRecord::getSubject))
                .entrySet().stream()
                .map(entry -> {
                    List<AcademicRecord> subjectRecords = entry.getValue();
                    List<BigDecimal> percentages = subjectRecords.stream()
                            .map(r -> r.getMarksObtained().multiply(BigDecimal.valueOf(100))
                                    .divide(r.getMaxMarks(), 2, RoundingMode.HALF_UP))
                            .toList();
                    return SubjectPerformance.builder()
                            .subject(entry.getKey())
                            .recordCount(subjectRecords.size())
                            .avgPercentage(percentages.stream()
                                    .reduce(BigDecimal.ZERO, BigDecimal::add)
                                    .divide(BigDecimal.valueOf(percentages.size()), 2, RoundingMode.HALF_UP))
                            .minPercentage(percentages.stream().min(Comparator.naturalOrder()).orElse(BigDecimal.ZERO))
                            .maxPercentage(percentages.stream().max(Comparator.naturalOrder()).orElse(BigDecimal.ZERO))
                            .build();
                })
                .sorted(Comparator.comparing(SubjectPerformance::getSubject))
                .toList();
    }

    // ─── Top Performers ─────────────────────────────────────────────────

    @Cacheable(value = "analytics-overview", key = "'top-school-' + #institutionId + '-' + #limit")
    public List<TopPerformer> getTopPerformers(Long institutionId, int limit) {
        log.debug("Computing top {} performers for institution {}", limit, institutionId);

        List<MeritScore> scores = getLatestScoresForInstitution(institutionId);
        return scores.stream()
                .sorted(Comparator.comparing(MeritScore::getCompositeScore).reversed())
                .limit(limit)
                .map(this::toTopPerformer)
                .toList();
    }

    @Cacheable(value = "analytics-overview", key = "'top-platform-' + #limit")
    public List<TopPerformer> getPlatformTopPerformers(int limit) {
        List<MeritScore> scores = getLatestScoresPerStudent(meritScoreRepository.findAllWithStudentAndInstitution());
        return scores.stream()
                .sorted(Comparator.comparing(MeritScore::getCompositeScore).reversed())
                .limit(limit)
                .map(this::toTopPerformer)
                .toList();
    }

    // ─── Attendance Trends ──────────────────────────────────────────────

    @Cacheable(value = "analytics-trends", key = "'attendance-school-' + #institutionId + '-' + #academicYear")
    public List<AttendanceTrend> getAttendanceTrends(Long institutionId, String academicYear) {
        log.debug("Computing attendance trends for institution {} year {}", institutionId, academicYear);

        List<AttendanceRecord> records = attendanceRecordRepository.findByInstitutionIdAndAcademicYear(institutionId, academicYear);
        return buildAttendanceTrends(records);
    }

    public List<AttendanceTrend> getStudentAttendanceTrends(Long studentId) {
        List<AttendanceRecord> records = attendanceRecordRepository.findByStudentId(studentId);
        return buildAttendanceTrends(records);
    }

    private List<AttendanceTrend> buildAttendanceTrends(List<AttendanceRecord> records) {
        return records.stream()
                .collect(Collectors.groupingBy(AttendanceRecord::getMonth))
                .entrySet().stream()
                .map(entry -> {
                    List<AttendanceRecord> monthRecords = entry.getValue();
                    BigDecimal avgPercent = monthRecords.stream()
                            .map(r -> BigDecimal.valueOf(r.getDaysPresent())
                                    .multiply(BigDecimal.valueOf(100))
                                    .divide(BigDecimal.valueOf(r.getTotalDays()), 2, RoundingMode.HALF_UP))
                            .reduce(BigDecimal.ZERO, BigDecimal::add)
                            .divide(BigDecimal.valueOf(monthRecords.size()), 2, RoundingMode.HALF_UP);
                    return AttendanceTrend.builder()
                            .month(entry.getKey())
                            .avgAttendancePercent(avgPercent)
                            .totalStudents(monthRecords.size())
                            .build();
                })
                .sorted(Comparator.comparing(AttendanceTrend::getMonth))
                .toList();
    }

    // ─── Score Distribution Histogram ───────────────────────────────────

    @Cacheable(value = "analytics-distribution", key = "'histogram-school-' + #institutionId")
    public List<ScoreHistogramBucket> getScoreHistogram(Long institutionId) {
        List<MeritScore> scores = getLatestScoresForInstitution(institutionId);
        return buildHistogram(scores);
    }

    @Cacheable(value = "analytics-distribution", key = "'histogram-platform'")
    public List<ScoreHistogramBucket> getPlatformScoreHistogram() {
        List<MeritScore> scores = getLatestScoresPerStudent(meritScoreRepository.findAllWithStudentAndInstitution());
        return buildHistogram(scores);
    }

    private List<ScoreHistogramBucket> buildHistogram(List<MeritScore> scores) {
        // Create buckets: <-2, -2 to -1, -1 to 0, 0 to 1, 1 to 2, >2
        String[] labels = {"< -2.0", "-2.0 to -1.0", "-1.0 to 0.0", "0.0 to 1.0", "1.0 to 2.0", "> 2.0"};
        long[] counts = new long[6];

        for (MeritScore ms : scores) {
            double v = ms.getCompositeScore().doubleValue();
            if (v < -2.0) counts[0]++;
            else if (v < -1.0) counts[1]++;
            else if (v < 0.0) counts[2]++;
            else if (v < 1.0) counts[3]++;
            else if (v < 2.0) counts[4]++;
            else counts[5]++;
        }

        List<ScoreHistogramBucket> buckets = new ArrayList<>();
        for (int i = 0; i < labels.length; i++) {
            buckets.add(ScoreHistogramBucket.builder().range(labels[i]).count(counts[i]).build());
        }
        return buckets;
    }

    // ─── Institution Comparison (Gov/System Admin) ──────────────────────

    @Cacheable(value = "analytics-distribution", key = "'institution-comparison'")
    public List<InstitutionComparison> getInstitutionComparison() {
        log.debug("Computing cross-institution comparison");

        List<MeritScore> allScores = getLatestScoresPerStudent(meritScoreRepository.findAllWithStudentAndInstitution());
        return allScores.stream()
                .collect(Collectors.groupingBy(ms -> ms.getStudent().getInstitution()))
                .entrySet().stream()
                .map(entry -> {
                    Institution inst = entry.getKey();
                    List<MeritScore> instScores = entry.getValue();
                    return InstitutionComparison.builder()
                            .institutionId(inst.getId())
                            .institutionName(inst.getName())
                            .district(inst.getDistrict())
                            .state(inst.getState())
                            .studentCount(instScores.size())
                            .avgCompositeScore(avg(instScores, MeritScore::getCompositeScore))
                            .avgAcademicZScore(avg(instScores, MeritScore::getAcademicZScore))
                            .avgAttendanceZScore(avg(instScores, MeritScore::getAttendanceZScore))
                            .build();
                })
                .sorted(Comparator.comparing(InstitutionComparison::getAvgCompositeScore).reversed())
                .toList();
    }

    // ─── Student Performance Detail ─────────────────────────────────────

    public StudentPerformanceDetail getStudentPerformance(Long studentId, String academicYear) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // Get latest merit score
        List<MeritScore> scoreHistory = meritScoreRepository.findByStudentIdOrderByCreatedAtDesc(studentId);
        MeritScore latestScore = scoreHistory.isEmpty() ? null : scoreHistory.get(0);

        // Subject breakdown
        List<SubjectPerformance> subjectBreakdown = getStudentSubjectPerformance(studentId, academicYear);

        // Score history across years
        List<ScoreHistory> history = scoreHistory.stream()
                .map(ms -> ScoreHistory.builder()
                        .academicYear(ms.getAcademicYear())
                        .compositeScore(ms.getCompositeScore())
                        .academicZScore(ms.getAcademicZScore())
                        .attendanceZScore(ms.getAttendanceZScore())
                        .activityZScore(ms.getActivityZScore())
                        .certificateZScore(ms.getCertificateZScore())
                        .rankSchool(ms.getRankSchool())
                        .build())
                .toList();

        return StudentPerformanceDetail.builder()
                .studentId(student.getId())
                .enrollmentNumber(student.getEnrollmentNumber())
                .studentName(student.getFirstName() + " " + student.getLastName())
                .grade(student.getGrade())
                .institutionName(student.getInstitution().getName())
                .compositeScore(latestScore != null ? latestScore.getCompositeScore() : null)
                .rankSchool(latestScore != null ? latestScore.getRankSchool() : null)
                .academicZScore(latestScore != null ? latestScore.getAcademicZScore() : null)
                .attendanceZScore(latestScore != null ? latestScore.getAttendanceZScore() : null)
                .activityZScore(latestScore != null ? latestScore.getActivityZScore() : null)
                .certificateZScore(latestScore != null ? latestScore.getCertificateZScore() : null)
                .subjectBreakdown(subjectBreakdown)
                .scoreHistory(history)
                .build();
    }

    // ─── Cache Eviction ─────────────────────────────────────────────────

    @CacheEvict(value = {"analytics-overview", "analytics-trends", "analytics-distribution"}, allEntries = true)
    public void evictAllCaches() {
        log.info("Evicted all analytics caches");
    }

    // ─── Helpers ────────────────────────────────────────────────────────

    private List<MeritScore> getLatestScoresForInstitution(Long institutionId) {
        // Get all scores, filter by institution, keep only latest per student
        return meritScoreRepository.findAllWithStudentAndInstitution().stream()
                .filter(ms -> ms.getStudent().getInstitution().getId().equals(institutionId))
                .collect(Collectors.groupingBy(ms -> ms.getStudent().getId()))
                .values().stream()
                .map(studentScores -> studentScores.stream()
                        .max(Comparator.comparing(MeritScore::getCreatedAt))
                        .orElseThrow())
                .toList();
    }

    private TopPerformer toTopPerformer(MeritScore ms) {
        Student s = ms.getStudent();
        return TopPerformer.builder()
                .studentId(s.getId())
                .enrollmentNumber(s.getEnrollmentNumber())
                .studentName(s.getFirstName() + " " + s.getLastName())
                .grade(s.getGrade())
                .institutionName(s.getInstitution().getName())
                .compositeScore(ms.getCompositeScore())
                .rankSchool(ms.getRankSchool())
                .rankDistrict(ms.getRankDistrict())
                .rankState(ms.getRankState())
                .build();
    }

    private BigDecimal avg(List<MeritScore> scores, java.util.function.Function<MeritScore, BigDecimal> extractor) {
        if (scores.isEmpty()) return BigDecimal.ZERO;
        return scores.stream()
                .map(extractor)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(scores.size()), 4, RoundingMode.HALF_UP);
    }

    private List<MeritScore> getLatestScoresPerStudent(List<MeritScore> scores) {
        return scores.stream()
                .collect(Collectors.groupingBy(ms -> ms.getStudent().getId()))
                .values().stream()
                .map(studentScores -> studentScores.stream()
                        .max(Comparator.comparing(MeritScore::getCreatedAt))
                        .orElseThrow())
                .toList();
    }
}

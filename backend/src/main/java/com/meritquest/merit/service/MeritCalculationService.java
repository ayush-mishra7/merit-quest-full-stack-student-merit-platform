package com.meritquest.merit.service;

import com.meritquest.common.exception.ResourceNotFoundException;
import com.meritquest.common.model.VerificationStatus;
import com.meritquest.merit.dto.BatchResponse;
import com.meritquest.merit.dto.MeritCalculationRequest;
import com.meritquest.merit.dto.MeritScoreResponse;
import com.meritquest.merit.entity.MeritCalculationBatch;
import com.meritquest.merit.entity.MeritScore;
import com.meritquest.merit.repository.MeritCalculationBatchRepository;
import com.meritquest.merit.repository.MeritScoreRepository;
import com.meritquest.student.entity.*;
import com.meritquest.student.repository.*;
import com.meritquest.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MeritCalculationService {

    private final MeritScoreRepository meritScoreRepository;
    private final MeritCalculationBatchRepository batchRepository;
    private final MeritConfigService configService;
    private final StudentRepository studentRepository;
    private final AcademicRecordRepository academicRecordRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final ActivityRepository activityRepository;
    private final CertificateRepository certificateRepository;

    private static final MathContext MC = new MathContext(10, RoundingMode.HALF_UP);
    private static final int SCALE = 6;

    /**
     * Trigger a merit calculation. Creates the batch and kicks off async processing.
     */
    @Transactional
    public BatchResponse triggerCalculation(MeritCalculationRequest request, User currentUser) {
        MeritCalculationBatch batch = MeritCalculationBatch.builder()
                .scope(request.getScope())
                .scopeId(resolveScopeId(request, currentUser))
                .academicYear(request.getAcademicYear())
                .status("PENDING")
                .triggeredBy(currentUser)
                .build();

        batch = batchRepository.save(batch);
        runCalculationAsync(batch.getId());
        return toBatchResponse(batch);
    }

    /**
     * Async pipeline: fetch approved students → Z-score → composite → rank
     */
    @Async("meritCalculationExecutor")
    public void runCalculationAsync(Long batchId) {
        MeritCalculationBatch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found: " + batchId));

        try {
            batch.setStatus("RUNNING");
            batch.setStartedAt(LocalDateTime.now());
            batchRepository.save(batch);

            // Step 1: Fetch APPROVED students for the scope
            List<Student> students = fetchApprovedStudents(batch);
            batch.setTotalStudents(students.size());
            batchRepository.save(batch);

            if (students.isEmpty()) {
                batch.setStatus("COMPLETED");
                batch.setCompletedAt(LocalDateTime.now());
                batchRepository.save(batch);
                return;
            }

            List<Long> studentIds = students.stream().map(Student::getId).collect(Collectors.toList());

            // Step 2: Calculate raw scores per component
            Map<Long, BigDecimal> academicRaw = calculateAcademicRaw(studentIds, batch.getAcademicYear());
            Map<Long, BigDecimal> attendanceRaw = calculateAttendanceRaw(studentIds, batch.getAcademicYear());
            Map<Long, BigDecimal> activityRaw = calculateActivityRaw(studentIds);
            Map<Long, BigDecimal> certificateRaw = calculateCertificateRaw(studentIds);

            // Step 3: Z-score normalize each component
            Map<Long, BigDecimal> academicZ = zScoreNormalize(academicRaw);
            Map<Long, BigDecimal> attendanceZ = zScoreNormalize(attendanceRaw);
            Map<Long, BigDecimal> activityZ = zScoreNormalize(activityRaw);
            Map<Long, BigDecimal> certificateZ = zScoreNormalize(certificateRaw);

            // Step 4: Weighted composite score
            Map<String, BigDecimal> weights = configService.getWeights();
            BigDecimal wAcademic = weights.getOrDefault("weight.academics", new BigDecimal("0.5"));
            BigDecimal wAttendance = weights.getOrDefault("weight.attendance", new BigDecimal("0.2"));
            BigDecimal wActivity = weights.getOrDefault("weight.activities", new BigDecimal("0.2"));
            BigDecimal wCertificate = weights.getOrDefault("weight.certificates", new BigDecimal("0.1"));

            // Delete old scores for this batch (in case of re-run)
            meritScoreRepository.deleteByBatchId(batchId);

            List<MeritScore> scores = new ArrayList<>();
            for (Student student : students) {
                Long sid = student.getId();
                BigDecimal aZ = academicZ.getOrDefault(sid, BigDecimal.ZERO);
                BigDecimal atZ = attendanceZ.getOrDefault(sid, BigDecimal.ZERO);
                BigDecimal acZ = activityZ.getOrDefault(sid, BigDecimal.ZERO);
                BigDecimal cZ = certificateZ.getOrDefault(sid, BigDecimal.ZERO);

                BigDecimal composite = aZ.multiply(wAcademic, MC)
                        .add(atZ.multiply(wAttendance, MC))
                        .add(acZ.multiply(wActivity, MC))
                        .add(cZ.multiply(wCertificate, MC))
                        .setScale(SCALE, RoundingMode.HALF_UP);

                MeritScore score = MeritScore.builder()
                        .student(student)
                        .batch(batch)
                        .academicYear(batch.getAcademicYear())
                        .academicZScore(aZ.setScale(SCALE, RoundingMode.HALF_UP))
                        .attendanceZScore(atZ.setScale(SCALE, RoundingMode.HALF_UP))
                        .activityZScore(acZ.setScale(SCALE, RoundingMode.HALF_UP))
                        .certificateZScore(cZ.setScale(SCALE, RoundingMode.HALF_UP))
                        .compositeScore(composite)
                        .build();

                scores.add(score);
                batch.setProcessed(batch.getProcessed() + 1);
            }

            // Save all scores
            meritScoreRepository.saveAll(scores);

            // Step 5: Assign rankings
            assignRankings(batchId);

            batch.setStatus("COMPLETED");
            batch.setCompletedAt(LocalDateTime.now());
            batchRepository.save(batch);

            log.info("Merit calculation completed for batch {} — {} students processed", batchId, students.size());

        } catch (Exception e) {
            log.error("Merit calculation failed for batch {}", batchId, e);
            batch.setStatus("FAILED");
            batch.setErrorMessage(e.getMessage());
            batch.setCompletedAt(LocalDateTime.now());
            batchRepository.save(batch);
        }
    }

    // ---- Data fetch methods ----

    private List<Student> fetchApprovedStudents(MeritCalculationBatch batch) {
        // Fetch all students, then filter in-memory by scope + verification status
        List<Student> all;
        switch (batch.getScope()) {
            case "SCHOOL":
                Long institutionId = Long.parseLong(batch.getScopeId());
                all = studentRepository.findAll().stream()
                        .filter(s -> s.getInstitution().getId().equals(institutionId))
                        .collect(Collectors.toList());
                break;
            case "DISTRICT":
                String district = batch.getScopeId();
                all = studentRepository.findAll().stream()
                        .filter(s -> district.equalsIgnoreCase(s.getInstitution().getDistrict()))
                        .collect(Collectors.toList());
                break;
            case "STATE":
                String state = batch.getScopeId();
                all = studentRepository.findAll().stream()
                        .filter(s -> state.equalsIgnoreCase(s.getInstitution().getState()))
                        .collect(Collectors.toList());
                break;
            default:
                all = List.of();
        }

        return all.stream()
                .filter(s -> s.getActive() && s.getVerificationStatus() == VerificationStatus.APPROVED)
                .collect(Collectors.toList());
    }

    /**
     * Academic raw: average percentage across all subjects for the year.
     */
    private Map<Long, BigDecimal> calculateAcademicRaw(List<Long> studentIds, String academicYear) {
        Map<Long, BigDecimal> result = new HashMap<>();
        for (Long sid : studentIds) {
            List<AcademicRecord> records = academicRecordRepository.findByStudentIdAndAcademicYear(sid, academicYear);
            if (records.isEmpty()) {
                result.put(sid, BigDecimal.ZERO);
                continue;
            }
            BigDecimal totalPct = BigDecimal.ZERO;
            for (AcademicRecord r : records) {
                if (r.getMaxMarks().compareTo(BigDecimal.ZERO) > 0) {
                    BigDecimal pct = r.getMarksObtained()
                            .divide(r.getMaxMarks(), SCALE, RoundingMode.HALF_UP)
                            .multiply(new BigDecimal("100"));
                    totalPct = totalPct.add(pct);
                }
            }
            result.put(sid, totalPct.divide(new BigDecimal(records.size()), SCALE, RoundingMode.HALF_UP));
        }
        return result;
    }

    /**
     * Attendance raw: overall attendance percentage for the year.
     */
    private Map<Long, BigDecimal> calculateAttendanceRaw(List<Long> studentIds, String academicYear) {
        Map<Long, BigDecimal> result = new HashMap<>();
        for (Long sid : studentIds) {
            List<AttendanceRecord> records = attendanceRecordRepository.findByStudentId(sid).stream()
                    .filter(r -> academicYear.equals(r.getAcademicYear()))
                    .collect(Collectors.toList());
            if (records.isEmpty()) {
                result.put(sid, BigDecimal.ZERO);
                continue;
            }
            int totalDays = records.stream().mapToInt(AttendanceRecord::getTotalDays).sum();
            int presentDays = records.stream().mapToInt(AttendanceRecord::getDaysPresent).sum();
            if (totalDays == 0) {
                result.put(sid, BigDecimal.ZERO);
            } else {
                BigDecimal pct = new BigDecimal(presentDays)
                        .divide(new BigDecimal(totalDays), SCALE, RoundingMode.HALF_UP)
                        .multiply(new BigDecimal("100"));
                result.put(sid, pct);
            }
        }
        return result;
    }

    /**
     * Activity raw: count of activities (more activities = higher score).
     */
    private Map<Long, BigDecimal> calculateActivityRaw(List<Long> studentIds) {
        Map<Long, BigDecimal> result = new HashMap<>();
        for (Long sid : studentIds) {
            List<Activity> activities = activityRepository.findByStudentId(sid);
            result.put(sid, new BigDecimal(activities.size()));
        }
        return result;
    }

    /**
     * Certificate raw: count of certificates.
     */
    private Map<Long, BigDecimal> calculateCertificateRaw(List<Long> studentIds) {
        Map<Long, BigDecimal> result = new HashMap<>();
        for (Long sid : studentIds) {
            List<Certificate> certs = certificateRepository.findByStudentId(sid);
            result.put(sid, new BigDecimal(certs.size()));
        }
        return result;
    }

    /**
     * Z-score normalization: z = (x - μ) / σ
     * When σ = 0 (all values identical), returns 0 for all.
     */
    private Map<Long, BigDecimal> zScoreNormalize(Map<Long, BigDecimal> raw) {
        Map<Long, BigDecimal> result = new HashMap<>();
        if (raw.isEmpty()) return result;

        // Calculate mean
        BigDecimal sum = raw.values().stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal count = new BigDecimal(raw.size());
        BigDecimal mean = sum.divide(count, SCALE, RoundingMode.HALF_UP);

        // Calculate standard deviation
        BigDecimal varianceSum = raw.values().stream()
                .map(x -> x.subtract(mean).pow(2))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal variance = varianceSum.divide(count, SCALE, RoundingMode.HALF_UP);
        BigDecimal stdDev = BigDecimal.valueOf(Math.sqrt(variance.doubleValue()))
                .setScale(SCALE, RoundingMode.HALF_UP);

        // If stdDev is 0, all values are the same → z-score = 0
        if (stdDev.compareTo(BigDecimal.ZERO) == 0) {
            raw.keySet().forEach(k -> result.put(k, BigDecimal.ZERO));
            return result;
        }

        for (Map.Entry<Long, BigDecimal> entry : raw.entrySet()) {
            BigDecimal z = entry.getValue().subtract(mean)
                    .divide(stdDev, SCALE, RoundingMode.HALF_UP);
            result.put(entry.getKey(), z);
        }

        return result;
    }

    /**
     * Assign school, district, and state rankings based on composite score.
     */
    @Transactional
    public void assignRankings(Long batchId) {
        List<MeritScore> scores = meritScoreRepository.findAllByBatchIdOrdered(batchId);

        // School rankings — group by institution, rank within each group
        Map<Long, List<MeritScore>> bySchool = scores.stream()
                .collect(Collectors.groupingBy(ms -> ms.getStudent().getInstitution().getId()));
        for (List<MeritScore> schoolScores : bySchool.values()) {
            schoolScores.sort(Comparator.comparing(MeritScore::getCompositeScore).reversed());
            for (int i = 0; i < schoolScores.size(); i++) {
                schoolScores.get(i).setRankSchool(i + 1);
            }
        }

        // District rankings — group by district
        Map<String, List<MeritScore>> byDistrict = scores.stream()
                .collect(Collectors.groupingBy(ms -> ms.getStudent().getInstitution().getDistrict()));
        for (List<MeritScore> districtScores : byDistrict.values()) {
            districtScores.sort(Comparator.comparing(MeritScore::getCompositeScore).reversed());
            for (int i = 0; i < districtScores.size(); i++) {
                districtScores.get(i).setRankDistrict(i + 1);
            }
        }

        // State rankings — group by state
        Map<String, List<MeritScore>> byState = scores.stream()
                .collect(Collectors.groupingBy(ms -> ms.getStudent().getInstitution().getState()));
        for (List<MeritScore> stateScores : byState.values()) {
            stateScores.sort(Comparator.comparing(MeritScore::getCompositeScore).reversed());
            for (int i = 0; i < stateScores.size(); i++) {
                stateScores.get(i).setRankState(i + 1);
            }
        }

        meritScoreRepository.saveAll(scores);
    }

    // ---- Query methods ----

    @Transactional(readOnly = true)
    public Page<MeritScoreResponse> getMeritList(Long batchId, Long institutionId, Pageable pageable) {
        Page<MeritScore> page;
        if (institutionId != null) {
            page = meritScoreRepository.findByBatchIdAndInstitution(batchId, institutionId, pageable);
        } else {
            page = meritScoreRepository.findByBatchId(batchId, pageable);
        }
        return page.map(this::toScoreResponse);
    }

    @Transactional(readOnly = true)
    public Page<MeritScoreResponse> getMeritListByYear(String year, String scope, String scopeId, Pageable pageable) {
        Page<MeritScore> page;
        switch (scope.toUpperCase()) {
            case "SCHOOL":
                page = meritScoreRepository.findByYearAndInstitution(year, Long.parseLong(scopeId), pageable);
                break;
            case "DISTRICT":
                page = meritScoreRepository.findByYearAndDistrict(year, scopeId, pageable);
                break;
            case "STATE":
                page = meritScoreRepository.findByYearAndState(year, scopeId, pageable);
                break;
            default:
                page = Page.empty();
        }
        return page.map(this::toScoreResponse);
    }

    @Transactional(readOnly = true)
    public List<MeritScoreResponse> getStudentScoreHistory(Long studentId) {
        return meritScoreRepository.findByStudentIdOrderByCreatedAtDesc(studentId)
                .stream()
                .map(this::toScoreResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BatchResponse getBatch(Long batchId) {
        MeritCalculationBatch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found: " + batchId));
        return toBatchResponse(batch);
    }

    @Transactional(readOnly = true)
    public Page<BatchResponse> getBatches(Pageable pageable) {
        return batchRepository.findByOrderByCreatedAtDesc(pageable)
                .map(this::toBatchResponse);
    }

    // ---- Helpers ----

    private String resolveScopeId(MeritCalculationRequest request, User currentUser) {
        if ("SCHOOL".equals(request.getScope())) {
            // Use the scopeId if provided, otherwise default to current user's institution
            if (request.getScopeId() != null && !request.getScopeId().isBlank()) {
                return request.getScopeId();
            }
            return String.valueOf(currentUser.getInstitution().getId());
        }
        return request.getScopeId();
    }

    private MeritScoreResponse toScoreResponse(MeritScore ms) {
        Student s = ms.getStudent();
        return MeritScoreResponse.builder()
                .id(ms.getId())
                .studentId(s.getId())
                .enrollmentNumber(s.getEnrollmentNumber())
                .studentName(s.getFirstName() + " " + s.getLastName())
                .grade(s.getGrade())
                .section(s.getSection())
                .institutionName(s.getInstitution().getName())
                .academicZScore(ms.getAcademicZScore())
                .attendanceZScore(ms.getAttendanceZScore())
                .activityZScore(ms.getActivityZScore())
                .certificateZScore(ms.getCertificateZScore())
                .compositeScore(ms.getCompositeScore())
                .rankSchool(ms.getRankSchool())
                .rankDistrict(ms.getRankDistrict())
                .rankState(ms.getRankState())
                .academicYear(ms.getAcademicYear())
                .batchId(ms.getBatch().getId())
                .calculatedAt(ms.getCreatedAt())
                .build();
    }

    private BatchResponse toBatchResponse(MeritCalculationBatch b) {
        return BatchResponse.builder()
                .id(b.getId())
                .scope(b.getScope())
                .scopeId(b.getScopeId())
                .academicYear(b.getAcademicYear())
                .status(b.getStatus())
                .totalStudents(b.getTotalStudents())
                .processed(b.getProcessed())
                .errorMessage(b.getErrorMessage())
                .triggeredByName(b.getTriggeredBy() != null
                        ? b.getTriggeredBy().getFirstName() + " " + b.getTriggeredBy().getLastName()
                        : null)
                .startedAt(b.getStartedAt())
                .completedAt(b.getCompletedAt())
                .createdAt(b.getCreatedAt())
                .build();
    }
}

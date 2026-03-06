package com.meritquest.verification.service;

import com.meritquest.audit.service.AuditLogService;
import com.meritquest.common.exception.ResourceNotFoundException;
import com.meritquest.common.model.RecordType;
import com.meritquest.common.model.VerificationStatus;
import com.meritquest.notification.NotificationService;
import com.meritquest.student.entity.Student;
import com.meritquest.student.repository.StudentRepository;
import com.meritquest.user.entity.Institution;
import com.meritquest.user.entity.User;
import com.meritquest.user.repository.InstitutionRepository;
import com.meritquest.verification.dto.VerificationDecisionRequest;
import com.meritquest.verification.dto.VerificationItemResponse;
import com.meritquest.verification.entity.VerificationItem;
import com.meritquest.verification.repository.VerificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class VerificationService {

    private final VerificationRepository verificationRepository;
    private final StudentRepository studentRepository;
    private final InstitutionRepository institutionRepository;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    /**
     * Create a verification queue entry for a newly created/uploaded record.
     */
    @Transactional
    public void submitForVerification(RecordType recordType, Long recordId, User submittedBy, Long institutionId) {
        Institution institution = institutionRepository.findById(institutionId)
                .orElseThrow(() -> new ResourceNotFoundException("Institution not found: " + institutionId));

        VerificationItem item = VerificationItem.builder()
                .recordType(recordType)
                .recordId(recordId)
                .status(VerificationStatus.PENDING_VERIFICATION)
                .submittedBy(submittedBy)
                .institution(institution)
                .build();
        verificationRepository.save(item);

        log.debug("Submitted {} #{} for verification (institution {})", recordType, recordId, institutionId);
    }

    @Transactional(readOnly = true)
    public Page<VerificationItemResponse> getQueue(Long institutionId, VerificationStatus status, Pageable pageable) {
        Page<VerificationItem> page;
        if (institutionId != null && status != null) {
            page = verificationRepository.findByInstitutionIdAndStatus(institutionId, status, pageable);
        } else if (status != null) {
            page = verificationRepository.findByStatus(status, pageable);
        } else if (institutionId != null) {
            page = verificationRepository.findByInstitutionId(institutionId, pageable);
        } else {
            page = verificationRepository.findByStatus(VerificationStatus.PENDING_VERIFICATION, pageable);
        }
        return page.map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public VerificationItemResponse getItem(Long id) {
        return toResponse(verificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Verification item not found: " + id)));
    }

    @Transactional
    public VerificationItemResponse decide(Long id, VerificationDecisionRequest request, User reviewer, String ipAddress) {
        VerificationItem item = verificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Verification item not found: " + id));

        if (item.getStatus() != VerificationStatus.PENDING_VERIFICATION) {
            throw new IllegalStateException("Item has already been reviewed");
        }

        VerificationStatus newStatus = request.getApproved()
                ? VerificationStatus.APPROVED
                : VerificationStatus.REJECTED;

        item.setStatus(newStatus);
        item.setReviewer(reviewer);
        item.setComment(request.getComment());
        item.setReviewedAt(LocalDateTime.now());
        verificationRepository.save(item);

        // Update the underlying record status
        updateRecordStatus(item.getRecordType(), item.getRecordId(), newStatus);

        // Audit log
        auditLogService.log(
                request.getApproved() ? "VERIFY_APPROVE" : "VERIFY_REJECT",
                item.getRecordType().name(),
                item.getRecordId(),
                reviewer,
                ipAddress,
                Map.of("comment", request.getComment() != null ? request.getComment() : "",
                       "verificationItemId", item.getId())
        );

        // Notify submitter
        notificationService.notifyVerificationStatusChange(
                item.getSubmittedBy(),
                item.getRecordType().name(),
                item.getRecordId(),
                newStatus.name(),
                request.getComment()
        );

        log.info("Verification item #{} {} by {}", id, newStatus, reviewer.getEmail());
        return toResponse(item);
    }

    private void updateRecordStatus(RecordType recordType, Long recordId, VerificationStatus status) {
        if (recordType == RecordType.STUDENT) {
            Student student = studentRepository.findById(recordId).orElse(null);
            if (student != null) {
                student.setVerificationStatus(status);
                studentRepository.save(student);
            }
        }
        // Other record types can be handled as they get verification_status columns
    }

    private VerificationItemResponse toResponse(VerificationItem v) {
        String recordSummary = buildRecordSummary(v.getRecordType(), v.getRecordId());
        return VerificationItemResponse.builder()
                .id(v.getId())
                .recordType(v.getRecordType())
                .recordId(v.getRecordId())
                .status(v.getStatus())
                .reviewerName(v.getReviewer() != null
                        ? v.getReviewer().getFirstName() + " " + v.getReviewer().getLastName() : null)
                .comment(v.getComment())
                .institutionId(v.getInstitution().getId())
                .institutionName(v.getInstitution().getName())
                .submittedByName(v.getSubmittedBy().getFirstName() + " " + v.getSubmittedBy().getLastName())
                .recordSummary(recordSummary)
                .reviewedAt(v.getReviewedAt())
                .createdAt(v.getCreatedAt())
                .build();
    }

    private String buildRecordSummary(RecordType type, Long id) {
        if (type == RecordType.STUDENT) {
            return studentRepository.findById(id)
                    .map(s -> s.getEnrollmentNumber() + " — " + s.getFirstName() + " " + s.getLastName())
                    .orElse("Student #" + id);
        }
        return type.name() + " #" + id;
    }
}

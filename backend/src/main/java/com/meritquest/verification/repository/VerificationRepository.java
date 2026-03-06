package com.meritquest.verification.repository;

import com.meritquest.common.model.RecordType;
import com.meritquest.common.model.VerificationStatus;
import com.meritquest.verification.entity.VerificationItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VerificationRepository extends JpaRepository<VerificationItem, Long> {
    Page<VerificationItem> findByInstitutionIdAndStatus(Long institutionId, VerificationStatus status, Pageable pageable);
    Page<VerificationItem> findByInstitutionId(Long institutionId, Pageable pageable);
    Page<VerificationItem> findByStatus(VerificationStatus status, Pageable pageable);
    List<VerificationItem> findByRecordTypeAndRecordId(RecordType recordType, Long recordId);
}

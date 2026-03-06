package com.meritquest.merit.repository;

import com.meritquest.merit.entity.MeritCalculationBatch;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MeritCalculationBatchRepository extends JpaRepository<MeritCalculationBatch, Long> {

    Page<MeritCalculationBatch> findByOrderByCreatedAtDesc(Pageable pageable);

    List<MeritCalculationBatch> findByScopeAndScopeIdAndAcademicYearOrderByCreatedAtDesc(
            String scope, String scopeId, String academicYear);

    List<MeritCalculationBatch> findByStatus(String status);
}

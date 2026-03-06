package com.meritquest.merit.repository;

import com.meritquest.merit.entity.MeritScore;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MeritScoreRepository extends JpaRepository<MeritScore, Long> {

    Page<MeritScore> findByBatchId(Long batchId, Pageable pageable);

    @Query("SELECT ms FROM MeritScore ms JOIN ms.student s " +
           "WHERE ms.batch.id = :batchId AND s.institution.id = :institutionId " +
           "ORDER BY ms.compositeScore DESC")
    Page<MeritScore> findByBatchIdAndInstitution(@Param("batchId") Long batchId,
                                                  @Param("institutionId") Long institutionId,
                                                  Pageable pageable);

    @Query("SELECT ms FROM MeritScore ms JOIN ms.student s " +
           "WHERE ms.academicYear = :year AND s.institution.id = :institutionId " +
           "ORDER BY ms.compositeScore DESC")
    Page<MeritScore> findByYearAndInstitution(@Param("year") String year,
                                               @Param("institutionId") Long institutionId,
                                               Pageable pageable);

    @Query("SELECT ms FROM MeritScore ms JOIN ms.student s " +
           "WHERE ms.academicYear = :year AND s.institution.district = :district " +
           "ORDER BY ms.compositeScore DESC")
    Page<MeritScore> findByYearAndDistrict(@Param("year") String year,
                                            @Param("district") String district,
                                            Pageable pageable);

    @Query("SELECT ms FROM MeritScore ms JOIN ms.student s " +
           "WHERE ms.academicYear = :year AND s.institution.state = :state " +
           "ORDER BY ms.compositeScore DESC")
    Page<MeritScore> findByYearAndState(@Param("year") String year,
                                         @Param("state") String state,
                                         Pageable pageable);

    Optional<MeritScore> findByStudentIdAndBatchId(Long studentId, Long batchId);

    List<MeritScore> findByStudentIdOrderByCreatedAtDesc(Long studentId);

    void deleteByBatchId(Long batchId);

    @Query("SELECT ms FROM MeritScore ms " +
           "WHERE ms.batch.id = :batchId " +
           "ORDER BY ms.compositeScore DESC")
    List<MeritScore> findAllByBatchIdOrdered(@Param("batchId") Long batchId);
}

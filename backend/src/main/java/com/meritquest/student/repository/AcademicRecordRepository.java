package com.meritquest.student.repository;

import com.meritquest.student.entity.AcademicRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AcademicRecordRepository extends JpaRepository<AcademicRecord, Long> {
    List<AcademicRecord> findByStudentId(Long studentId);
    List<AcademicRecord> findByStudentIdAndAcademicYear(Long studentId, String academicYear);
    List<AcademicRecord> findByInstitutionIdAndAcademicYear(Long institutionId, String academicYear);
}

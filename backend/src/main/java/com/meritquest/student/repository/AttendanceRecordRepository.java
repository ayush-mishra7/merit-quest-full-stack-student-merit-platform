package com.meritquest.student.repository;

import com.meritquest.student.entity.AttendanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {
    List<AttendanceRecord> findByStudentId(Long studentId);
    List<AttendanceRecord> findByInstitutionIdAndAcademicYear(Long institutionId, String academicYear);
}

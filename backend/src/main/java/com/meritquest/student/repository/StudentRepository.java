package com.meritquest.student.repository;

import com.meritquest.student.entity.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {
    Page<Student> findByInstitutionId(Long institutionId, Pageable pageable);
    Page<Student> findByInstitutionIdAndGrade(Long institutionId, String grade, Pageable pageable);

    @Query("SELECT s FROM Student s WHERE s.institution.id = :instId " +
           "AND (LOWER(s.firstName) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "OR LOWER(s.lastName) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "OR LOWER(s.enrollmentNumber) LIKE LOWER(CONCAT('%', :q, '%')))")
    Page<Student> searchByInstitution(@Param("instId") Long institutionId, @Param("q") String query, Pageable pageable);

    @Query("SELECT s FROM Student s WHERE s.institution.id = :instId AND s.grade = :grade " +
           "AND (LOWER(s.firstName) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "OR LOWER(s.lastName) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "OR LOWER(s.enrollmentNumber) LIKE LOWER(CONCAT('%', :q, '%')))")
    Page<Student> searchByInstitutionAndGrade(@Param("instId") Long institutionId, @Param("grade") String grade, @Param("q") String query, Pageable pageable);
    Optional<Student> findByEnrollmentNumberAndInstitutionId(String enrollmentNumber, Long institutionId);
    boolean existsByEnrollmentNumberAndInstitutionId(String enrollmentNumber, Long institutionId);
    long countByInstitutionId(Long institutionId);
    Optional<Student> findByUserId(Long userId);
}

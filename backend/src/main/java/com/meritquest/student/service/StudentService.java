package com.meritquest.student.service;

import com.meritquest.common.exception.DuplicateResourceException;
import com.meritquest.common.exception.ResourceNotFoundException;
import com.meritquest.student.dto.StudentRequest;
import com.meritquest.student.dto.StudentResponse;
import com.meritquest.student.entity.Student;
import com.meritquest.student.repository.StudentRepository;
import com.meritquest.user.entity.Institution;
import com.meritquest.user.entity.User;
import com.meritquest.user.repository.InstitutionRepository;
import com.meritquest.common.model.RecordType;
import com.meritquest.verification.service.VerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final InstitutionRepository institutionRepository;
    private final VerificationService verificationService;

    @Transactional(readOnly = true)
    public Page<StudentResponse> getStudents(Long institutionId, String grade, Pageable pageable) {
        Page<Student> page;
        if (grade != null && !grade.isBlank()) {
            page = studentRepository.findByInstitutionIdAndGrade(institutionId, grade, pageable);
        } else {
            page = studentRepository.findByInstitutionId(institutionId, pageable);
        }
        return page.map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public StudentResponse getStudent(Long id, Long institutionId) {
        Student student = findByIdAndInstitution(id, institutionId);
        return toResponse(student);
    }

    @Transactional
    public StudentResponse createStudent(StudentRequest request, Long institutionId, User currentUser) {
        if (studentRepository.existsByEnrollmentNumberAndInstitutionId(request.getEnrollmentNumber(), institutionId)) {
            throw new DuplicateResourceException("Student with enrollment number " + request.getEnrollmentNumber() + " already exists");
        }

        Institution institution = institutionRepository.findById(institutionId)
                .orElseThrow(() -> new ResourceNotFoundException("Institution not found: " + institutionId));

        Student student = Student.builder()
                .enrollmentNumber(request.getEnrollmentNumber())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .dateOfBirth(request.getDateOfBirth())
                .gender(request.getGender())
                .grade(request.getGrade())
                .section(request.getSection())
                .guardianName(request.getGuardianName())
                .guardianPhone(request.getGuardianPhone())
                .guardianEmail(request.getGuardianEmail())
                .address(request.getAddress())
                .institution(institution)
                .build();

        Student saved = studentRepository.save(student);
        verificationService.submitForVerification(RecordType.STUDENT, saved.getId(), currentUser, institutionId);
        return toResponse(saved);
    }

    @Transactional
    public StudentResponse updateStudent(Long id, StudentRequest request, Long institutionId) {
        Student student = findByIdAndInstitution(id, institutionId);

        // check enrollment uniqueness if changed
        if (!student.getEnrollmentNumber().equals(request.getEnrollmentNumber())) {
            if (studentRepository.existsByEnrollmentNumberAndInstitutionId(request.getEnrollmentNumber(), institutionId)) {
                throw new DuplicateResourceException("Student with enrollment number " + request.getEnrollmentNumber() + " already exists");
            }
        }

        student.setEnrollmentNumber(request.getEnrollmentNumber());
        student.setFirstName(request.getFirstName());
        student.setLastName(request.getLastName());
        student.setDateOfBirth(request.getDateOfBirth());
        student.setGender(request.getGender());
        student.setGrade(request.getGrade());
        student.setSection(request.getSection());
        student.setGuardianName(request.getGuardianName());
        student.setGuardianPhone(request.getGuardianPhone());
        student.setGuardianEmail(request.getGuardianEmail());
        student.setAddress(request.getAddress());

        return toResponse(studentRepository.save(student));
    }

    @Transactional
    public void deleteStudent(Long id, Long institutionId) {
        Student student = findByIdAndInstitution(id, institutionId);
        student.setActive(false);
        studentRepository.save(student);
    }

    private Student findByIdAndInstitution(Long id, Long institutionId) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + id));
        if (!student.getInstitution().getId().equals(institutionId)) {
            throw new ResourceNotFoundException("Student not found: " + id);
        }
        return student;
    }

    private StudentResponse toResponse(Student s) {
        return StudentResponse.builder()
                .id(s.getId())
                .enrollmentNumber(s.getEnrollmentNumber())
                .firstName(s.getFirstName())
                .lastName(s.getLastName())
                .dateOfBirth(s.getDateOfBirth())
                .gender(s.getGender())
                .grade(s.getGrade())
                .section(s.getSection())
                .guardianName(s.getGuardianName())
                .guardianPhone(s.getGuardianPhone())
                .guardianEmail(s.getGuardianEmail())
                .address(s.getAddress())
                .institutionId(s.getInstitution().getId())
                .institutionName(s.getInstitution().getName())
                .active(s.getActive())
                .createdAt(s.getCreatedAt())
                .updatedAt(s.getUpdatedAt())
                .build();
    }
}

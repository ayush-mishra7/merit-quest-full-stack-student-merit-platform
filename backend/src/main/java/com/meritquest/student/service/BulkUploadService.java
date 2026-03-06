package com.meritquest.student.service;

import com.meritquest.common.exception.ResourceNotFoundException;
import com.meritquest.common.model.Gender;
import com.meritquest.common.model.RecordType;
import com.meritquest.common.model.UploadStatus;
import com.meritquest.common.model.UploadType;
import com.meritquest.student.dto.BulkUploadResponse;
import com.meritquest.student.entity.BulkUpload;
import com.meritquest.student.entity.Student;
import com.meritquest.student.repository.BulkUploadRepository;
import com.meritquest.student.repository.StudentRepository;
import com.meritquest.user.entity.Institution;
import com.meritquest.user.entity.User;
import com.meritquest.user.repository.InstitutionRepository;
import com.meritquest.verification.service.VerificationService;
import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvValidationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class BulkUploadService {

    private final BulkUploadRepository bulkUploadRepository;
    private final StudentRepository studentRepository;
    private final InstitutionRepository institutionRepository;
    private final VerificationService verificationService;

    private static final Set<String> REQUIRED_HEADERS = Set.of(
            "enrollment_number", "first_name", "last_name", "date_of_birth", "gender", "grade"
    );

    @Transactional
    public BulkUploadResponse initUpload(MultipartFile file, UploadType uploadType, User user, Long institutionId) {
        Institution institution = institutionRepository.findById(institutionId)
                .orElseThrow(() -> new ResourceNotFoundException("Institution not found: " + institutionId));

        BulkUpload upload = BulkUpload.builder()
                .fileName(file.getOriginalFilename())
                .uploadType(uploadType)
                .status(UploadStatus.PENDING)
                .uploadedBy(user)
                .institution(institution)
                .build();
        upload = bulkUploadRepository.save(upload);

        return toResponse(upload);
    }

    @Async
    @Transactional
    public void processStudentUpload(Long uploadId, MultipartFile file, Long institutionId) {
        BulkUpload upload = bulkUploadRepository.findById(uploadId)
                .orElseThrow(() -> new ResourceNotFoundException("Upload not found: " + uploadId));
        upload.setStatus(UploadStatus.PROCESSING);
        bulkUploadRepository.save(upload);

        Institution institution = institutionRepository.findById(institutionId)
                .orElseThrow(() -> new ResourceNotFoundException("Institution not found: " + institutionId));

        try {
            List<String[]> rows;
            String filename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "";
            if (filename.endsWith(".xlsx") || filename.endsWith(".xls")) {
                rows = parseExcel(file);
            } else {
                rows = parseCsv(file);
            }

            if (rows.isEmpty()) {
                upload.setStatus(UploadStatus.FAILED);
                upload.setErrorDetails(Map.of("error", "File is empty or has no data rows"));
                bulkUploadRepository.save(upload);
                return;
            }

            // First row = headers
            String[] headers = rows.get(0);
            Map<String, Integer> headerMap = new HashMap<>();
            for (int i = 0; i < headers.length; i++) {
                headerMap.put(headers[i].trim().toLowerCase().replace(" ", "_"), i);
            }

            // Validate headers
            for (String required : REQUIRED_HEADERS) {
                if (!headerMap.containsKey(required)) {
                    upload.setStatus(UploadStatus.FAILED);
                    upload.setErrorDetails(Map.of("error", "Missing required column: " + required));
                    bulkUploadRepository.save(upload);
                    return;
                }
            }

            List<Map<String, String>> errors = new ArrayList<>();
            int successCount = 0;
            int totalDataRows = rows.size() - 1;
            upload.setTotalRows(totalDataRows);

            for (int i = 1; i < rows.size(); i++) {
                String[] row = rows.get(i);
                int rowNum = i + 1;
                try {
                    String enrollment = getCell(row, headerMap, "enrollment_number");
                    String firstName = getCell(row, headerMap, "first_name");
                    String lastName = getCell(row, headerMap, "last_name");
                    String dobStr = getCell(row, headerMap, "date_of_birth");
                    String genderStr = getCell(row, headerMap, "gender");
                    String grade = getCell(row, headerMap, "grade");

                    // Validate required fields
                    List<String> fieldErrors = new ArrayList<>();
                    if (enrollment.isBlank()) fieldErrors.add("enrollment_number is required");
                    if (firstName.isBlank()) fieldErrors.add("first_name is required");
                    if (lastName.isBlank()) fieldErrors.add("last_name is required");
                    if (dobStr.isBlank()) fieldErrors.add("date_of_birth is required");
                    if (genderStr.isBlank()) fieldErrors.add("gender is required");
                    if (grade.isBlank()) fieldErrors.add("grade is required");

                    if (!fieldErrors.isEmpty()) {
                        errors.add(Map.of("row", String.valueOf(rowNum), "errors", String.join("; ", fieldErrors)));
                        continue;
                    }

                    // Parse date
                    LocalDate dob;
                    try {
                        dob = LocalDate.parse(dobStr);
                    } catch (DateTimeParseException e) {
                        errors.add(Map.of("row", String.valueOf(rowNum), "errors", "Invalid date format for date_of_birth (use YYYY-MM-DD)"));
                        continue;
                    }

                    // Parse gender
                    Gender gender;
                    try {
                        gender = Gender.valueOf(genderStr.toUpperCase().trim());
                    } catch (IllegalArgumentException e) {
                        errors.add(Map.of("row", String.valueOf(rowNum), "errors", "Invalid gender: " + genderStr + " (expected MALE, FEMALE, OTHER)"));
                        continue;
                    }

                    // Skip duplicate enrollment
                    if (studentRepository.existsByEnrollmentNumberAndInstitutionId(enrollment, institutionId)) {
                        errors.add(Map.of("row", String.valueOf(rowNum), "errors", "Duplicate enrollment number: " + enrollment));
                        continue;
                    }

                    Student student = Student.builder()
                            .enrollmentNumber(enrollment)
                            .firstName(firstName)
                            .lastName(lastName)
                            .dateOfBirth(dob)
                            .gender(gender)
                            .grade(grade)
                            .section(getCell(row, headerMap, "section"))
                            .guardianName(getCell(row, headerMap, "guardian_name"))
                            .guardianPhone(getCell(row, headerMap, "guardian_phone"))
                            .guardianEmail(getCell(row, headerMap, "guardian_email"))
                            .address(getCell(row, headerMap, "address"))
                            .institution(institution)
                            .build();

                    studentRepository.save(student);
                    verificationService.submitForVerification(
                            RecordType.STUDENT, student.getId(), upload.getUploadedBy(), institutionId);
                    successCount++;
                } catch (Exception e) {
                    errors.add(Map.of("row", String.valueOf(rowNum), "errors", "Unexpected error: " + e.getMessage()));
                }
            }

            upload.setSuccessRows(successCount);
            upload.setFailedRows(totalDataRows - successCount);
            upload.setStatus(UploadStatus.COMPLETED);
            if (!errors.isEmpty()) {
                upload.setErrorDetails(Map.of("rowErrors", errors));
            }
            bulkUploadRepository.save(upload);

            log.info("Bulk upload {} completed: {}/{} rows succeeded", uploadId, successCount, totalDataRows);

        } catch (Exception e) {
            log.error("Bulk upload {} failed", uploadId, e);
            upload.setStatus(UploadStatus.FAILED);
            upload.setErrorDetails(Map.of("error", "Processing failed: " + e.getMessage()));
            bulkUploadRepository.save(upload);
        }
    }

    @Transactional(readOnly = true)
    public Page<BulkUploadResponse> getUploads(Long institutionId, Pageable pageable) {
        return bulkUploadRepository.findByInstitutionIdOrderByCreatedAtDesc(institutionId, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public BulkUploadResponse getUpload(Long id) {
        return toResponse(bulkUploadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Upload not found: " + id)));
    }

    private List<String[]> parseCsv(MultipartFile file) throws IOException, CsvValidationException {
        List<String[]> rows = new ArrayList<>();
        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String[] line;
            while ((line = reader.readNext()) != null) {
                rows.add(line);
            }
        }
        return rows;
    }

    private List<String[]> parseExcel(MultipartFile file) throws IOException {
        List<String[]> rows = new ArrayList<>();
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            DataFormatter formatter = new DataFormatter();
            for (Row row : sheet) {
                String[] cells = new String[row.getLastCellNum()];
                for (int i = 0; i < row.getLastCellNum(); i++) {
                    Cell cell = row.getCell(i, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK);
                    cells[i] = formatter.formatCellValue(cell).trim();
                }
                rows.add(cells);
            }
        }
        return rows;
    }

    private String getCell(String[] row, Map<String, Integer> headerMap, String column) {
        Integer idx = headerMap.get(column);
        if (idx == null || idx >= row.length) return "";
        return row[idx].trim();
    }

    private BulkUploadResponse toResponse(BulkUpload u) {
        return BulkUploadResponse.builder()
                .id(u.getId())
                .fileName(u.getFileName())
                .uploadType(u.getUploadType())
                .status(u.getStatus())
                .totalRows(u.getTotalRows())
                .successRows(u.getSuccessRows())
                .failedRows(u.getFailedRows())
                .errorDetails(u.getErrorDetails())
                .createdAt(u.getCreatedAt())
                .build();
    }
}

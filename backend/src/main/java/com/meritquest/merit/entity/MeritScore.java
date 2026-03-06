package com.meritquest.merit.entity;

import com.meritquest.student.entity.Student;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "merit_scores", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"student_id", "batch_id"})
})
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class MeritScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id", nullable = false)
    private MeritCalculationBatch batch;

    @Column(name = "academic_year", nullable = false)
    private String academicYear;

    @Column(name = "academic_z_score")
    @Builder.Default
    private BigDecimal academicZScore = BigDecimal.ZERO;

    @Column(name = "attendance_z_score")
    @Builder.Default
    private BigDecimal attendanceZScore = BigDecimal.ZERO;

    @Column(name = "activity_z_score")
    @Builder.Default
    private BigDecimal activityZScore = BigDecimal.ZERO;

    @Column(name = "certificate_z_score")
    @Builder.Default
    private BigDecimal certificateZScore = BigDecimal.ZERO;

    @Column(name = "composite_score", nullable = false)
    @Builder.Default
    private BigDecimal compositeScore = BigDecimal.ZERO;

    @Column(name = "rank_school")
    private Integer rankSchool;

    @Column(name = "rank_district")
    private Integer rankDistrict;

    @Column(name = "rank_state")
    private Integer rankState;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); updatedAt = LocalDateTime.now(); }

    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}

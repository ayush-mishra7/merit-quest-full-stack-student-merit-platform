package com.meritquest.verification.entity;

import com.meritquest.common.model.RecordType;
import com.meritquest.common.model.VerificationStatus;
import com.meritquest.user.entity.Institution;
import com.meritquest.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "verification_queue")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class VerificationItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "record_type", nullable = false, columnDefinition = "record_type")
    private RecordType recordType;

    @Column(name = "record_id", nullable = false)
    private Long recordId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "verification_status")
    private VerificationStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id")
    private User reviewer;

    private String comment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institution_id", nullable = false)
    private Institution institution;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submitted_by", nullable = false)
    private User submittedBy;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); updatedAt = LocalDateTime.now(); }

    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}

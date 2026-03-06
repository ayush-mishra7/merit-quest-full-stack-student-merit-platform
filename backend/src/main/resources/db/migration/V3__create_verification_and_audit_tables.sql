-- V3__create_verification_and_audit_tables.sql

-- Verification status for records
CREATE TYPE verification_status AS ENUM ('PENDING_VERIFICATION', 'APPROVED', 'REJECTED');
CREATE TYPE record_type AS ENUM ('STUDENT', 'ACADEMIC_RECORD', 'ATTENDANCE_RECORD', 'ACTIVITY', 'CERTIFICATE');

CREATE TABLE verification_queue (
    id              BIGSERIAL            PRIMARY KEY,
    record_type     record_type          NOT NULL,
    record_id       BIGINT               NOT NULL,
    status          verification_status  NOT NULL DEFAULT 'PENDING_VERIFICATION',
    reviewer_id     BIGINT               REFERENCES users(id),
    comment         TEXT,
    institution_id  BIGINT               NOT NULL REFERENCES institutions(id),
    submitted_by    BIGINT               NOT NULL REFERENCES users(id),
    reviewed_at     TIMESTAMP,
    created_at      TIMESTAMP            NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP            NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_verification_status ON verification_queue(status);
CREATE INDEX idx_verification_institution ON verification_queue(institution_id);
CREATE INDEX idx_verification_record ON verification_queue(record_type, record_id);

-- Audit logs
CREATE TABLE audit_logs (
    id              BIGSERIAL    PRIMARY KEY,
    action          VARCHAR(100) NOT NULL,
    entity_type     VARCHAR(100) NOT NULL,
    entity_id       BIGINT,
    user_id         BIGINT       REFERENCES users(id),
    user_email      VARCHAR(255),
    ip_address      VARCHAR(45),
    details         JSONB,
    institution_id  BIGINT       REFERENCES institutions(id),
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_institution ON audit_logs(institution_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- Add verification_status column to students table
ALTER TABLE students ADD COLUMN verification_status verification_status NOT NULL DEFAULT 'PENDING_VERIFICATION';

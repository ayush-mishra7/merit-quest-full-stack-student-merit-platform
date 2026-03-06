-- Phase 4: Merit Calculation Engine tables

-- Configuration table for admin-tunable weights
CREATE TABLE merit_config (
    id              BIGSERIAL PRIMARY KEY,
    config_key      VARCHAR(100)   NOT NULL UNIQUE,
    config_value    NUMERIC(5,4)   NOT NULL,
    description     VARCHAR(500),
    updated_by      BIGINT         REFERENCES users(id),
    created_at      TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP      NOT NULL DEFAULT NOW()
);

-- Batch tracking for each merit calculation run
CREATE TABLE merit_calculation_batches (
    id              BIGSERIAL PRIMARY KEY,
    scope           VARCHAR(30)    NOT NULL,  -- SCHOOL, DISTRICT, STATE
    scope_id        VARCHAR(255)   NOT NULL,  -- institution_id, district name, or state name
    academic_year   VARCHAR(20)    NOT NULL,
    status          VARCHAR(30)    NOT NULL DEFAULT 'PENDING',  -- PENDING, RUNNING, COMPLETED, FAILED
    total_students  INTEGER        NOT NULL DEFAULT 0,
    processed       INTEGER        NOT NULL DEFAULT 0,
    error_message   TEXT,
    triggered_by    BIGINT         REFERENCES users(id),
    started_at      TIMESTAMP,
    completed_at    TIMESTAMP,
    created_at      TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP      NOT NULL DEFAULT NOW()
);

-- Individual merit scores — one per student per batch
CREATE TABLE merit_scores (
    id                  BIGSERIAL PRIMARY KEY,
    student_id          BIGINT         NOT NULL REFERENCES students(id),
    batch_id            BIGINT         NOT NULL REFERENCES merit_calculation_batches(id),
    academic_year       VARCHAR(20)    NOT NULL,

    -- Component Z-scores
    academic_z_score    NUMERIC(10,6)  DEFAULT 0,
    attendance_z_score  NUMERIC(10,6)  DEFAULT 0,
    activity_z_score    NUMERIC(10,6)  DEFAULT 0,
    certificate_z_score NUMERIC(10,6)  DEFAULT 0,

    -- Weighted composite
    composite_score     NUMERIC(10,6)  NOT NULL DEFAULT 0,

    -- Rankings at different scopes
    rank_school         INTEGER,
    rank_district       INTEGER,
    rank_state          INTEGER,

    created_at          TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP      NOT NULL DEFAULT NOW(),

    UNIQUE (student_id, batch_id)
);

CREATE INDEX idx_merit_scores_student      ON merit_scores(student_id);
CREATE INDEX idx_merit_scores_batch        ON merit_scores(batch_id);
CREATE INDEX idx_merit_scores_composite    ON merit_scores(composite_score DESC);
CREATE INDEX idx_merit_scores_year         ON merit_scores(academic_year);
CREATE INDEX idx_merit_batches_scope       ON merit_calculation_batches(scope, scope_id);
CREATE INDEX idx_merit_batches_status      ON merit_calculation_batches(status);

-- Seed default weights
INSERT INTO merit_config (config_key, config_value, description) VALUES
    ('weight.academics',    0.5000, 'Weight for academic performance (50%)'),
    ('weight.attendance',   0.2000, 'Weight for attendance (20%)'),
    ('weight.activities',   0.2000, 'Weight for extracurricular activities (20%)'),
    ('weight.certificates', 0.1000, 'Weight for certificates (10%)');

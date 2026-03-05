-- V1__create_users_and_institutions.sql

CREATE TYPE institution_type AS ENUM ('SCHOOL', 'COLLEGE', 'UNIVERSITY');

CREATE TABLE institutions (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(255)     NOT NULL,
    code            VARCHAR(50)      NOT NULL UNIQUE,
    type            institution_type NOT NULL DEFAULT 'SCHOOL',
    board           VARCHAR(100),
    district        VARCHAR(100)     NOT NULL,
    state           VARCHAR(100)     NOT NULL,
    address         TEXT,
    contact_email   VARCHAR(255),
    contact_phone   VARCHAR(20),
    active          BOOLEAN          NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP        NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP        NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_institutions_district ON institutions(district);
CREATE INDEX idx_institutions_state    ON institutions(state);

CREATE TYPE user_role AS ENUM (
    'STUDENT', 'PARENT', 'SCHOOL_ADMIN',
    'DATA_VERIFIER', 'NGO_REP', 'GOV_AUTHORITY', 'SYSTEM_ADMIN'
);

CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING');

CREATE TABLE users (
    id              BIGSERIAL    PRIMARY KEY,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    role            user_role    NOT NULL,
    status          user_status  NOT NULL DEFAULT 'ACTIVE',
    institution_id  BIGINT       REFERENCES institutions(id),
    phone           VARCHAR(20),
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role  ON users(role);
CREATE INDEX idx_users_institution ON users(institution_id);

-- Seed: default institution and system admin (password: Admin@123 bcrypt-hashed)
INSERT INTO institutions (name, code, type, board, district, state, contact_email)
VALUES ('Merit Quest Central', 'MQ-CENTRAL', 'SCHOOL', 'CBSE', 'Central', 'Delhi', 'admin@meritquest.dev');

INSERT INTO users (email, password_hash, first_name, last_name, role, status, institution_id)
VALUES (
    'admin@meritquest.dev',
    '$2b$12$w2onbXUhHDjen/E7GsuWyeTrGsuu4YFh0JhZ/vR74jsXGoOx4AklW',
    'System',
    'Admin',
    'SYSTEM_ADMIN',
    'ACTIVE',
    1
);

<div align="center">

# 🏆 Merit Quest

### *A Centralized Student Merit & Scholarship Platform*

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Java](https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docs.docker.com/compose)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

<br />

<img src="https://img.shields.io/badge/Status-In%20Development-orange?style=flat-square" alt="Status" />
<img src="https://img.shields.io/badge/Phase-4%20of%208-blue?style=flat-square" alt="Phase" />
<img src="https://img.shields.io/github/last-commit/ayush-mishra7/merit-quest-full-stack-student-merit-platform?style=flat-square&color=green" alt="Last Commit" />

---

**Merit Quest** is a production-grade full-stack web platform designed to **collect, verify, analyze, and rank** student academic and extracurricular performance across multiple institutions — enabling governments, NGOs, and universities to identify and support meritorious students through scholarships, mentorship, and data-driven policy insights.

[Getting Started](#-getting-started) •
[Architecture](#-architecture) •
[Features](#-features) •
[Tech Stack](#-tech-stack) •
[API Reference](#-api-reference) •
[Roadmap](#-roadmap)

</div>

---

## 📸 Preview

<div align="center">
<table>
<tr>
<td align="center"><b>Login</b></td>
<td align="center"><b>Dashboard</b></td>
</tr>
<tr>
<td>

```
┌──────────────────────────┐
│      🏆 Merit Quest      │
│                          │
│   ┌──────────────────┐   │
│   │ 📧 Email         │   │
│   └──────────────────┘   │
│   ┌──────────────────┐   │
│   │ 🔒 Password      │   │
│   └──────────────────┘   │
│                          │
│   [ ▶ Sign In        ]   │
│                          │
│   Don't have an account? │
│         Sign up →        │
└──────────────────────────┘
```

</td>
<td>

```
┌──┬───────────────────────┐
│MQ│ Welcome, System Admin │
│  │                       │
│📊│ ┌─────┐ ┌─────┐      │
│👥│ │Perf │ │Merit│      │
│✅│ └─────┘ └─────┘      │
│🏆│ ┌─────┐ ┌─────┐      │
│📚│ │Schol│ │Users│      │
│🔍│ └─────┘ └─────┘      │
│  │                       │
│  │ ┌─────────────────┐   │
│  │ │ Welcome Banner  │   │
│  │ └─────────────────┘   │
└──┴───────────────────────┘
```

</td>
</tr>
</table>
</div>

---

## ✨ Features

### 🔐 Authentication & Authorization
- **JWT-based auth** with access + refresh token flow
- **7 user roles** with strict RBAC (Role-Based Access Control)
- **bcrypt password hashing** (strength 12) for maximum security
- **Auto token refresh** — seamless UX with no unexpected logouts

### 👥 Student Data Management
- **Full CRUD** — create, read, update, soft-delete students
- **Bulk upload** — CSV/Excel import via Apache POI & OpenCSV
- **Certificate management** — upload/download via MinIO S3-compatible storage
- **Grade filtering** — paginated student lists with grade-based search
- **Duplicate protection** — unique enrollment number per institution (409 Conflict)

### 👥 Multi-Role System

| Role | Capabilities |
|------|-------------|
| 🎓 **Student / Parent** | View own performance, merit scores, discover & apply for scholarships |
| 🏫 **School Administrator** | Upload student data (CSV/Excel), manage records, view school analytics |
| ✅ **Data Verifier** | Review, approve, or reject submitted records with audit trail |
| 🤝 **NGO Representative** | Post scholarships, review applicants, track outreach impact |
| 🏛️ **Government Authority** | Regional analytics, cross-school merit rankings, policy insights |
| ⚙️ **System Administrator** | Full platform control — users, institutions, ML models, audit logs |

### 📊 Merit Evaluation Engine
- **Z-score normalization** — fair comparison across different boards, schools, and subjects
- **Weighted composite scoring** — academics (50%), attendance (20%), activities (20%), certificates (10%)
- **Multi-level rankings** — school, district, and state level merit lists
- **Async processing** — heavy calculations run in background, UI stays responsive

### 📈 Analytics Dashboards
- **Role-specific views** — each stakeholder sees relevant metrics
- **Interactive charts** — line graphs, bar charts, radar charts, histograms (Recharts)
- **Animated UI** — smooth transitions and micro-interactions (Framer Motion)
- **Redis-cached** — sub-second dashboard loads with intelligent caching

### 🎓 Scholarship Management
- **Post opportunities** with eligibility filters (merit score, income, grades, district)
- **Auto-matching** — students automatically discover scholarships they qualify for
- **Application workflow** — apply, track status, manage applicants

### 🤖 ML-Powered Early Warning System
- **Dropout risk prediction** using Random Forest / Gradient Boosting
- **Performance trend forecasting** — predict next-term scores
- **Model versioning** — train, evaluate (AUC-ROC), and compare model versions
- **Feature importance** — explainable predictions for actionable interventions

### 🔍 Verification Workflow
- **State machine** — UPLOADED → PENDING_VERIFICATION → APPROVED / REJECTED
- **Audit logging** — every action logged with user, entity, IP, and timestamp
- **AOP-based** — `@AuditLogged` annotation auto-captures all mutating operations

---

## 🏗️ Architecture

```
                        ┌─────────────────────┐
                        │    Nginx :80/:443    │
                        │  (Reverse Proxy +    │
                        │  Rate Limiting + SSL)│
                        └──────┬──────┬───────┘
                               │      │
                  ┌────────────┘      └────────────┐
                  ▼                                 ▼
    ┌──────────────────────┐         ┌──────────────────────┐
    │   React SPA :3000    │         │ Spring Boot API :8080│
    │                      │         │                      │
    │  • Tailwind CSS      │         │  • JWT Auth          │
    │  • Framer Motion     │         │  • Spring Security   │
    │  • Recharts          │         │  • Spring Data JPA   │
    │  • Zustand           │         │  • Flyway Migrations │
    │  • React Router v6   │         │  • REST APIs         │
    └──────────────────────┘         └──────┬───┬───┬───────┘
                                            │   │   │
                          ┌─────────────────┘   │   └──────────────┐
                          ▼                     ▼                  ▼
              ┌─────────────────┐   ┌─────────────────┐   ┌──────────────┐
              │ PostgreSQL :5432│   │   Redis :6379    │   │ MinIO :9000  │
              │                 │   │                  │   │              │
              │  • Users        │   │  • Cache         │   │ • Certificates│
              │  • Institutions │   │  • Session data  │   │ • CSV uploads │
              │  • Records      │   │  • Job status    │   │ • ML models  │
              │  • Merit scores │   │                  │   │              │
              └────────┬────────┘   └──────────────────┘   └──────────────┘
                       │
                       ▼
            ┌──────────────────────┐
            │ Python ML Svc :5000  │
            │                      │
            │  • FastAPI           │
            │  • scikit-learn      │
            │  • Dropout prediction│
            │  • Model versioning  │
            └──────────────────────┘
```

### Project Structure

```
merit-quest/
├── 📁 backend/                    # Spring Boot 3.2 (Java 17)
│   ├── src/main/java/com/meritquest/
│   │   ├── auth/                  # JWT authentication & controllers
│   │   │   ├── controller/        # AuthController (login, register, refresh)
│   │   │   ├── dto/               # Request/Response DTOs
│   │   │   └── security/          # JwtTokenProvider, Filters, EntryPoint
│   │   ├── audit/                  # AOP-based audit logging
│   │   │   ├── controller/        # AuditLogController
│   │   │   ├── dto/               # AuditLogResponse
│   │   │   ├── entity/            # AuditLog JPA entity
│   │   │   ├── repository/        # AuditLogRepository
│   │   │   ├── service/           # AuditLogService
│   │   │   ├── AuditLogged.java   # Custom annotation
│   │   │   └── AuditLogAspect.java # AOP aspect
│   │   ├── common/                # Shared utilities
│   │   │   ├── dto/               # ApiResponse wrapper
│   │   │   ├── exception/         # Global exception handler
│   │   │   └── model/             # Enums (Role, Gender, VerificationStatus, etc.)
│   │   ├── config/                # SecurityConfig, AsyncConfig
│   │   ├── notification/          # NotificationService interface
│   │   ├── student/               # Student data management
│   │   │   ├── controller/        # StudentController, BulkUploadController, CertificateController
│   │   │   ├── dto/               # StudentRequest/Response DTOs
│   │   │   ├── entity/            # Student, AcademicRecord, Activity, Certificate, BulkUpload
│   │   │   ├── repository/        # Spring Data repositories
│   │   │   └── service/           # StudentService, BulkUploadService, CertificateService, StorageService
│   │   ├── user/                  # User & Institution management
│   │   │   ├── entity/            # JPA entities
│   │   │   ├── repository/        # Spring Data repositories
│   │   │   └── service/           # UserService (UserDetailsService)
│   │   └── verification/          # Verification workflow
│   │   │   ├── controller/        # VerificationController
│   │   │   ├── dto/               # VerificationDecisionRequest/ItemResponse
│   │   │   ├── entity/            # VerificationItem
│   │   │   ├── repository/        # VerificationRepository
│   │   │   └── service/           # VerificationService
│   │   └── merit/                 # Merit calculation engine
│   │       ├── controller/        # MeritController (calculate, lists, config)
│   │       ├── dto/               # MeritScoreResponse, BatchResponse, etc.
│   │       ├── entity/            # MeritScore, MeritCalculationBatch, MeritConfig
│   │       ├── repository/        # Score/Batch/Config repositories
│   │       └── service/           # MeritCalculationService, MeritConfigService
│   ├── src/main/resources/
│   │   ├── application.yml        # App configuration
│   │   └── db/migration/          # Flyway SQL migrations (V1–V6)
│   ├── build.gradle               # Gradle build config
│   └── Dockerfile                 # Multi-stage Docker build
│
├── 📁 frontend/                   # React 18 + Vite
│   ├── src/
│   │   ├── components/            # Layout, Sidebar, ProtectedRoute
│   │   ├── pages/                 # Login, Dashboard, StudentManagement,
│   │   │                          # BulkUpload, VerificationQueue, AuditLogViewer, MeritLists
│   │   ├── services/              # Axios API client with JWT interceptor
│   │   ├── store/                 # Zustand auth store (persisted)
│   │   └── utils/                 # Role-based navigation config
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── Dockerfile
│
├── 📁 ml-service/                 # Python FastAPI (Phase 7)
├── 📁 nginx/                      # Reverse proxy config
│   └── nginx.conf                 # Rate limiting, security headers, proxy
│
├── docker-compose.yml             # Full stack infrastructure
├── .github/workflows/ci.yml       # GitHub Actions CI/CD
└── .gitignore
```

---

## 🛠️ Tech Stack

<table>
<tr>
<td valign="top">

### Backend
| Technology | Purpose |
|-----------|---------|
| Java 17 | Language |
| Spring Boot 3.2 | Framework |
| Spring Security | Auth & RBAC |
| Spring Data JPA | ORM |
| Flyway | DB Migrations |
| JJWT 0.12 | JWT Tokens |
| Apache POI | Excel Processing |
| OpenCSV | CSV Processing |
| MinIO SDK | S3-compatible Storage |
| Lombok | Boilerplate Reduction |

</td>
<td valign="top">

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 | UI Library |
| Vite 5 | Build Tool |
| Tailwind CSS 3.4 | Styling |
| Framer Motion 11 | Animations |
| Recharts 2 | Data Visualization |
| Zustand 4 | State Management |
| React Router 6 | Routing |
| Axios | HTTP Client |
| Lucide React | Icons |
| React Hot Toast | Notifications |

</td>
</tr>
<tr>
<td valign="top">

### Infrastructure
| Technology | Purpose |
|-----------|---------|
| PostgreSQL 16 | Primary Database |
| Redis 7 | Caching & Sessions |
| MinIO | S3-compatible Storage |
| Nginx | Reverse Proxy |
| Docker Compose | Orchestration |
| GitHub Actions | CI/CD |

</td>
<td valign="top">

### ML Service (Phase 7)
| Technology | Purpose |
|-----------|---------|
| Python 3.11 | Language |
| FastAPI | Web Framework |
| scikit-learn | ML Models |
| XGBoost | Gradient Boosting |
| pandas | Data Processing |

</td>
</tr>
</table>

---

## 🚀 Getting Started

### Prerequisites

- **Java 17+** — [Download](https://adoptium.net/)
- **Node.js 20+** — [Download](https://nodejs.org/)
- **Docker & Docker Compose** — [Download](https://docs.docker.com/get-docker/)

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/ayush-mishra7/merit-quest-full-stack-student-merit-platform.git
cd merit-quest-full-stack-student-merit-platform

# 2. Start infrastructure services
docker-compose up -d postgres redis minio

# 3. Start the backend (new terminal)
cd backend
./gradlew bootRun          # Linux/Mac
.\gradlew.bat bootRun      # Windows

# 4. Start the frontend (new terminal)
cd frontend
npm install
npm run dev

# 5. Open in browser
#    Frontend:  http://localhost:3000
#    API:       http://localhost:8080
#    MinIO UI:  http://localhost:9001
```

### Default Credentials

| User | Email | Password | Role |
|------|-------|----------|------|
| System Admin | `admin@meritquest.dev` | `Admin@123` | SYSTEM_ADMIN |

### Full Docker Deployment

```bash
# Build and run everything
docker-compose up --build

# Access via Nginx at http://localhost
```

---

## 📡 API Reference

### Authentication Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/register` | Register a new user | Public |
| `POST` | `/api/auth/login` | Login and get JWT tokens | Public |
| `POST` | `/api/auth/refresh` | Refresh access token | Public |
| `GET`  | `/api/auth/me` | Get current user profile | Bearer Token |

### Student Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/students` | List students (paginated, filterable by grade) | SCHOOL_ADMIN, SYSTEM_ADMIN |
| `GET` | `/api/students/{id}` | Get student by ID | SCHOOL_ADMIN, SYSTEM_ADMIN |
| `POST` | `/api/students` | Create a new student | SCHOOL_ADMIN, SYSTEM_ADMIN |
| `PUT` | `/api/students/{id}` | Update a student | SCHOOL_ADMIN, SYSTEM_ADMIN |
| `DELETE` | `/api/students/{id}` | Soft-delete (deactivate) a student | SCHOOL_ADMIN, SYSTEM_ADMIN |

### Bulk Upload Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/bulk-upload/students` | Upload students via CSV/Excel | SCHOOL_ADMIN, SYSTEM_ADMIN |
| `GET` | `/api/bulk-upload/history` | List upload history | SCHOOL_ADMIN, SYSTEM_ADMIN |

### Certificate Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/certificates/upload` | Upload a certificate file | SCHOOL_ADMIN, SYSTEM_ADMIN |
| `GET` | `/api/certificates/{id}/download` | Download a certificate | Bearer Token |

### Verification Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/verification` | Get verification queue (filterable by status) | DATA_VERIFIER, SCHOOL_ADMIN, SYSTEM_ADMIN |
| `GET` | `/api/verification/{id}` | Get a specific verification item | DATA_VERIFIER, SCHOOL_ADMIN, SYSTEM_ADMIN |
| `PUT` | `/api/verification/{id}/decide` | Approve or reject a record | DATA_VERIFIER, SYSTEM_ADMIN |

### Audit Log Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/audit-logs` | List audit logs (filterable by entity) | SYSTEM_ADMIN, GOV_AUTHORITY |

### Merit Calculation Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/merit/calculate` | Trigger merit calculation batch | SCHOOL_ADMIN, SYSTEM_ADMIN, GOV_AUTHORITY |
| `GET` | `/api/merit/batches` | List calculation batches | SCHOOL_ADMIN, SYSTEM_ADMIN, GOV_AUTHORITY |
| `GET` | `/api/merit/batches/{batchId}` | Get batch status & progress | SCHOOL_ADMIN, SYSTEM_ADMIN, GOV_AUTHORITY |
| `GET` | `/api/merit/lists/{batchId}` | Get merit list by batch | Bearer Token |
| `GET` | `/api/merit/lists?academicYear=&scope=&scopeId=` | Get merit list by year/scope | Bearer Token |
| `GET` | `/api/merit/students/{studentId}/history` | Student score history | Bearer Token |
| `GET` | `/api/merit/config` | Get weight configurations | SYSTEM_ADMIN, GOV_AUTHORITY |
| `PUT` | `/api/merit/config` | Update weight configuration | SYSTEM_ADMIN |

### Sample Requests

<details>
<summary><b>POST /api/auth/register</b></summary>

```json
{
  "email": "student@school.edu",
  "password": "SecurePass123",
  "firstName": "Priya",
  "lastName": "Sharma",
  "role": "STUDENT",
  "institutionId": 1,
  "phone": "+91 9876543210"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
    "tokenType": "Bearer",
    "userId": 2,
    "email": "student@school.edu",
    "firstName": "Priya",
    "lastName": "Sharma",
    "role": "STUDENT",
    "institutionId": 1
  }
}
```
</details>

<details>
<summary><b>POST /api/auth/login</b></summary>

```json
{
  "email": "admin@meritquest.dev",
  "password": "Admin@123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
    "tokenType": "Bearer",
    "userId": 1,
    "email": "admin@meritquest.dev",
    "firstName": "System",
    "lastName": "Admin",
    "role": "SYSTEM_ADMIN",
    "institutionId": 1
  }
}
```
</details>

<details>
<summary><b>POST /api/students</b> — Create a Student</summary>

```json
{
  "enrollmentNumber": "STU-2026-001",
  "firstName": "Rahul",
  "lastName": "Sharma",
  "dateOfBirth": "2010-05-15",
  "gender": "MALE",
  "grade": "10",
  "section": "A",
  "guardianName": "Suresh Sharma",
  "guardianPhone": "+919876543210",
  "guardianEmail": "suresh@email.com",
  "address": "123 Main St, Delhi"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Student created",
  "data": {
    "id": 1,
    "enrollmentNumber": "STU-2026-001",
    "firstName": "Rahul",
    "lastName": "Sharma",
    "dateOfBirth": "2010-05-15",
    "gender": "MALE",
    "grade": "10",
    "section": "A",
    "verificationStatus": "PENDING_VERIFICATION",
    "institutionId": 1,
    "institutionName": "Merit Quest Academy",
    "active": true
  }
}
```
</details>

<details>
<summary><b>PUT /api/verification/{id}/decide</b> — Approve/Reject</summary>

```json
{
  "approved": true,
  "comment": "All documents verified successfully"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Record approved",
  "data": {
    "id": 1,
    "recordType": "STUDENT",
    "recordId": 1,
    "status": "APPROVED",
    "reviewerName": "System Admin",
    "comment": "All documents verified successfully",
    "reviewedAt": "2026-03-06T16:30:00"
  }
}
```
</details>

<details>
<summary><b>POST /api/merit/calculate</b> — Trigger Merit Calculation</summary>

```json
{
  "scope": "SCHOOL",
  "academicYear": "2025-2026",
  "scopeId": "1"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Merit calculation started",
  "data": {
    "id": 1,
    "scope": "SCHOOL",
    "scopeId": "1",
    "academicYear": "2025-2026",
    "status": "RUNNING",
    "totalStudents": 6,
    "processed": 0,
    "triggeredBy": "System Admin",
    "startedAt": "2026-03-06T18:30:00"
  }
}
```
</details>

<details>
<summary><b>GET /api/merit/lists/{batchId}</b> — Get Merit List</summary>

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Merit list retrieved",
  "data": [
    {
      "enrollmentNumber": "STU-2026-001",
      "studentName": "Rahul Sharma",
      "grade": "10",
      "institutionName": "Merit Quest Academy",
      "academicZScore": 1.234567,
      "attendanceZScore": 0.876543,
      "activityZScore": 1.567890,
      "certificateZScore": 0.654321,
      "compositeScore": 1.123456,
      "rankSchool": 1,
      "rankDistrict": 3,
      "rankState": 15
    }
  ]
}
```
</details>

---

## 🔒 Security

| Measure | Implementation |
|---------|---------------|
| 🔑 Password Hashing | bcrypt with strength factor 12 |
| 🎫 Authentication | JWT (access + refresh tokens, HMAC-SHA256) |
| 🛡️ Authorization | Spring Security + `@PreAuthorize` method-level RBAC |
| 🚦 Rate Limiting | Nginx `limit_req` on auth endpoints (5 req/s, burst 10) |
| 🌐 CORS | Restricted to configured frontend origins |
| 📋 Security Headers | CSP, HSTS, X-Frame-Options, X-Content-Type-Options |
| 🔐 Token Security | Access tokens (15 min), refresh tokens (7 days) |
| 📝 Audit Logging | AOP-based `@AuditLogged` for all mutating operations |
| 🆔 Student Privacy | Tokenized external IDs (UUID), internal auto-increment |
| 💉 Injection Prevention | Parameterized queries via JPA, React XSS escaping |

---

## 🗺️ Roadmap

| Phase | Description | Status |
|-------|-------------|--------|
| **Phase 1** | Foundation & Authentication | ✅ Complete |
| **Phase 2** | Student Data Management & Bulk Upload | ✅ Complete |
| **Phase 3** | Verification Workflow & Audit Logging | ✅ Complete |
| **Phase 4** | Merit Calculation Engine (Z-score, rankings) | ✅ Complete |
| **Phase 5** | Analytics Dashboards (Recharts) | 🔲 Planned |
| **Phase 6** | Scholarship Management | 🔲 Planned |
| **Phase 7** | ML Pipeline — Dropout Prediction | 🔲 Planned |
| **Phase 8** | Production Deployment & DevOps | 🔲 Planned |

---

## 📊 Database Schema

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────────┐
│ institutions │     │      users       │     │    students      │
├──────────────┤     ├──────────────────┤     ├──────────────────┤
│ id       PK  │◄────│ institution_id FK│     │ id           PK  │
│ name         │     │ id           PK  │◄──┐ │ enrollment_no UQ │
│ code    UQ   │     │ email       UQ   │   │ │ first_name       │
│ type         │     │ password_hash    │   │ │ last_name        │
│ board        │     │ first_name       │   │ │ date_of_birth    │
│ district     │     │ last_name        │   │ │ gender           │
│ state        │     │ role             │   │ │ grade            │
│ active       │     │ status           │   │ │ verification_status│
│ created_at   │     │ phone            │   │ │ institution_id FK│
│ updated_at   │     │ created_at       │   │ │ user_id       FK │
└──────────────┘     │ updated_at       │   │ │ active           │
                     └──────────────────┘   │ └──────────────────┘
                                            │
┌──────────────────┐ ┌──────────────────┐   │ ┌──────────────────┐
│ academic_records │ │   activities     │   │ │  certificates    │
├──────────────────┤ ├──────────────────┤   │ ├──────────────────┤
│ id           PK  │ │ id           PK  │   │ │ id           PK  │
│ student_id   FK  │ │ student_id   FK  │   │ │ student_id   FK  │
│ subject          │ │ title            │   │ │ title            │
│ marks_obtained   │ │ category         │   │ │ file_path        │
│ max_marks        │ │ achievement      │   │ │ issuing_body     │
│ exam_type        │ │ event_date       │   │ │ issue_date       │
│ academic_year    │ │ institution_id FK│   │ │ institution_id FK│
└──────────────────┘ └──────────────────┘   │ └──────────────────┘
                                            │
┌──────────────────┐ ┌──────────────────┐   │ ┌──────────────────┐
│verification_queue│ │   audit_logs     │   │ │  bulk_uploads    │
├──────────────────┤ ├──────────────────┤   │ ├──────────────────┤
│ id           PK  │ │ id           PK  │   │ │ id           PK  │
│ record_type      │ │ action           │   │ │ file_name        │
│ record_id        │ │ entity_type      │   │ │ upload_type      │
│ status           │ │ entity_id        │   │ │ status           │
│ reviewer_id   FK─┤►│ performed_by  FK─┤►──┘ │ total_rows       │
│ comment          │ │ ip_address       │     │ success_rows     │
│ institution_id FK│ │ details (jsonb)  │     │ error_details    │
│ submitted_by  FK │ │ performed_at     │     │ uploaded_by   FK │
│ reviewed_at      │ └──────────────────┘     │ institution_id FK│
└──────────────────┘                          └──────────────────┘

┌──────────────────┐ ┌──────────────────────┐ ┌──────────────────┐
│  merit_config    │ │merit_calculation_    │ │  merit_scores    │
│                  │ │    batches           │ │                  │
├──────────────────┤ ├──────────────────────┤ ├──────────────────┤
│ id           PK  │ │ id             PK    │ │ id           PK  │
│ config_key   UQ  │ │ scope                │ │ student_id   FK  │
│ config_value     │ │ scope_id             │ │ batch_id     FK  │
│ description      │ │ academic_year        │ │ academic_year    │
│ updated_by   FK  │ │ status               │ │ academic_z_score │
│ created_at       │ │ total_students       │ │ attendance_z     │
│ updated_at       │ │ processed            │ │ activity_z       │
└──────────────────┘ │ error_message        │ │ certificate_z    │
                     │ triggered_by     FK  │ │ composite_score  │
                     │ started_at           │ │ rank_school      │
                     │ completed_at         │ │ rank_district    │
                     └──────────────────────┘ │ rank_state       │
                                              └──────────────────┘
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ for meritorious students everywhere**

<br />

<img src="https://img.shields.io/badge/Made%20with-Spring%20Boot-6DB33F?style=flat-square&logo=springboot" />
<img src="https://img.shields.io/badge/Made%20with-React-61DAFB?style=flat-square&logo=react" />
<img src="https://img.shields.io/badge/Made%20with-PostgreSQL-4169E1?style=flat-square&logo=postgresql" />
<img src="https://img.shields.io/badge/Made%20with-Docker-2496ED?style=flat-square&logo=docker" />

</div>

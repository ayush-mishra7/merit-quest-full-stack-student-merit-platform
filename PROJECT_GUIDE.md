# Merit Quest — Comprehensive Project Guide

## Table of Contents

1. [What is Merit Quest?](#1-what-is-merit-quest)
2. [What Makes It Unique?](#2-what-makes-it-unique)
3. [System Architecture](#3-system-architecture)
4. [Technology Stack](#4-technology-stack)
5. [Authentication & Authorization](#5-authentication--authorization)
6. [The 7 User Roles](#6-the-7-user-roles)
7. [Role Access Matrix](#7-role-access-matrix)
8. [Feature Walkthrough](#8-feature-walkthrough)
9. [Data Model](#9-data-model)
10. [Merit Score Algorithm](#10-merit-score-algorithm)
11. [ML Pipeline — Dropout Risk](#11-ml-pipeline--dropout-risk)
12. [Scholarship System](#12-scholarship-system)
13. [API Endpoint Reference](#13-api-endpoint-reference)
14. [How to Run Locally](#14-how-to-run-locally)
15. [Testing Guide — Every Feature](#15-testing-guide--every-feature)

---

## 1. What is Merit Quest?

Merit Quest is a **full-stack Student Merit & Scholarship Platform** built exclusively for **India's education ecosystem**. It brings together schools, government authorities, NGOs, and students on a single transparent platform to:

- **Rank students fairly** using a multi-dimensional merit scoring system (academics, attendance, extracurricular activities, certificates)
- **Detect dropout risk early** using machine-learning predictions
- **Connect deserving students to scholarships** offered by NGOs and government bodies
- **Provide transparent verification & audit trails** for all academic data

The platform addresses a real problem in India: the lack of a unified, transparent, and verifiable system for comparing student merit across different schools, boards (CBSE, ICSE, state boards), and regions.

---

## 2. What Makes It Unique?

| Feature | Why It Matters |
|---------|---------------|
| **Multi-dimensional merit scoring** | Unlike simple percentage-based ranking, Merit Quest combines academics (50%), attendance (20%), activities (20%), and certificates (10%) with Z-score normalization to compare students fairly across different schools and boards |
| **India-specific design** | Built for Indian geography (State → District → City → School hierarchy), Indian boards (CBSE, ICSE), Indian currency (INR), and Indian naming conventions |
| **ML-powered dropout prediction** | RandomForest/XGBoost models analyze student features to generate early warning alerts with risk scores and feature importances |
| **End-to-end scholarship lifecycle** | NGOs and government bodies can create scholarships with eligibility criteria (min score, grades, districts), auto-match eligible students, and manage the full application → review → approval pipeline |
| **7 distinct user roles** | Each role sees a completely different dashboard, sidebar navigation, and set of features — from students tracking their own performance to government authorities comparing districts |
| **Verification & audit infrastructure** | Every data mutation is logged. Uploaded student records go through a verification queue before they count toward merit scores |
| **Bulk data ingestion** | School admins can upload student data via CSV/Excel with row-level validation and error reporting |

---

## 3. System Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   React      │────▶│  Spring Boot      │────▶│  PostgreSQL 16   │
│   Frontend   │     │  Backend (8080)   │     │  (port 5434)     │
│   (port 3000)│◀────│                   │◀────│                  │
└─────────────┘     │  JWT Auth         │     └─────────────────┘
                     │  REST API          │
                     │  Flyway Migrations │     ┌─────────────────┐
                     │                   │────▶│  Redis 7          │
                     └──────┬───────────┘     │  (port 6380)     │
                            │                  │  Caching          │
                            ▼                  └─────────────────┘
                     ┌──────────────────┐
                     │  Python FastAPI    │     ┌─────────────────┐
                     │  ML Service (5000) │────▶│  MinIO            │
                     │  scikit-learn      │     │  (ports 9000/9001)│
                     │  XGBoost           │     │  Object Storage   │
                     └──────────────────┘     └─────────────────┘
```

**Data flow:**
1. Frontend sends JWT-authenticated requests to the Spring Boot REST API
2. Backend validates permissions via `@PreAuthorize` and processes business logic
3. PostgreSQL stores all relational data (8 Flyway migrations define the schema)
4. Redis caches analytics results for performance
5. ML service trains models on PostgreSQL student data, stores model artifacts in MinIO
6. MinIO also stores uploaded certificates and bulk upload files

---

## 4. Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18.3, Vite 5.3, Tailwind CSS, Framer Motion, Recharts, Zustand, React Router v6 |
| **Backend** | Java 17, Spring Boot 3.2.5, Spring Security 6, Spring Data JPA, Gradle 8.7 |
| **Database** | PostgreSQL 16 (schema managed by Flyway) |
| **Cache** | Redis 7 (analytics caching) |
| **Storage** | MinIO (S3-compatible — certificates, model artifacts, bulk uploads) |
| **ML** | Python 3.12, FastAPI, scikit-learn, XGBoost, pandas, psycopg2 |
| **Auth** | JWT (HMAC-SHA512) — 15-minute access tokens, 7-day refresh tokens |
| **Password** | BCrypt with strength factor 12 |
| **Containerization** | Docker Compose (7 services) |

---

## 5. Authentication & Authorization

### How Authentication Works

1. **Registration**: User submits `email, password, firstName, lastName, role, institutionId(optional), phone(optional)` to `POST /api/auth/register`
2. **Login**: User submits `email, password` to `POST /api/auth/login`
3. **Response**: Server returns `{ accessToken, refreshToken, tokenType, userId, email, firstName, lastName, role, institutionId, studentId }`
4. **Subsequent requests**: Frontend attaches `Authorization: Bearer <accessToken>` header to all API calls
5. **Token refresh**: When access token expires (15 min), frontend uses `POST /api/auth/refresh` with the refresh token (7-day lifetime)
6. **Logout**: Frontend clears tokens from Zustand store (persisted in localStorage)

### How Authorization Works (3 Layers)

**Layer 1 — URL-based (SecurityConfig.java)**
- `/api/auth/**` → Public (no token needed)
- `/api/admin/**` → Only `SYSTEM_ADMIN` role
- `/api/**` → Any authenticated user (must have valid JWT)

**Layer 2 — Controller-level (`@PreAuthorize`)**
- Applied at class or method level on each controller
- Example: `@PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'SYSTEM_ADMIN')")` on StudentController
- Example: `@PreAuthorize("hasRole('STUDENT')")` on the scholarship apply endpoint

**Layer 3 — Frontend Route Guards**
- `ProtectedRoute` component wraps routes with optional `roles` prop
- If user's role isn't in the allowed list → redirected to `/unauthorized`
- Even if a user manipulates the URL, the backend rejects unauthorized API calls

### Password Security
- BCrypt with strength factor 12 (≈180ms per hash — resistant to brute force)
- Minimum 8 characters enforced on frontend

### JWT Security
- HMAC-SHA512 algorithm
- Separate access (15 min) and refresh (7 days) token types
- Token type claim prevents using refresh tokens as access tokens
- Stateless — no server-side session storage

---

## 6. The 7 User Roles

### STUDENT
**Who**: A student enrolled at a school
**What they see**: Dashboard → My Performance → Merit Score → Scholarships → My Applications → Alerts
**What they can do**:
- View their own academic performance, merit scores, and rankings
- Browse and apply to scholarships
- Track scholarship application status
- View early warning alerts about their performance

### PARENT
**Who**: A parent/guardian linked to a student
**What they see**: Dashboard → Child Performance → Merit Score → Scholarships → Alerts
**What they can do**:
- View their child's academic performance and merit scores
- Browse available scholarships
- View early warning alerts about their child

### SCHOOL_ADMIN
**Who**: A school administrator responsible for managing student data
**What they see**: Dashboard → Students → Bulk Upload → Merit Lists → Analytics → Certificates → Alerts
**What they can do**:
- Create, edit, and deactivate student records
- Upload bulk student data via CSV/Excel
- Trigger merit score calculations for their institution
- View school-level analytics (grade distribution, attendance trends, top performers)
- Upload and manage student certificates
- Generate ML-powered dropout risk alerts
- Acknowledge early warning alerts

### DATA_VERIFIER
**Who**: An independent verifier who reviews submitted academic data
**What they see**: Dashboard → Verification Queue → Merit Lists → Audit Log
**What they can do**:
- View the verification queue (pending student records)
- Approve or reject student records with comments
- View merit lists
- View audit logs for accountability

### NGO_REP (NGO Representative)
**Who**: A representative from an NGO that provides scholarships
**What they see**: Dashboard → Scholarships → Applicants → Analytics → Merit Lists
**What they can do**:
- Create and manage scholarship programs with eligibility criteria
- View merit lists to identify deserving students
- Review scholarship applications (approve/reject)
- View auto-matched eligible students
- Access analytics dashboards for impact tracking

### GOV_AUTHORITY (Government Authority)
**Who**: A government education official
**What they see**: Dashboard → Regional Analytics → Merit Rankings → Scholarships → Audit Logs
**What they can do**:
- View cross-institution comparisons and regional analytics
- View state/district/school level merit rankings
- Create government scholarship programs
- Review audit logs for system accountability
- View merit configuration weights

### SYSTEM_ADMIN
**Who**: Platform administrator with full access
**What they see**: Dashboard → Users → Institutions → Analytics → Merit Lists → Scholarships → Audit Logs → ML Models
**What they can do**:
- Everything all other roles can do, plus:
- Manage users and institutions
- Configure merit weight parameters
- Train and manage ML models
- Evict analytics caches
- Full audit log access

---

## 7. Role Access Matrix

### Frontend Pages

| Page | STUDENT | PARENT | SCHOOL_ADMIN | DATA_VERIFIER | NGO_REP | GOV_AUTHORITY | SYSTEM_ADMIN |
|------|---------|--------|-------------|---------------|---------|---------------|-------------|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| My Performance | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Merit Lists | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Scholarships (browse) | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Scholarship Create/Edit | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| My Applications | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Applicant Review | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Students | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Bulk Upload | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Certificates | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Verification Queue | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| Analytics | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ |
| Alerts | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Audit Log | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ |
| User Management | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Institutions | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| ML Models | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

### Backend API Access (abbreviated — see Section 13 for full details)

| API Group | STUDENT | PARENT | SCHOOL_ADMIN | DATA_VERIFIER | NGO_REP | GOV_AUTHORITY | SYSTEM_ADMIN |
|-----------|---------|--------|-------------|---------------|---------|---------------|-------------|
| Auth (register/login) | Public | Public | Public | Public | Public | Public | Public |
| Students CRUD | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Bulk Upload | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Certificates | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Verification | ❌ | ❌ | ✅ (view) | ✅ (decide) | ❌ | ❌ | ✅ |
| Merit Calc/Config | ❌ | ❌ | ✅ (trigger) | ✅ (view batches) | ❌ | ✅ | ✅ |
| Merit Lists | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Scholarships Browse | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Scholarship Apply | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Scholarship Manage | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Analytics | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Student Performance | ✅ (own) | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Alerts | ✅ (own) | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Audit Logs | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| ML Models | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 8. Feature Walkthrough

### 8.1 Student Dashboard
When a student logs in, they see:
- **Score cards**: Composite Score, Academic Z-Score, Attendance Z-Score, School Rank
- **Radar chart**: Multi-dimensional breakdown (academics, attendance, activities, certificates)
- **Line chart**: Score history over time
- **Bar chart**: Subject-wise performance breakdown
- **Quick navigation cards**: Performance, Merit Score, Scholarships

### 8.2 Student Management (School Admin)
- Paginated list of all students in the admin's institution
- Search by name with grade filter dropdown
- Create new student with all fields (enrollment number, name, DOB, gender, grade, section, guardian info, address)
- Edit existing student records
- Deactivate (soft-delete) students
- Each action is audit-logged

### 8.3 Bulk Upload
- Drag-and-drop or click-to-upload zone for CSV/Excel files
- **Required CSV columns**: enrollment_number, first_name, last_name, date_of_birth (YYYY-MM-DD), gender (MALE/FEMALE/OTHER), grade
- **Optional columns**: section, guardian_name, guardian_phone, guardian_email, address
- Upload history table shows processing status (PENDING → PROCESSING → COMPLETED/FAILED)
- Failed rows are displayed with specific error messages per row

### 8.4 Verification Queue
- Queue shows records pending verification
- Filter by status (PENDING, APPROVED, REJECTED, FLAGGED)
- Each item shows student details, record type, and submission date
- Verifiers can approve or reject with comments
- All decisions are audit-logged

### 8.5 Merit Score Calculation
- Admin triggers a batch calculation scoped to SCHOOL, DISTRICT, or STATE level
- Algorithm:
  1. Collects academic records, attendance, activities, and certificates for each student
  2. Computes Z-scores for each component (normalizing across the comparison group)
  3. Applies configurable weights (default: 50/20/20/10)
  4. Produces a composite score and rankings at school/district/state level
- Batch status tracked: PENDING → IN_PROGRESS → COMPLETED/FAILED
- Results viewable in the Merit Lists page with export to CSV

### 8.6 Analytics Dashboard
- **Overview cards**: Total students, average merit score, attendance rate, active scholarships
- **Charts**: Grade distribution (bar), subject performance (bar), attendance trends (line), merit score histogram, top performers table
- **Institution comparison** (GOV_AUTHORITY & SYSTEM_ADMIN only): Compare schools side-by-side
- All analytics data is cached in Redis for performance

### 8.7 Scholarship System
**For NGO/Government (creators):**
- Create scholarship with: title, description, organization name/type, amount (INR), total slots, application deadline
- Set eligibility criteria (JSON): minimum composite score, allowed grades, allowed districts
- View applications, approve/reject each with a decision note
- Auto-match eligible students based on criteria
- Close scholarship when slots are filled

**For Students (applicants):**
- Browse active scholarships with search and status filter
- View detailed eligibility criteria and application deadlines
- Apply to scholarships (one-click from detail page)
- Track application status (PENDING → APPROVED/REJECTED/WITHDRAWN)
- Withdraw pending applications

### 8.8 ML-Powered Alerts
- ML service trains RandomForest/XGBoost models on student features
- Features: academic scores, attendance rates, activity participation, certificate count, demographic data
- Generates risk predictions with:
  - **Risk score** (0.0 – 1.0)
  - **Risk level**: LOW (<0.4), MEDIUM (0.4–0.6), HIGH (0.6–0.8), CRITICAL (≥0.8)
  - **Feature importances**: Which factors contribute most to the risk
- School admins generate alerts for their institution
- Alerts displayed with severity-coded cards, expandable details, and acknowledgement tracking

### 8.9 Audit Logging
- Every data mutation (create student, verify record, trigger merit calc, create scholarship, etc.) is logged
- Log entries include: action, entity type, entity ID, user who performed it, timestamp, old/new values
- GOV_AUTHORITY and SYSTEM_ADMIN can browse the full audit trail
- Filterable by entity type and entity ID

---

## 9. Data Model

### Core Tables (8 Flyway migrations)

| Table | Purpose |
|-------|---------|
| `institutions` | Schools/colleges — name, code, type (SCHOOL/COLLEGE/UNIVERSITY), state, district, city, board (CBSE/ICSE/STATE_BOARD/IGCSE/IB) |
| `users` | All user accounts — email, password (BCrypt), first/last name, phone, role, status, linked institution |
| `students` | Student records — enrollment number, name, DOB, gender, grade, section, guardian info, verification status |
| `academic_records` | Subject-wise marks — student, subject, marks obtained/total, grade/percentage, exam type, academic year |
| `attendance_records` | Monthly attendance — student, month, total/present/absent days, percentage |
| `activities` | Extracurricular — student, activity name, category (SPORTS/CULTURAL/ACADEMIC/COMMUNITY_SERVICE), achievement level |
| `certificates` | Document uploads — student, title, issuing authority, issue date, file stored in MinIO |
| `bulk_uploads` | Upload tracking — file reference, type, status, total/success/failed row counts, error details (JSON) |
| `verification_queue` | Records pending review — student, record type, status (PENDING/APPROVED/REJECTED/FLAGGED), reviewer, comments |
| `audit_logs` | All system actions — entity type, entity ID, action, performed by, old/new values, timestamp |
| `merit_config` | Scoring weights — academics, attendance, activities, certificates percentages |
| `merit_calculation_batches` | Batch runs — scope, academic year, status, record count |
| `merit_scores` | Per-student scores — academic/attendance/activity/certificate Z-scores, composite score, school/district/state rankings |
| `scholarships` | Scholarship programs — title, organization, amount, eligibility criteria (JSONB), deadline, slots |
| `scholarship_applications` | Student applications — scholarship, student, status (PENDING/APPROVED/REJECTED/WITHDRAWN), decision note |
| `ml_model_versions` | Trained model registry — model type, version, metrics (accuracy, precision, recall, F1), MinIO file path |
| `alerts` | Early warning alerts — student, type (DROPOUT_RISK/DECLINING_PERFORMANCE), risk score, severity, feature importances |

---

## 10. Merit Score Algorithm

### Step-by-step Process

1. **Data Collection**: For each student in the scope (school/district/state), gather:
   - Academic records → average percentage across subjects
   - Attendance records → average attendance percentage
   - Activities → count and achievement levels
   - Certificates → count

2. **Z-Score Normalization**: For each component, calculate Z = (value - mean) / stddev across all students in the scope. This ensures fair comparison even across different grading systems.

3. **Weighted Composite**: `composite = (academic_z × 0.50) + (attendance_z × 0.20) + (activities_z × 0.20) + (certificates_z × 0.10)`

4. **Ranking**: Students are ranked by composite score at three levels:
   - School rank (within their institution)
   - District rank (across all schools in the district)
   - State rank (across all schools in the state)

### Default Weights (configurable by SYSTEM_ADMIN)
| Component | Weight |
|-----------|--------|
| Academics | 50% |
| Attendance | 20% |
| Activities | 20% |
| Certificates | 10% |

---

## 11. ML Pipeline — Dropout Risk

### How It Works

1. **Training**:
   - SYSTEM_ADMIN triggers `POST /api/admin/ml-models/train` from the ML Models management page
   - Backend calls the Python ML microservice at `http://localhost:5000/train`
   - ML service loads student feature data from PostgreSQL
   - Trains a RandomForest (or GradientBoosting/XGBoost) classifier
   - Stores the trained model + preprocessor in MinIO as versioned artifacts
   - Records metrics (accuracy, precision, recall, F1, ROC-AUC) in `ml_model_versions` table

2. **Prediction**:
   - SCHOOL_ADMIN clicks "Generate Alerts" on the Alerts page
   - Backend calls `POST /api/alerts/generate/{institutionId}`
   - Backend calls the ML service's `POST /predict/dropout-risk/batch` endpoint
   - ML service loads the latest trained model, runs predictions for all students
   - Returns risk scores and feature importances for each student
   - Backend creates Alert records with severity levels and stores them

3. **Viewing**:
   - Alerts page shows severity-coded cards (CRITICAL in red, HIGH in orange, MEDIUM in yellow, LOW in green)
   - Each alert expands to show feature importance bars (which factors contribute most to the risk)
   - Admins can acknowledge alerts to track which ones have been reviewed

### Feature Importance Example
The model explains its predictions — for example, a high-risk student might show:
- `attendance_rate: 45%` (most important factor)
- `avg_academic_score: 12%` (second factor)
- `activity_count: 8%`

---

## 12. Scholarship System

### Lifecycle

```
NGO/Gov creates scholarship → Students browse & apply → NGO/Gov reviews applications → Approve/Reject
```

### Eligibility Criteria (stored as JSONB)
- `minCompositeScore`: Minimum merit composite score required
- `grades`: Array of eligible grades (e.g., ["9", "10", "11", "12"])
- `districts`: Array of eligible districts (e.g., ["South Delhi", "Central Delhi"])

### Auto-Matching
When an NGO views a scholarship's eligible students (`GET /scholarships/{id}/eligible-students`), the system automatically filters students matching the criteria — no manual search needed.

---

## 13. API Endpoint Reference

### Auth — `/api/auth` (Public)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register new user account |
| POST | `/api/auth/login` | Login, receive JWT tokens |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/me` | Get current user info |

### Students — `/api/students` (SCHOOL_ADMIN, SYSTEM_ADMIN)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/students` | List students (paginated, optional grade filter) |
| GET | `/api/students/{id}` | Get single student |
| POST | `/api/students` | Create student |
| PUT | `/api/students/{id}` | Update student |
| DELETE | `/api/students/{id}` | Deactivate student |

### Bulk Uploads — `/api/uploads` (SCHOOL_ADMIN, SYSTEM_ADMIN)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/uploads` | Upload CSV/Excel file |
| GET | `/api/uploads` | List upload history |
| GET | `/api/uploads/{id}` | Get upload status/details |

### Certificates — `/api/certificates` (SCHOOL_ADMIN, SYSTEM_ADMIN)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/certificates` | Upload certificate file |
| GET | `/api/certificates/student/{studentId}` | List student's certificates |
| GET | `/api/certificates/{id}/download` | Get download URL |
| DELETE | `/api/certificates/{id}` | Delete certificate |

### Verification — `/api/verification` (DATA_VERIFIER, SCHOOL_ADMIN, SYSTEM_ADMIN)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/verification` | List verification queue |
| GET | `/api/verification/{id}` | Get verification item |
| PUT | `/api/verification/{id}/decide` | Approve/reject (DATA_VERIFIER, SYSTEM_ADMIN) |

### Merit — `/api/merit`
| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| POST | `/api/merit/calculate` | SCHOOL_ADMIN, SYSTEM_ADMIN, GOV_AUTHORITY | Trigger calculation batch |
| GET | `/api/merit/batches` | SCHOOL_ADMIN, SYSTEM_ADMIN, GOV_AUTHORITY | List batches |
| GET | `/api/merit/batches/{batchId}` | SCHOOL_ADMIN, SYSTEM_ADMIN, GOV_AUTHORITY, DATA_VERIFIER | Get batch details |
| GET | `/api/merit/lists/{batchId}` | Any authenticated | Get merit list by batch |
| GET | `/api/merit/lists` | Any authenticated | Get merit list by academic year |
| GET | `/api/merit/students/{studentId}/history` | Any authenticated | Student's score history |
| GET | `/api/merit/config` | SYSTEM_ADMIN, GOV_AUTHORITY | View weight config |
| PUT | `/api/merit/config` | SYSTEM_ADMIN | Update weight config |

### Scholarships — `/api/scholarships`
| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| POST | `/api/scholarships` | NGO_REP, GOV_AUTHORITY, SYSTEM_ADMIN | Create scholarship |
| PUT | `/api/scholarships/{id}` | NGO_REP, GOV_AUTHORITY, SYSTEM_ADMIN | Update scholarship |
| POST | `/api/scholarships/{id}/close` | NGO_REP, GOV_AUTHORITY, SYSTEM_ADMIN | Close scholarship |
| GET | `/api/scholarships` | Any authenticated | Browse scholarships |
| GET | `/api/scholarships/mine` | NGO_REP, GOV_AUTHORITY, SYSTEM_ADMIN | My created scholarships |
| GET | `/api/scholarships/{id}` | Any authenticated | Scholarship details |
| POST | `/api/scholarships/apply` | STUDENT | Apply to scholarship |
| POST | `/api/scholarships/applications/{id}/decide` | NGO_REP, GOV_AUTHORITY, SYSTEM_ADMIN | Approve/reject application |
| DELETE | `/api/scholarships/{scholarshipId}/withdraw` | STUDENT | Withdraw application |
| GET | `/api/scholarships/{scholarshipId}/applications` | NGO_REP, GOV_AUTHORITY, SYSTEM_ADMIN | List applications |
| GET | `/api/scholarships/my-applications` | STUDENT | My applications |
| GET | `/api/scholarships/{scholarshipId}/eligible-students` | NGO_REP, GOV_AUTHORITY, SYSTEM_ADMIN | Auto-matched eligible students |

### Analytics — `/api/analytics`
| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/api/analytics/overview` | SCHOOL_ADMIN, SYSTEM_ADMIN, GOV_AUTHORITY, NGO_REP, DATA_VERIFIER | Overview stats |
| GET | `/api/analytics/grade-distribution` | SCHOOL_ADMIN, SYSTEM_ADMIN, GOV_AUTHORITY, NGO_REP, DATA_VERIFIER | Grade distribution |
| GET | `/api/analytics/subjects` | SCHOOL_ADMIN, SYSTEM_ADMIN, GOV_AUTHORITY, DATA_VERIFIER | Subject performance |
| GET | `/api/analytics/top-performers` | SCHOOL_ADMIN, SYSTEM_ADMIN, GOV_AUTHORITY, NGO_REP, DATA_VERIFIER | Top performers |
| GET | `/api/analytics/attendance-trends` | SCHOOL_ADMIN, SYSTEM_ADMIN, GOV_AUTHORITY, DATA_VERIFIER | Attendance trends |
| GET | `/api/analytics/score-histogram` | SCHOOL_ADMIN, SYSTEM_ADMIN, GOV_AUTHORITY, NGO_REP, DATA_VERIFIER | Merit score histogram |
| GET | `/api/analytics/institution-comparison` | SYSTEM_ADMIN, GOV_AUTHORITY | Compare institutions |
| GET | `/api/analytics/student/{studentId}` | Any authenticated | Individual student performance |
| POST | `/api/analytics/cache/evict` | SYSTEM_ADMIN | Evict all caches |

### Alerts — `/api/alerts`
| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/api/alerts/student/{studentId}` | STUDENT, PARENT, SCHOOL_ADMIN, SYSTEM_ADMIN | Alerts for student |
| GET | `/api/alerts/institution/{institutionId}` | SCHOOL_ADMIN, SYSTEM_ADMIN | Institution alerts |
| PUT | `/api/alerts/{alertId}/acknowledge` | SCHOOL_ADMIN, SYSTEM_ADMIN | Acknowledge alert |
| POST | `/api/alerts/generate/{institutionId}` | SCHOOL_ADMIN, SYSTEM_ADMIN | Generate ML alerts |
| GET | `/api/alerts/count/institution/{institutionId}` | SCHOOL_ADMIN, SYSTEM_ADMIN | Unacknowledged count |
| GET | `/api/alerts/count/student/{studentId}` | STUDENT, PARENT, SCHOOL_ADMIN, SYSTEM_ADMIN | Unacknowledged count |

### ML Models — `/api/admin/ml-models` (SYSTEM_ADMIN only)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/admin/ml-models/train` | Train new model |
| GET | `/api/admin/ml-models` | List model versions |
| GET | `/api/admin/ml-models/{id}` | Get model details |
| GET | `/api/admin/ml-models/health` | ML service health check |

### Audit Logs — `/api/audit-logs` (SYSTEM_ADMIN, GOV_AUTHORITY)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/audit-logs` | List audit logs (filterable) |

---

## 14. How to Run Locally

### Prerequisites
- Docker Desktop (for PostgreSQL, Redis, MinIO)
- Java 17+ (JDK)
- Node.js 18+ (for frontend)
- Python 3.10+ with conda/pip (for ML service)

### Step 1 — Start Infrastructure
```bash
cd c:\Users\ayush\Downloads\merit-quest
docker-compose up -d postgres redis minio
```
Verify: PostgreSQL on port 5434, Redis on port 6380, MinIO console at http://localhost:9001

### Step 2 — Start Backend
```bash
cd backend
./gradlew bootRun
```
Backend starts on http://localhost:8080. Flyway automatically runs all 8 migrations and seeds the default admin user.

### Step 3 — Start Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend starts on http://localhost:3000

### Step 4 — Start ML Service
```bash
cd ml-service
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 5000
```
ML service starts on http://localhost:5000

### Step 5 — Login
- Open http://localhost:3000
- Login as System Admin: `admin@meritquest.dev` / `Admin@123`
- Or register a new account with any role

---

## 15. Testing Guide — Every Feature

### Test Account
The system seeds one admin account:
- **Email**: admin@meritquest.dev
- **Password**: Admin@123
- **Role**: SYSTEM_ADMIN

### Test Flow (recommended order)

#### A. Registration & Login
1. Login as `admin@meritquest.dev` / `Admin@123` → Should see System Admin dashboard
2. Logout, register a new SCHOOL_ADMIN account (use Institution ID: 1)
3. Register a STUDENT account (Institution ID: 1)
4. Register a DATA_VERIFIER account
5. Register an NGO_REP account
6. Register a GOV_AUTHORITY account
7. Register a PARENT account
8. For each account, verify the sidebar shows only the correct navigation items (as per the Role Access Matrix above)

#### B. Student Management (as SCHOOL_ADMIN)
1. Login as SCHOOL_ADMIN → Navigate to "Students"
2. Click "Add Student" → Fill all required fields → Save
3. Verify the student appears in the list
4. Click to edit → Change a field → Save
5. Deactivate a student → Verify they disappear from the list

#### C. Bulk Upload (as SCHOOL_ADMIN)
1. Create a CSV file with these headers:
   ```
   enrollment_number,first_name,last_name,date_of_birth,gender,grade,section,guardian_name,guardian_phone,guardian_email,address
   ```
2. Add sample rows (see Section 16 for synthetic data)
3. Navigate to "Bulk Upload" → Upload the CSV
4. Watch the status change: PENDING → PROCESSING → COMPLETED
5. Navigate to "Students" → Verify the uploaded students appear
6. Test a CSV with intentional errors (missing required fields, invalid date format) → Verify the error report shows per-row issues

#### D. Verification (as DATA_VERIFIER)
1. Login as DATA_VERIFIER → Navigate to "Verification Queue"
2. You should see pending records from CSV uploads
3. Click a record → Review details → Approve with a comment
4. Click another → Reject with a reason
5. Filter by status (APPROVED, REJECTED) to see your decisions

#### E. Merit Calculation (as SCHOOL_ADMIN or SYSTEM_ADMIN)
1. Login as SCHOOL_ADMIN → Navigate to "Merit Lists"
2. Click "Calculate Merit" → Select scope (SCHOOL) and academic year (2025-2026)
3. Wait for the batch to complete
4. View the merit list — students should be ranked by composite score
5. Export to CSV and verify the data

#### F. Analytics (as SCHOOL_ADMIN)
1. Navigate to "Analytics"
2. Verify Overview shows correct student count
3. Check Grade Distribution chart
4. Check Subject Performance, Attendance Trends
5. Check Top Performers table
6. As GOV_AUTHORITY, verify Institution Comparison feature is visible

#### G. Scholarships (as NGO_REP)
1. Login as NGO_REP → Navigate to "Scholarships"
2. Click "Create Scholarship" → Fill all fields (title, amount, deadline, eligibility criteria)
3. Save → Verify it appears in the list
4. Navigate to "Applicants" → Should show your created scholarships
5. As STUDENT: Browse scholarships → Click one → Click "Apply"
6. As STUDENT: Navigate to "My Applications" → Verify the application appears
7. As NGO_REP: View applications for your scholarship → Approve one, reject another
8. As STUDENT: Check application statuses updated

#### H. ML & Alerts (as SYSTEM_ADMIN)
1. Navigate to "ML Models" → Click "Train Model"
2. Verify training completes and a new model version appears
3. Check model metrics (accuracy, precision, recall)
4. As SCHOOL_ADMIN: Navigate to "Alerts" → Click "Generate Alerts"
5. View generated alerts — check risk scores, severity colors
6. Expand an alert to see feature importances
7. Acknowledge an alert → Verify the badge counts update

#### I. Audit Log (as SYSTEM_ADMIN or GOV_AUTHORITY)
1. Navigate to "Audit Logs"
2. Verify entries from all previous actions appear
3. Filter by entity type → Verify correct results
4. Check that each entry shows who performed the action and when

#### J. Unauthorized Access (security check)
1. As STUDENT, try navigating to `/students` → Should redirect to `/unauthorized`
2. As NGO_REP, try navigating to `/admin/ml-models` → Should redirect
3. As DATA_VERIFIER, try navigating to `/upload` → Should redirect
4. Test API directly (Postman/curl): make a request to `/api/students` with a STUDENT token → Should get 403 Forbidden

---

*This guide covers how Merit Quest functions end-to-end, what makes it unique, all authentication & authorization mechanisms, what each of the 7 roles can access, and how to test every feature in the system.*

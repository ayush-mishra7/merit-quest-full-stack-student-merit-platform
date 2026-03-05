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
<img src="https://img.shields.io/badge/Phase-1%20of%208-blue?style=flat-square" alt="Phase" />
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
│   │   ├── common/                # Shared utilities
│   │   │   ├── dto/               # ApiResponse wrapper
│   │   │   ├── exception/         # Global exception handler
│   │   │   └── model/             # Enums (Role, UserStatus, InstitutionType)
│   │   ├── config/                # SecurityConfig, AsyncConfig
│   │   └── user/                  # User & Institution management
│   │       ├── entity/            # JPA entities
│   │       ├── repository/        # Spring Data repositories
│   │       └── service/           # UserService (UserDetailsService)
│   ├── src/main/resources/
│   │   ├── application.yml        # App configuration
│   │   └── db/migration/          # Flyway SQL migrations
│   ├── build.gradle               # Gradle build config
│   └── Dockerfile                 # Multi-stage Docker build
│
├── 📁 frontend/                   # React 18 + Vite
│   ├── src/
│   │   ├── components/            # Layout, Sidebar, ProtectedRoute
│   │   ├── pages/                 # Login, Register, Dashboard, etc.
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
| **Phase 2** | Student Data Management & Bulk Upload | 🔲 Planned |
| **Phase 3** | Verification Workflow & Audit Logging | 🔲 Planned |
| **Phase 4** | Merit Calculation Engine (Z-score, rankings) | 🔲 Planned |
| **Phase 5** | Analytics Dashboards (Recharts) | 🔲 Planned |
| **Phase 6** | Scholarship Management | 🔲 Planned |
| **Phase 7** | ML Pipeline — Dropout Prediction | 🔲 Planned |
| **Phase 8** | Production Deployment & DevOps | 🔲 Planned |

---

## 📊 Database Schema

```
┌──────────────┐     ┌──────────────────┐
│ institutions │     │      users       │
├──────────────┤     ├──────────────────┤
│ id       PK  │◄────│ institution_id FK│
│ name         │     │ id           PK  │
│ code    UQ   │     │ email       UQ   │
│ type         │     │ password_hash    │
│ board        │     │ first_name       │
│ district     │     │ last_name        │
│ state        │     │ role (enum)      │
│ active       │     │ status (enum)    │
│ created_at   │     │ phone            │
│ updated_at   │     │ created_at       │
└──────────────┘     │ updated_at       │
                     └──────────────────┘

  (Future phases will add: students, academic_records,
   attendance_records, activities, certificates,
   verification_queue, audit_logs, merit_scores,
   scholarships, scholarship_applications, alerts,
   ml_model_versions)
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

# Synthetic Data Generation Plan — Merit Quest

## Overview

This plan describes how to generate **realistic India-specific synthetic data** for the Merit Quest platform. All data follows Indian geography, naming conventions, school boards, and currency.

---

## 1. India Geography Hierarchy

### States → Districts → Cities → Schools

We'll create data for **5 major Indian states**, each with **3-4 districts**, each with **2-3 cities**, and **2-4 schools per city**. This gives us ~50 schools total.

| State | District | City | Schools |
|-------|----------|------|---------|
| **Delhi** | Central Delhi | New Delhi | Delhi Public School (DPS Central) - CBSE, Convent of Jesus & Mary - ICSE |
| | South Delhi | Hauz Khas | Modern School Hauz Khas - CBSE, Sanskriti School - CBSE |
| | East Delhi | Preet Vihar | Bal Bharati Public School East - CBSE, Ryan International Preet Vihar - ICSE |
| | West Delhi | Janakpuri | Montfort School - ICSE, Air Force Bal Bharati - CBSE |
| **Maharashtra** | Mumbai Suburban | Andheri | St. Xavier's High School - ICSE, Jamnabai Narsee School - ICSE, DAV Public School Andheri - CBSE |
| | Mumbai City | Fort | Cathedral & John Connon - ICSE, St. Mary's School - ICSE |
| | Pune | Kothrud | Symbiosis School Kothrud - CBSE, Loyola High School - STATE_BOARD, DPS Pune - CBSE |
| | Nagpur | Civil Lines | Centre Point School - CBSE, St. Joseph's Convent - ICSE |
| **Karnataka** | Bengaluru Urban | Bengaluru | Bishop Cotton Boys' School - ICSE, Kendriya Vidyalaya Bengaluru - CBSE, National Public School - CBSE |
| | Mysuru | Mysuru | Maharani's Science College School - STATE_BOARD, DPS Mysore - CBSE |
| | Dharwad | Hubballi | KLE School Hubballi - STATE_BOARD, JNV Dharwad - CBSE |
| **Tamil Nadu** | Chennai | Chennai | Don Bosco Matriculation - STATE_BOARD, DAV Boys School Chennai - CBSE, Padma Seshadri Bala Bhavan - CBSE |
| | Coimbatore | Coimbatore | PSG Public School - CBSE, Stanes Anglo-Indian School - ICSE |
| | Madurai | Madurai | TVS Academy Madurai - CBSE, Thiagarajar Model School - STATE_BOARD |
| **Uttar Pradesh** | Lucknow | Lucknow | La Martiniere College - ICSE, City Montessori School - CBSE, Lucknow Public School - CBSE |
| | Noida | Noida | DPS Noida - CBSE, Amity International Noida - CBSE |
| | Varanasi | Varanasi | Sunbeam School Varanasi - CBSE, DPS Varanasi - CBSE |
| | Agra | Agra | St. Peter's College Agra - ICSE, Delhi Public School Agra - CBSE |

**Total: 5 states, 15 districts, ~25 cities, ~45 schools**

---

## 2. Unique ID Format

### Institution Codes
Format: `{STATE_CODE}-{DISTRICT_CODE}-{SCHOOL_NUM}`  
Example: `DL-CD-001` (Delhi, Central Delhi, School 1)

| State | Code | District Codes |
|-------|------|---------------|
| Delhi | DL | CD (Central), SD (South), ED (East), WD (West) |
| Maharashtra | MH | MS (Mumbai Suburban), MC (Mumbai City), PU (Pune), NG (Nagpur) |
| Karnataka | KA | BU (Bengaluru Urban), MY (Mysuru), DW (Dharwad) |
| Tamil Nadu | TN | CH (Chennai), CB (Coimbatore), MD (Madurai) |
| Uttar Pradesh | UP | LK (Lucknow), NO (Noida), VN (Varanasi), AG (Agra) |

### Student Enrollment Numbers
Format: `{INSTITUTION_CODE}/{YEAR}/{SEQUENTIAL}`  
Example: `DL-CD-001/2024/0001`

### Generated User Emails
Format: `{firstname}.{lastname}{num}@meritquest.test`  
Example: `arjun.sharma1@meritquest.test`

---

## 3. CSV Files to Generate

### 3A. `institutions.csv` — Direct SQL seed (~45 rows)

| Column | Type | Example |
|--------|------|---------|
| name | varchar | Delhi Public School Central |
| code | varchar | DL-CD-001 |
| type | SCHOOL/COLLEGE | SCHOOL |
| board | CBSE/ICSE/STATE_BOARD | CBSE |
| district | varchar | Central Delhi |
| state | varchar | Delhi |
| address | text | Mathura Road, New Delhi 110003 |
| contact_email | varchar | admin@dpscentral.meritquest.test |
| contact_phone | varchar | +91 11 2301XXXX |

Since institutions can't be uploaded via CSV (no bulk upload endpoint), this data will be seeded via a **Flyway migration SQL file** (V9).

---

### 3B. `users.csv` — All user accounts (~200 rows)

These will also be seeded via Flyway migration since user creation requires password hashing.

| Role | Count per institution | Naming |
|------|----------------------|--------|
| SCHOOL_ADMIN | 1 per school | school.admin.{school_code}@meritquest.test |
| DATA_VERIFIER | 1 per 3 schools | verifier.{district}@meritquest.test |
| NGO_REP | 2 per state | ngo.{org_name}@meritquest.test |
| GOV_AUTHORITY | 1 per state | gov.{state}@meritquest.test |
| STUDENT | linked to student records (optional) | student.{name}@meritquest.test |
| PARENT | linked to student records (optional) | parent.{name}@meritquest.test |

**Password for all test users: `Test@1234`** (BCrypt hashed in migration)

**Approximate user counts:**
- 45 SCHOOL_ADMINs (1 per school)
- 5 DATA_VERIFIERs (1 per state)
- 10 NGO_REPs (2 per state)
- 5 GOV_AUTHORITYs (1 per state)
- 20 STUDENT users (for login testing)
- 10 PARENT users (for login testing)
- **Total: ~96 user accounts**

---

### 3C. `students.csv` — Bulk upload CSV (~500 students)

This is the main CSV for the bulk upload feature. Generate ~10–15 students per school.

| Column | Required | Type | Example Values |
|--------|----------|------|---------------|
| enrollment_number | ✅ | varchar | DL-CD-001/2024/0001 |
| first_name | ✅ | varchar | Arjun, Priya, Rohan, Ananya, Vikram, Meera, Aditya, Kavya, Siddharth, Nisha |
| last_name | ✅ | varchar | Sharma, Patel, Singh, Kumar, Gupta, Reddy, Joshi, Nair, Pillai, Rao, Verma, Iyer, Deshmukh, Bhat, Mishra |
| date_of_birth | ✅ | YYYY-MM-DD | 2008-03-15 to 2012-12-30 (ages 12–17) |
| gender | ✅ | enum | MALE, FEMALE (50/50 split, ~2% OTHER) |
| grade | ✅ | varchar | 6, 7, 8, 9, 10, 11, 12 |
| section | ❌ | varchar | A, B, C, D |
| guardian_name | ❌ | varchar | {parent_first_name} {last_name} |
| guardian_phone | ❌ | varchar | +91 9XXXXXXXXX (random 10-digit) |
| guardian_email | ❌ | varchar | {guardian_first}.{last}@gmail.com |
| address | ❌ | text | {house_no}, {area}, {city}, {state} {pin} |

**Indian first names pool (50+ each gender):**

**Male**: Arjun, Vikram, Rohan, Aditya, Siddharth, Rahul, Amit, Karan, Nikhil, Varun, Aman, Ravi, Suresh, Ankit, Kunal, Sahil, Pranav, Ishaan, Dhruv, Yash, Dev, Aarav, Vihaan, Krishna, Aryan, Atharv, Reyansh, Ayaan, Vedant, Shaurya, Ayansh, Vivaan, Sai, Kabir, Advait, Arnav, Lakshya, Manav, Harsh, Parth, Chirag, Rushil, Neeraj, Piyush, Jayesh, Gaurav, Deepak, Mohan, Raj, Akash

**Female**: Priya, Ananya, Meera, Kavya, Nisha, Shreya, Pooja, Neha, Diya, Riya, Aanya, Saanvi, Aadhya, Myra, Aarohi, Anvi, Pari, Amaira, Isha, Kiara, Avni, Navya, Samaira, Tara, Zara, Lakshmi, Divya, Sneha, Aditi, Sakshi, Tanvi, Mansi, Radhika, Simran, Swati, Anjali, Kriti, Bhavya, Jiya, Mahi, Sanya, Trisha, Anika, Ridhi, Suhana, Vaishali, Pallavi, Nandini, Ritika, Khushi

**Last names pool (common Indian surnames, 30+):**
Sharma, Patel, Singh, Kumar, Gupta, Reddy, Joshi, Nair, Pillai, Rao, Verma, Iyer, Deshmukh, Bhat, Mishra, Chauhan, Tiwari, Yadav, Pandey, Dubey, Mandal, Das, Sen, Mukherjee, Banerjee, Chatterjee, Ghosh, Bose, Kapoor, Malhotra, Khanna, Mehra, Kohli

---

### 3D. `academic_records.sql` — SQL seed (~3000 rows)

Since academic records can't be bulk-uploaded via CSV in the current system, we'll seed these via SQL.

| Field | Values |
|-------|--------|
| student_id | FK to students (1–500) |
| subject | Mathematics, Science, English, Hindi, Social Studies, Computer Science, Physical Education |
| exam_type | UNIT_TEST_1, UNIT_TEST_2, MID_TERM, FINAL (4 exams per subject per year) |
| marks_obtained | Normal distribution: mean=65, stddev=15, clamped to 0–100 |
| max_marks | 100 |
| grade | Derived: A+ (≥90), A (≥80), B+ (≥70), B (≥60), C+ (≥50), C (≥40), D (<40) |
| academic_year | 2024-2025, 2025-2026 |
| semester | Semester 1, Semester 2 |
| institution_id | Same as student's institution |

**Distribution strategy for realistic data:**
- Top 10% students: marks 85–100 (mean 92)
- Middle 60% students: marks 50–84 (mean 67)
- Bottom 30% students: marks 20–55 (mean 40)
- Create 2–3 "dropout risk" students per school: marks consistently <35, attendance <60%

---

### 3E. `attendance_records.sql` — SQL seed (~5000 rows)

| Field | Values |
|-------|--------|
| student_id | FK to students |
| month | April, May, June, July, August, September, October, November, December, January, February, March |
| academic_year | 2024-2025, 2025-2026 |
| total_days | 20–26 (varies by month) |
| days_present | Based on student profile: good (90–100%), average (75–89%), poor (50–74%), at-risk (<50%) |
| days_absent | total_days - days_present |
| institution_id | Same as student's institution |

**Attendance profiles:**
- 60% of students: 90–100% attendance
- 25% of students: 75–89% attendance
- 10% of students: 50–74% attendance
- 5% of students: <50% attendance (these are dropout risks)

---

### 3F. `activities.sql` — SQL seed (~400 rows)

| Field | Values |
|-------|--------|
| student_id | ~60% of students have 1–3 activities |
| title | "Inter-School Cricket Tournament", "State-Level Science Olympiad", "Annual Art Exhibition", "NCC Camp", "Community Cleanliness Drive", "National Mathematics Olympiad", "School Debate Competition", "District Yoga Championship", "Cultural Dance Festival", "Code-a-thon 2025" |
| category | SPORTS, ARTS, ACADEMICS, COMMUNITY_SERVICE, LEADERSHIP, OTHER |
| description | Brief description of the activity |
| achievement | "Gold Medal", "First Place", "Participant", "Second Place", "State Finalist", "Certificate of Merit", "Best Speaker" |
| event_date | Dates within the 2024–2025 academic year |
| institution_id | Same as student's institution |

---

### 3G. `scholarships.sql` — SQL seed (~15 scholarships)

| Field | Example Values |
|-------|---------------|
| title | "PM Vidya Lakshmi Scholarship", "Tata Trust Merit Award", "HDFC Parivartan Scholarship", "Reliance Foundation Scholarships", "Azim Premji Foundation Education Grant", "State Merit Scholarship - Delhi", "Narotam Sekhsaria Foundation Scholarship", "ONGC Scholarship for SC/ST", "Sitaram Jindal Foundation Scholarship", "Central Sector Scheme of Scholarships" |
| organization_name | "PM Office, Govt. of India", "Tata Trusts", "HDFC Bank", "Reliance Foundation", "Azim Premji Foundation", "Govt. of Delhi", etc. |
| organization_type | GOVERNMENT, NGO, PRIVATE |
| amount | ₹5,000 – ₹1,00,000 per annum |
| currency | INR |
| total_slots | 10 – 500 |
| eligibility_criteria | `{"minCompositeScore": 0.3, "grades": ["10","12"]}` or `{"minCompositeScore": 0.5, "districts": ["Central Delhi","South Delhi"]}` |
| application_deadline | 2025-09-30 to 2025-12-31 |
| status | ACTIVE |

---

## 4. Data Generation Script Approach

The synthetic data will be generated in **two parts**:

### Part 1: Flyway Migration (V9__seed_synthetic_data.sql)
This SQL migration will:
1. Insert all 45 institutions
2. Insert all ~96 user accounts (with BCrypt-hashed passwords)
3. Insert all ~500 student records
4. Insert all ~3000 academic records
5. Insert all ~5000 attendance records
6. Insert all ~400 activity records
7. Insert all ~15 scholarships
8. Create verification queue items for all student records

### Part 2: CSV for Bulk Upload Testing
A separate `test_students_upload.csv` file with ~20 students for testing the bulk upload feature independently. This uses a specific institution (Institution ID 1 - the default seeded one).

---

## 5. Data Volume Summary

| Entity | Record Count | Notes |
|--------|-------------|-------|
| Institutions | ~45 | 5 states × ~9 schools |
| Users | ~96 | Admins, verifiers, NGOs, gov, some students/parents |
| Students | ~500 | 10–15 per school |
| Academic Records | ~3,000 | ~7 subjects × ~4-6 exams per student (sampled) |
| Attendance Records | ~5,000 | 10–12 months × 500 students (sampled) |
| Activities | ~400 | ~60% of students have 1–3 each |
| Scholarships | ~15 | Mix of NGO, government, private |
| Verification Queue | ~500 | One per student (auto-created with student) |
| **Total Records** | **~9,556** | |

---

## 6. Dropout Risk Profiles

To make the ML model training meaningful, we'll create distinct student profiles:

| Profile | % of Students | Academic Marks | Attendance | Activities |
|---------|--------------|---------------|------------|-----------|
| **Top Performer** | 10% (~50) | 85-100 avg | 95-100% | 2-3 activities with achievements |
| **Good Student** | 30% (~150) | 70-84 avg | 88-95% | 1-2 activities |
| **Average Student** | 30% (~150) | 50-69 avg | 75-87% | 0-1 activities |
| **Struggling** | 20% (~100) | 35-49 avg | 60-74% | 0 activities |
| **At Risk (Dropout)** | 10% (~50) | 15-34 avg | 30-59% | 0 activities, declining trend |

The "At Risk" students should show **declining trends** — their Unit Test 1 marks might be 45, then Mid-Term 38, then Final 25. Similarly, their attendance should decline month over month. This ensures the ML model has clear signal to learn from.

---

## 7. Indian-Specific Naming Conventions

### School Names
Follow patterns like:
- "{Founder/Saint} {Type}" — St. Xavier's High School, Convent of Jesus & Mary
- "{Organization} Public School" — Delhi Public School, Kendriya Vidyalaya
- "{Quality} {Type}" — Modern School, National Public School
- "{Person} Memorial" — Bal Bharati, La Martiniere

### Address Format
`{House/Flat No}, {Society/Area}, {City} - {PIN Code}, {State}`
Example: `42, Sector 15, Noida - 201301, Uttar Pradesh`

### Phone Numbers
Format: `+91 9{9 random digits}` (Indian mobile) or `+91 11 {8 digits}` (Delhi landline)

### Email Format
`{name}@{domain}` where domain is school-specific or `gmail.com` for guardians

---

## 8. Implementation Order

1. **First**: Create the Flyway V9 migration SQL file with all institutions, users, and students
2. **Second**: Create the academic records and attendance data (after students are inserted)
3. **Third**: Create activities and scholarships
4. **Fourth**: Create the test CSV file for bulk upload testing
5. **Fifth**: Run the backend to execute the migration, then verify data in the UI

All passwords for test accounts will be `Test@1234` (BCrypt hash: generated at migration time using `crypt()` PostgreSQL function or pre-computed hash).

---

## 9. Pre-computed BCrypt Hash

For `Test@1234` with BCrypt strength 12:
```
$2a$12$LQv3c1yqBo9SkvXS7QTJPOoqkMYKOb3tECLbuGHPHiFm12kf5GNiC
```

For `Admin@123` (already seeded):
```
$2a$12$... (already in V1 migration)
```

---

*This plan provides the foundation for generating ~10,000 realistic India-specific records across all Merit Quest entities, with proper geographic hierarchy, culturally appropriate names, realistic academic distributions, and intentional dropout risk profiles for ML training.*

# Campus Ambassador System - Data Models Documentation

## STEP 1: DATA MODELS EXPLANATION

### Overview
The Campus Ambassador (CA) management system requires 6 core tables to handle the complete workflow from application to performance tracking.

---

## 1. `hw-ca-applications` - Campus Ambassador Applications

**Purpose**: Stores all CA applications and their approval status.

**Key Fields**:
- `id`: Primary key
- `email`, `phone`: Unique identifiers to prevent duplicate applications
- `status`: PENDING → APPROVED/REJECTED workflow
- `ca_code`: Unique code generated on approval (e.g., "KVGCE001", "MIT002")
- `referral_link`: Generated link using ca_code (e.g., `/r/KVGCE001`)
- `performance_score`: Calculated score for leaderboard
- `verified_registrations`: Count of validated referrals
- `approved_tasks`: Count of completed tasks
- `is_organising_team_candidate`: Flag for top performers

**Relationships**:
- One-to-Many with `hw-ca-clicks` (one CA has many clicks)
- One-to-Many with `hw-ca-registrations` (one CA has many registrations)
- One-to-Many with `hw-ca-task-submissions` (one CA submits many tasks)
- Many-to-Many with `hw-ca-tasks` via `hw-ca-task-assignments`

**Why it exists**: Central table tracking CA identity, status, and performance metrics.

---

## 2. `hw-ca-clicks` - CA Click Tracking

**Purpose**: Logs every click on a CA referral link for analytics and fraud detection.

**Key Fields**:
- `ca_id`: Foreign key to CA application
- `ca_code`: Denormalized for fast lookups
- `ip_address`: For duplicate detection
- `user_agent`, `referrer`: Browser metadata
- `clicked_at`: Timestamp for analytics

**Relationships**:
- Many-to-One with `hw-ca-applications` (many clicks belong to one CA)

**Why it exists**: 
- Tracks referral link engagement
- Enables click-to-registration conversion analysis
- Helps detect self-clicks or fraudulent activity
- Provides analytics for CA performance

---

## 3. `hw-ca-registrations` - Validated CA Registrations

**Purpose**: Stores registrations that came through CA referral links, validated from Unstop export.

**Key Fields**:
- `ca_id`: Foreign key to CA
- `ca_code`: Denormalized for fast queries
- `participant_email`: Unique identifier from Unstop
- `unstop_registration_id`: Links to Unstop data
- `is_verified`: Admin verification flag
- `is_self_registration`: Flag if CA registered themselves
- `verified_by`, `verified_at`: Audit trail

**Relationships**:
- Many-to-One with `hw-ca-applications` (many registrations belong to one CA)

**Why it exists**:
- Separates clicks from actual registrations
- Only verified registrations count toward performance
- Prevents self-registration fraud
- Links Hackwise system to Unstop data
- Enables manual verification workflow

**Validation Rules**:
- Self registrations (`participant_email` matches CA `email`) are flagged but don't count
- Duplicate `unstop_registration_id` entries are prevented
- Only `is_verified=true` registrations contribute to CA score

---

## 4. `hw-ca-tasks` - CA Tasks

**Purpose**: Defines tasks that can be assigned to CAs.

**Key Fields**:
- `title`, `description`: Task details
- `task_type`: TEXT, FILE, SCREENSHOT, or MIXED
- `deadline`: Submission deadline
- `points_on_completion`: Base points (default 5)
- `bonus_points_early`: Bonus for early submission (default 2)
- `early_submission_hours`: Hours before deadline for bonus (default 24)
- `is_active`: Whether task is currently active

**Relationships**:
- Many-to-Many with `hw-ca-applications` via `hw-ca-task-assignments`
- One-to-Many with `hw-ca-task-submissions` (one task has many submissions)

**Why it exists**:
- Centralized task definitions
- Allows admin to create reusable tasks
- Supports flexible task types (text, file, screenshot, mixed)
- Configurable scoring system

---

## 5. `hw-ca-task-assignments` - Task Assignment Mapping

**Purpose**: Maps which tasks are assigned to which CAs (Many-to-Many relationship).

**Key Fields**:
- `task_id`: Foreign key to task
- `ca_id`: Foreign key to CA
- `assigned_at`: Timestamp

**Relationships**:
- Many-to-One with `hw-ca-tasks`
- Many-to-One with `hw-ca-applications`

**Why it exists**:
- Enables selective task assignment (not all CAs get all tasks)
- Supports "assign to all" or "assign to selected CAs" workflows
- Tracks assignment history
- Ensures CAs only see tasks assigned to them

**Enforcement**: 
- Unique constraint on `(task_id, ca_id)` prevents duplicate assignments
- CAs can only submit tasks they're assigned to (enforced in application logic)

---

## 6. `hw-ca-task-submissions` - CA Task Submissions

**Purpose**: Stores CA submissions for assigned tasks.

**Key Fields**:
- `task_id`, `ca_id`: Foreign keys
- `submission_text`: Text response (if task_type includes TEXT)
- `file_url`: Uploaded file path (if task_type includes FILE)
- `screenshot_url`: Screenshot path (if task_type includes SCREENSHOT)
- `submitted_at`: Submission timestamp
- `is_early_submission`: Calculated based on deadline
- `status`: PENDING → APPROVED/REJECTED
- `points_awarded`: Calculated points (base + bonus if early)
- `admin_feedback`: Review comments

**Relationships**:
- Many-to-One with `hw-ca-tasks`
- Many-to-One with `hw-ca-applications`

**Why it exists**:
- Stores all submission data (text, files, screenshots)
- Tracks submission status and review workflow
- Calculates points based on timing and approval
- Provides audit trail with `reviewed_by` and `reviewed_at`

**Constraints**:
- Unique constraint on `(task_id, ca_id)` ensures one submission per task per CA
- Submission deadline enforced in application logic
- File type/size limits enforced in upload handler

---

## DATA FLOW SUMMARY

1. **Application**: Student applies → `hw-ca-applications` (status: PENDING)
2. **Approval**: Admin approves → `hw-ca-applications` (status: APPROVED, ca_code generated)
3. **Referral**: User clicks `/r/{ca_code}` → `hw-ca-clicks` (logged)
4. **Registration**: User registers on Unstop → Admin imports → `hw-ca-registrations` (is_verified: false)
5. **Verification**: Admin verifies → `hw-ca-registrations` (is_verified: true) → Updates CA `verified_registrations` count
6. **Task Assignment**: Admin creates task → `hw-ca-tasks` → Assigns to CAs → `hw-ca-task-assignments`
7. **Submission**: CA submits → `hw-ca-task-submissions` (status: PENDING)
8. **Review**: Admin reviews → `hw-ca-task-submissions` (status: APPROVED/REJECTED, points_awarded) → Updates CA `approved_tasks` and `performance_score`
9. **Leaderboard**: System calculates scores → Top performers flagged as `is_organising_team_candidate`

---

## PERFORMANCE OPTIMIZATIONS

- **Indexes**: Added on frequently queried fields (status, ca_code, email, performance_score)
- **Denormalization**: `ca_code` stored in clicks/registrations for fast lookups without joins
- **Unique Constraints**: Prevent duplicates (email, phone, unstop_registration_id, task+ca combinations)
- **Foreign Keys**: Ensure referential integrity with CASCADE deletes where appropriate

---

## SECURITY CONSIDERATIONS

- Email/phone uniqueness prevents duplicate applications
- Self-registration detection via email matching
- Admin-only fields (`approved_by`, `verified_by`, `reviewed_by`) for audit trail
- Status-based access control (only APPROVED CAs get referral links)


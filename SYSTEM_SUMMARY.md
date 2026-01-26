# Campus Ambassador Management System - Complete Summary

## System Overview

A comprehensive Campus Ambassador (CA) management system for Hackwise 2.0 that tracks CA performance through referrals and task completion.

---

## Completed Steps (1-7)

### ✅ STEP 1: Data Models
- **6 Core Tables**: Applications, Clicks, Registrations, Tasks, Task Assignments, Task Submissions
- **Relationships**: Properly linked with foreign keys and indexes
- **Documentation**: Complete data model explanation in `CA_SYSTEM_DATA_MODELS.md`

### ✅ STEP 2: CA Application Flow
- **Public Page**: `/campus-ambassador` - Describes role, responsibilities, benefits
- **Application Form**: Collects required and optional fields
- **Validation**: Email format, phone validation, duplicate prevention
- **Success Page**: Confirmation with next steps
- **API**: `/api/ca/apply` - Handles submissions with status PENDING

### ✅ STEP 3: Admin CA Management
- **Admin Interface**: `/admin/ca` - View, filter, search applications
- **Actions**: Approve/Reject with admin notes
- **CA Code Generation**: Format `{college_abbreviation}{number}` (e.g., KVGCE001)
- **Codes Never Change**: Enforced in database and application logic
- **API**: `/api/admin/ca` - GET (list), POST (approve/reject)

### ✅ STEP 4: Referral Redirect System
- **Dynamic Route**: `/r/[ca_code]` - Validates and redirects
- **Click Tracking**: Logs IP, user agent, referrer, timestamp
- **Validation**: Checks CA code exists and is APPROVED
- **Redirect**: 3-second countdown → Unstop registration page
- **API**: `/api/ca/redirect/[ca_code]` - POST (validate and log)

### ✅ STEP 5: Registration Validation Process
- **Documentation**: Complete process in `REGISTRATION_VALIDATION_PROCESS.md`
- **Rules**: Self-registrations don't count, duplicates ignored, only verified count
- **API**: `/api/admin/ca/registrations` - GET, POST (import), PUT (verify)
- **Workflow**: Import → Review → Verify → Update Performance

### ✅ STEP 6: Admin Task Creation System
- **Task Management**: Create, update, deactivate tasks
- **Task Types**: TEXT, FILE, SCREENSHOT, MIXED
- **Assignment**: Assign to all CAs or selected CAs
- **API**: `/api/admin/ca/tasks` - CRUD operations
- **Assignment API**: `/api/admin/ca/tasks/assign` - Assign/unassign

### ✅ STEP 7: CA Task Dashboard & Submission (Partially Complete)
- **Authentication**: CA login with CA code + email
- **Session Management**: JWT-based sessions
- **APIs Created**:
  - `/api/ca/login` - CA authentication
  - `/api/ca/tasks` - Fetch assigned tasks
  - `/api/ca/tasks/submit` - Submit tasks
- **Constraints Enforced**:
  - Only assigned tasks visible
  - Deadline validation
  - One submission per task
  - File type validation (in API)
  - Early submission detection

**Remaining for STEP 7**: CA Dashboard UI page (`/ca/dashboard`) and Login UI page (`/ca/login`)

---

## Remaining Steps (8-10)

### STEP 8: Admin Task Review System
**Required**:
- Admin interface to view all submissions per task
- Open/view uploaded files and screenshots
- Approve/reject submissions with feedback
- Update CA performance on approval

**API Endpoint Needed**: `/api/admin/ca/tasks/submissions` - GET (list), PUT (review)

### STEP 9: Performance Scoring Logic
**Required**:
- Calculate performance score based on:
  - Verified registrations (weighted points)
  - Approved tasks (base points)
  - Early submissions (bonus points)
  - Rejected tasks (penalty)
- Update `performance_score` field in `hw-ca-applications`
- Deterministic and auditable formula

**Implementation**: Create scoring function, call on:
- Registration verification
- Task approval/rejection
- Manual recalculation endpoint

### STEP 10: Leaderboard and Rewards
**Required**:
- Leaderboard sorted by performance score
- Display verified registrations, approved tasks
- Minimum eligibility threshold
- Auto-mark top performers as organising team candidates
- Export winner lists

**Pages Needed**: `/admin/ca/leaderboard` - Admin view, `/ca/leaderboard` - Public view (optional)

---

## Complete System Flow

```
1. Student applies → hw-ca-applications (PENDING)
   ↓
2. Admin approves → CA code generated → Status APPROVED
   ↓
3. CA shares referral link → /r/{ca_code}
   ↓
4. User clicks → Click logged → Redirected to Unstop
   ↓
5. User registers on Unstop → Enters CA code
   ↓
6. Admin imports Unstop data → hw-ca-registrations (is_verified = FALSE)
   ↓
7. Admin verifies → is_verified = TRUE → CA verified_registrations++
   ↓
8. Admin creates task → Assigns to CAs → hw-ca-task-assignments
   ↓
9. CA views tasks → Submits → hw-ca-task-submissions (PENDING)
   ↓
10. Admin reviews → Approves → CA approved_tasks++ → Points awarded
    ↓
11. Performance score calculated → Leaderboard updated
    ↓
12. Top performers → is_organising_team_candidate = TRUE
```

---

## Key Features

✅ **Duplicate Prevention**: Email/phone uniqueness, unstop_registration_id uniqueness
✅ **Self-Registration Detection**: Email matching prevents gaming
✅ **CA Code Immutability**: Codes never change after generation
✅ **Task Assignment Enforcement**: CAs only see assigned tasks
✅ **Deadline Enforcement**: Submissions blocked after deadline
✅ **One Submission Per Task**: Unique constraint prevents duplicates
✅ **Early Submission Bonus**: Automatic detection and bonus points
✅ **Audit Trail**: All actions logged with timestamps and admin info

---

## Database Tables Summary

1. **hw-ca-applications**: CA identity, status, performance metrics
2. **hw-ca-clicks**: Referral link click tracking
3. **hw-ca-registrations**: Validated registrations from Unstop
4. **hw-ca-tasks**: Task definitions
5. **hw-ca-task-assignments**: Task-to-CA mapping (many-to-many)
6. **hw-ca-task-submissions**: CA task submissions with review status

---

## Next Steps to Complete

1. **CA Dashboard UI** (`/ca/dashboard`): Display assigned tasks, submission interface
2. **CA Login UI** (`/ca/login`): Login form with CA code + email
3. **Admin Task Review UI** (`/admin/ca/tasks/review`): Review submissions, approve/reject
4. **Performance Scoring Function**: Implement calculation logic
5. **Leaderboard UI**: Display rankings, export functionality

All APIs are in place. Remaining work is primarily UI implementation following the established theme patterns.


# Registration Validation Process - STEP 5

## Overview
Since registrations happen on Unstop (external platform), we need a manual validation process to link Unstop registrations to Campus Ambassadors and ensure only verified registrations count toward CA performance.

---

## Validation Rules

### 1. Self-Registrations Do Not Count
**Rule**: If a participant's email matches the CA's email, it is flagged as a self-registration and does not count toward performance.

**Implementation**:
- Compare `participant_email` from Unstop export with `email` in `hw-ca-applications`
- Set `is_self_registration = TRUE` if match found
- Self-registrations are stored but excluded from performance calculations

**Why**: Prevents CAs from gaming the system by registering themselves.

---

### 2. Duplicate Entries Are Ignored
**Rule**: Only one registration per `unstop_registration_id` is allowed. Duplicate entries are rejected.

**Implementation**:
- `unstop_registration_id` has UNIQUE constraint in database
- On import, check if ID already exists
- If exists, skip or update existing record (admin decision)

**Why**: Prevents double-counting of registrations.

---

### 3. Only Verified Registrations Count
**Rule**: Only registrations with `is_verified = TRUE` contribute to CA performance scores.

**Implementation**:
- Admin manually reviews each registration
- Admin marks as verified after checking:
  - Registration is legitimate
  - Participant actually registered through CA's referral link
  - Not a self-registration
  - Not a duplicate

**Why**: Ensures accuracy and prevents fraud.

---

### 4. CA Code Matching
**Rule**: During Unstop registration, participants enter a CA code. This code is used to link registrations to CAs.

**Process**:
1. Participant clicks CA referral link: `/r/{ca_code}`
2. Participant is redirected to Unstop registration page
3. Participant enters CA code during Unstop registration (manual entry)
4. Admin exports Unstop registration data
5. Admin imports data into Hackwise system
6. System matches CA codes and creates `hw-ca-registrations` records
7. Admin verifies each registration
8. Verified registrations update CA `verified_registrations` count

**Why**: Links external registrations to internal CA tracking system.

---

## Validation Workflow

### Step 1: Export from Unstop
- Admin downloads Unstop registration export (CSV/Excel)
- Export contains: participant_name, participant_email, participant_phone, team_name, unstop_registration_id, registration_date, ca_code (if collected)

### Step 2: Import to Hackwise
- Admin uploads export file via admin interface
- System parses file and creates `hw-ca-registrations` records
- Each record starts with `is_verified = FALSE`
- System checks for:
  - Duplicate `unstop_registration_id` (skip if exists)
  - Self-registrations (flag `is_self_registration = TRUE`)
  - Valid CA code (must exist and be APPROVED)

### Step 3: Admin Verification
- Admin reviews each unverified registration
- Admin checks:
  - Registration is legitimate
  - CA code matches participant's claim
  - Not a duplicate or fake entry
- Admin marks as verified or rejects

### Step 4: Performance Update
- When registration is verified:
  - Update CA's `verified_registrations` count
  - Recalculate CA's `performance_score`
  - Update leaderboard rankings

---

## Data Flow

```
Unstop Registration
    ↓
Export CSV/Excel
    ↓
Admin Uploads to Hackwise
    ↓
System Creates hw-ca-registrations (is_verified = FALSE)
    ↓
Admin Reviews Each Registration
    ↓
Admin Marks as Verified (is_verified = TRUE)
    ↓
System Updates CA Performance Metrics
    ↓
Leaderboard Updated
```

---

## Edge Cases

### Case 1: Participant Forgot to Enter CA Code
**Handling**: Registration is imported but not linked to any CA. Admin can manually assign CA code if participant contacts support.

### Case 2: Invalid CA Code Entered
**Handling**: Registration is imported but `ca_id` is NULL. Admin can manually correct or leave unassigned.

### Case 3: Multiple Registrations from Same Email
**Handling**: Each registration has unique `unstop_registration_id`, so both are stored. Admin verifies legitimacy.

### Case 4: CA Code Changed After Registration
**Handling**: CA codes never change after generation (enforced in database). Historical registrations remain linked to original code.

---

## Performance Calculation Impact

**Verified Registrations**:
- Each verified registration contributes to CA's `verified_registrations` count
- Count is used in performance scoring formula
- Count is displayed on leaderboard

**Self-Registrations**:
- Stored for audit purposes
- Do NOT count toward `verified_registrations`
- Do NOT contribute to performance score

**Unverified Registrations**:
- Stored but pending review
- Do NOT count until verified
- Admin can verify in bulk or individually

---

## Admin Tools Required

1. **Import Interface**: Upload Unstop export file
2. **Verification Interface**: Review and verify registrations
3. **Bulk Actions**: Verify/reject multiple registrations
4. **Search/Filter**: Find registrations by CA, email, status
5. **Export**: Export verified registrations for reporting

---

## Audit Trail

All verification actions are logged:
- `verified_by`: Admin username
- `verified_at`: Timestamp
- `verification_notes`: Optional admin comments
- Logs table: Records all verification actions

This ensures transparency and allows auditing of the validation process.


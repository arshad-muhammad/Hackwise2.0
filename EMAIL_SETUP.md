# Email Setup for Campus Ambassador System

This document describes the email functionality integrated into the Campus Ambassador (CA) management system.

## Overview

The system uses [Resend](https://resend.com) to send transactional emails to Campus Ambassadors in two scenarios:

1. **CA Approval Email**: Sent automatically when an admin approves a CA application
2. **Task Assignment Email**: Sent automatically when a task is assigned to one or more CAs

## Environment Variables

Add the following environment variables to your `.env.local` or production environment:

```env
# Resend API Key (get from https://resend.com/api-keys)
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Optional: Custom from email address (defaults to 'Hackwise 2.0 <noreply@hackwise.spherehive.in>')
RESEND_FROM_EMAIL=Hackwise 2.0 <noreply@hackwise.spherehive.in>
```

## Setup Instructions

1. **Create a Resend Account**
   - Go to https://resend.com
   - Sign up for a free account
   - Navigate to API Keys section
   - Create a new API key
   - Copy the API key

2. **Verify Your Domain (Production)**
   - In Resend dashboard, go to Domains
   - Add your domain (e.g., `hackwise.spherehive.in`)
   - Follow DNS verification steps
   - Once verified, you can send from `noreply@hackwise.spherehive.in` or any subdomain

3. **Add Environment Variables**
   - Add `RESEND_API_KEY` to your `.env.local` file
   - Optionally add `RESEND_FROM_EMAIL` if you want a custom sender

## Email Templates

### CA Approval Email

**Trigger**: When admin approves a CA application via `/api/admin/ca` POST endpoint

**Template Variables**:
- `{{Name}}` → Replaced with CA's name
- `{{CA_CODE}}` → Replaced with generated CA code (e.g., KVGCE001)

**Content Includes**:
- Welcome message
- Benefits of being a CA
- Dashboard login URL
- CA Code and password instructions
- CTA button to dashboard

### Task Assignment Email

**Trigger**: 
- When creating a new task with assignments via `/api/admin/ca/tasks` POST endpoint
- When assigning existing task via `/api/admin/ca/tasks/assign` POST endpoint

**Template Variables**:
- `{{Name}}` → Replaced with CA's name
- Task details (title, description, deadline, type, points)

**Content Includes**:
- Task title and description
- Deadline information
- Points and bonus points
- Task type
- CTA button to dashboard

## Implementation Details

### Files Created/Modified

1. **`lib/email.js`** (New)
   - Email utility functions
   - Template generation functions
   - `sendCAApprovalEmail()` - Sends approval email
   - `sendTaskAssignmentEmail()` - Sends task assignment email

2. **`app/api/admin/ca/route.js`** (Modified)
   - Added email sending after CA approval
   - Email failures are logged but don't block approval

3. **`app/api/admin/ca/tasks/route.js`** (Modified)
   - Added email sending when creating tasks with assignments
   - Fetches CA details (name, email) for email sending

4. **`app/api/admin/ca/tasks/assign/route.js`** (Modified)
   - Added email sending when assigning tasks separately
   - Fetches CA details and task details for email

### Error Handling

- Email sending is **non-blocking** - if email fails, the operation (approval/assignment) still succeeds
- Email failures are logged to `hw-logs` table with level `WARN`
- Console errors are logged for debugging
- API responses include `email_sent` or `emails_sent` field indicating success

### Email Sending Behavior

- **Async**: Emails are sent asynchronously using `Promise.all()` to avoid blocking API responses
- **Batch**: When assigning to multiple CAs, all emails are sent in parallel
- **Graceful Degradation**: If Resend API key is missing, operations still succeed but emails are skipped

## Testing

### Test CA Approval Email

1. Go to Admin CA Management page
2. Approve a pending CA application
3. Check the CA's email inbox
4. Verify email contains correct name and CA code

### Test Task Assignment Email

1. Go to Admin CA Tasks page
2. Create a new task and assign it to one or more CAs
3. Check assigned CAs' email inboxes
4. Verify email contains correct task details

### Test Without Resend (Development)

If `RESEND_API_KEY` is not set:
- Operations will still work
- Console will show: "RESEND_API_KEY not configured"
- No emails will be sent
- This allows development without email setup

## Troubleshooting

### Emails Not Sending

1. **Check API Key**: Verify `RESEND_API_KEY` is set correctly
2. **Check Domain**: In production, ensure domain is verified in Resend
3. **Check Logs**: Review `hw-logs` table for email failure entries
4. **Check Console**: Look for error messages in server console

### Email Format Issues

- Templates use inline CSS for maximum email client compatibility
- Images use absolute URLs (Hackwise logo)
- All links use HTTPS

### Rate Limits

- Resend free tier: 3,000 emails/month
- Resend paid tiers: Higher limits
- If hitting limits, consider batching or upgrading plan

## Future Enhancements

Potential improvements:
- Email templates for task submission confirmations
- Email templates for performance score updates
- Email templates for rejection notifications
- Email preferences/unsubscribe functionality
- Email analytics and tracking


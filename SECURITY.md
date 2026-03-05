# 🔐 Security Policy — Hackwise 2.0

> This document outlines the security policy for **Hackwise 2.0**, a national-level SaaS hackathon platform built by **Sphere Hive** at KVG College of Engineering. We take security seriously and appreciate responsible disclosures from the community.

---

## 📋 Table of Contents

- [Supported Versions](#-supported-versions)
- [Reporting a Vulnerability](#-reporting-a-vulnerability)
- [Response Timeline](#-response-timeline)
- [Security Architecture](#-security-architecture)
- [Authentication & Authorization](#-authentication--authorization)
- [API Security](#-api-security)
- [Database Security](#-database-security)
- [Payment Security](#-payment-security)
- [Environment Variable Security](#-environment-variable-security)
- [Dependency Security](#-dependency-security)
- [Known Patched Vulnerabilities](#-known-patched-vulnerabilities)
- [Security Best Practices for Contributors](#-security-best-practices-for-contributors)
- [Disclosure Policy](#-disclosure-policy)

---

## ✅ Supported Versions

Only the latest production version of Hackwise 2.0 is actively maintained for security patches.

| Version | Supported          |
|---------|--------------------|
| Latest (`main` branch) | ✅ Active support |
| Older commits / forks  | ❌ Not supported  |

> If you are running a self-hosted fork, please keep all dependencies up to date and follow the guidance in this document.

---

## 🐛 Reporting a Vulnerability

**Please do NOT open a public GitHub Issue for security vulnerabilities.**

Instead, report vulnerabilities responsibly through one of the following channels:

| Channel | Contact |
|---------|---------|
| 📧 **Email** | `spherehive@kvgce.ac.in` |
| 🔒 **GitHub** | Use [GitHub Private Vulnerability Reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing/privately-reporting-a-security-vulnerability) |

### What to Include in Your Report

To help us triage and fix the issue quickly, please include:

- **Description** — A clear summary of the vulnerability
- **Affected component** — Which API route, page, or module is affected
- **Steps to reproduce** — Minimal, reproducible proof-of-concept (PoC)
- **Impact assessment** — What an attacker could potentially achieve
- **Suggested fix** *(optional but appreciated)*

---

## ⏱ Response Timeline

| Stage | Target Time |
|-------|-------------|
| **Acknowledgement** | Within **48 hours** |
| **Initial triage** | Within **5 business days** |
| **Patch or mitigation** | Within **14 days** (critical), **30 days** (moderate/low) |
| **Public disclosure** | Coordinated with reporter after patch is live |

We will keep you informed throughout the process and credit you in the advisory (unless you prefer to remain anonymous).

---

## 🏗 Security Architecture

Hackwise 2.0 is built on the following security-conscious stack:

| Layer | Technology | Security Notes |
|-------|-----------|----------------|
| **Framework** | Next.js 16 (App Router) | Server-side rendering, no client-side DB exposure |
| **Auth** | `jose` (JWT) | Signed tokens, verified in middleware |
| **Database** | MySQL via `mysql2` connection pool | Parameterized queries, no raw string interpolation |
| **Payments** | Razorpay | Server-side order creation, signature verification |
| **File Uploads** | Cloudinary | Secure CDN, no direct filesystem writes in production |
| **Email** | Resend API | Server-side only, no credential exposure to client |
| **Hosting** | Vercel | HTTPS enforced, environment variables isolated |

---

## 🔑 Authentication & Authorization

### Admin Panel

- Access is controlled by **JWT session tokens** stored in `HttpOnly` cookies (`admin_session`)
- All `/admin/*` and `/api/admin/*` routes are protected by `middleware.js`
- Unauthenticated requests to admin API routes receive a `401 Unauthorized` response
- Unauthenticated page visits are redirected to `/admin/login`

### Team Dashboard

- Teams authenticate via credentials and receive a **JWT** stored in `HttpOnly` cookie (`team_session`)
- All `/dashboard/*` and `/api/team/*` routes are verified via `verifyTeamSession()`
- Session verification is done **server-side** in middleware before any route handler executes

### Campus Ambassador (CA) Dashboard

- CAs authenticate and receive a **JWT** stored in `HttpOnly` cookie (`ca_session`)
- All `/campus-ambassador/*` and `/api/ca/*` routes (except public apply/login endpoints) require valid CA session
- Session verification is done **server-side** in middleware

### Token Handling

```
// Tokens are verified using jose (JOSE standard - JWS/JWE)
// Never stored in localStorage or sessionStorage
// Always HttpOnly, Secure (in production), SameSite cookies
```

> ⚠️ **Never expose the `JWT_SECRET` or `ADMIN_PASSWORD` environment variables** to the client side or commit them to version control.

---

## 🛡 API Security

### Input Validation

- All API routes validate required fields before processing
- Missing or invalid fields return `400 Bad Request` with descriptive error messages
- Numeric fields are validated with `parseInt()` / `parseFloat()` and range-checked

### Duplicate & Race Condition Protection

- The accommodation booking API uses a **database-level `UNIQUE KEY`** on `(team_lead_email, check_in_date)` to prevent duplicate bookings
- Application-level pre-checks detect existing records and either update them (for payment retry) or reject with `409 Conflict`
- `ER_DUP_ENTRY` database errors are explicitly caught and handled

### Error Handling & Information Leakage

- All API routes catch errors and return **generic error messages** to the client
- Detailed error information (stack traces, SQL errors) is **logged server-side only**, never sent to the client
- Analytics failures are silently swallowed (`200 OK` with `success: false`) to avoid leaking server state

### Rate Limiting

> ⚠️ **Recommendation**: Consider adding rate limiting (e.g., via Vercel Edge middleware or `upstash/ratelimit`) to registration and accommodation booking endpoints to prevent abuse.

---

## 🗄 Database Security

### Parameterized Queries

All database interactions use **parameterized queries** via `mysql2` to prevent SQL injection:

```js
// ✅ Safe — parameterized
await pool.query(
  'SELECT * FROM `hw-teams` WHERE email = ?',
  [userEmail]
);

// ❌ Unsafe — never done in this codebase
await pool.query(`SELECT * FROM hw-teams WHERE email = '${userEmail}'`);
```

### Auto-Table Creation

- Critical tables (`hw-accommodation-queries`, `hw-analytics`, `hw-visitors`, `hw-logs`) are auto-created using `CREATE TABLE IF NOT EXISTS` on first access
- This prevents startup race conditions without exposing schema management endpoints publicly

### Connection Security

- Database credentials are stored exclusively in **environment variables** (`.env.local` / Vercel project settings)
- The connection pool (`lib/db.js`) uses SSL/TLS in production environments where supported
- `ECONNREFUSED` errors are caught and return a user-friendly `503 Service Unavailable` instead of leaking connection details

### Access Control

- Database user should have **least-privilege** permissions — only `SELECT`, `INSERT`, `UPDATE`, `DELETE` on the application's tables
- No `DROP`, `CREATE USER`, `GRANT`, or `SUPER` privileges should be assigned to the app DB user

---

## 💳 Payment Security

Hackwise 2.0 uses **Razorpay** for accommodation payment processing.

### Order Creation (Server-Side)

- Razorpay orders are created **exclusively on the server** via `/api/accommodation/create-order`
- The `RAZORPAY_KEY_SECRET` is **never exposed** to the client
- Only the `RAZORPAY_KEY_ID` (public key) and `order_id` are sent to the browser

### Signature Verification

- All payment callbacks verify the **Razorpay HMAC-SHA256 signature** before marking a payment as successful
- This prevents forged payment success notifications

### Key Validation

- The server validates that Razorpay keys are properly configured (not placeholder values) before processing any order
- Returns `500` with a human-readable error if keys are missing, preventing silent misconfiguration

### PCI Compliance

- Card data is **never handled or stored** by this application
- All sensitive card processing happens within Razorpay's PCI-DSS compliant infrastructure

---

## 🌍 Environment Variable Security

### Required Variables

The following environment variables contain sensitive secrets and must **never** be committed to version control:

| Variable | Sensitivity | Usage |
|----------|-------------|-------|
| `DATABASE_URL` | 🔴 Critical | MySQL connection string |
| `JWT_SECRET` | 🔴 Critical | JWT signing key for all sessions |
| `ADMIN_PASSWORD` | 🔴 Critical | Admin panel login |
| `RAZORPAY_KEY_SECRET` | 🔴 Critical | Payment signature verification |
| `RESEND_API_KEY` | 🟠 High | Email sending |
| `CLOUDINARY_API_SECRET` | 🟠 High | Image upload authentication |
| `RAZORPAY_KEY_ID` | 🟡 Medium | Public Razorpay key (still keep private in env) |
| `CLOUDINARY_API_KEY` | 🟡 Medium | Cloudinary API key |
| `NEXT_PUBLIC_*` | 🟢 Low | Safely exposed to browser — add no secrets here |

### Rules

1. **Never** commit `.env.local` or any file containing real secrets
2. The `.gitignore` must include `.env*` (excluding `.env.example`)
3. Use **Vercel Environment Variables** for production deployments
4. Rotate secrets immediately if accidentally exposed
5. Use separate keys for development and production environments

---

## 📦 Dependency Security

We use **GitHub Dependabot** for automated dependency vulnerability scanning. Dependencies are reviewed and patched regularly.

### Automated Tooling

| Tool | Purpose |
|------|---------|
| **Dependabot** | Automated alerts & PRs for vulnerable dependencies |
| `npm audit` | Manual local vulnerability scanning |
| `npm audit fix` | Auto-patching of compatible vulnerability fixes |

### Update Policy

- **Critical** vulnerabilities: Patched within **7 days**
- **High** severity: Patched within **14 days**
- **Moderate/Low**: Reviewed within **30 days**

---

## 🩹 Known Patched Vulnerabilities

The following vulnerabilities have been identified and patched in this project:

### `swiper` — Prototype Pollution

| Field | Detail |
|-------|--------|
| **Package** | `swiper` (npm) |
| **CVEs** | CVE-2026-25521, CVE-2026-25047, CVE-2026-26021 |
| **Affected versions** | `>= 6.5.1, < 12.1.2` |
| **Patched version** | `12.1.2` |
| **Severity** | 🔴 High |
| **Status** | ✅ **Patched** — upgraded to `^12.1.2` in `package.json` |
| **Description** | A bypass of prototype pollution protection via `Array.prototype.indexOf` override allowed attackers to pollute `Object.prototype`, potentially enabling authentication bypass, DoS, or RCE in downstream applications |

---

### `minimatch` — ReDoS (Multiple)

| Field | Detail |
|-------|--------|
| **Package** | `minimatch` (npm) |
| **Advisories** | GHSA-3ppc-4f35-3m26, GHSA-7r86-cg39-jmmj, GHSA-23c5-xmqv-rm74, GHSA-2g4f-4pwh-qvx6 |
| **Severity** | 🟠 High (Development dependency) |
| **Status** | ✅ **Patched** — updated via `npm audit fix` in `package-lock.json` |
| **Description** | Multiple Regular Expression Denial of Service (ReDoS) vulnerabilities in `minimatch` via repeated wildcards, non-adjacent GLOBSTAR segments, and nested `*()` extglobs that generate catastrophically backtracking regular expressions |

---

### `ajv` — ReDoS via `$data` option

| Field | Detail |
|-------|--------|
| **Package** | `ajv` (npm) |
| **Severity** | 🟡 Moderate (Development dependency) |
| **Status** | ✅ **Patched** — updated via `npm audit fix` in `package-lock.json` |
| **Description** | A ReDoS vulnerability when using the `$data` option in `ajv` JSON schema validation |

---

## 👩‍💻 Security Best Practices for Contributors

If you are contributing to this project, please follow these guidelines:

### Code

- [ ] **Never** use string interpolation for SQL queries — always use parameterized queries
- [ ] **Never** log sensitive data (passwords, tokens, payment IDs) to the console
- [ ] **Never** expose internal error details to API responses — log server-side, return generic messages to clients
- [ ] Validate and sanitize **all** user inputs on the server side, even if validated on the client
- [ ] Use `HttpOnly`, `Secure`, and `SameSite=Strict` flags on all authentication cookies
- [ ] Implement **least-privilege** access — API routes should only access data relevant to the authenticated user's role

### Dependencies

- [ ] Run `npm audit` before submitting a PR
- [ ] Do not add dependencies with known critical/high vulnerabilities
- [ ] Prefer well-maintained packages with recent update histories
- [ ] Keep `package.json` and `package-lock.json` in sync

### Environment & Secrets

- [ ] Test with placeholder values in `.env.local` — never use real production secrets locally unless absolutely necessary
- [ ] Add new environment variables to `.env.example` (with placeholder values) when introducing them
- [ ] Never hardcode API keys, passwords, or secrets anywhere in the source code

### Pull Requests

- [ ] Security-sensitive changes (auth, payment, DB schema) require extra review scrutiny
- [ ] Reference any related CVEs or security advisories in the PR description

---

## 📢 Disclosure Policy

We follow a **coordinated disclosure** model:

1. Reporter submits vulnerability privately
2. We acknowledge within 48 hours
3. We investigate and develop a fix
4. Reporter is notified when a patch is ready
5. Fix is deployed to production
6. Public advisory is published (crediting the reporter unless anonymity is requested)

We request a **minimum 14-day embargo** after a patch is ready before public disclosure, to allow all users time to update.

---

## 🙏 Acknowledgements

We thank the security researchers and open-source community members who have responsibly disclosed vulnerabilities and helped make Hackwise 2.0 more secure.

---

<div align="center">

**Hackwise 2.0** · Built by [Muhammad Arshad R A](https://spherehive.in/member/sh001) · SPHERE HIVE  
Questions? Reach us at `spherehive@kvgce.ac.in`

</div>


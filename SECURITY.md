# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | ✅ Current release |

## Reporting a Vulnerability

If you discover a security vulnerability in CTOS, please report it responsibly.

### How to Report

1. **Do NOT open a public GitHub issue** for security vulnerabilities
2. Email the maintainers at **bhavikpatel13792@gmail.com** with:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### Response Timeline

- **Acknowledgment:** Within 48 hours
- **Assessment:** Within 1 week
- **Fix & Disclosure:** Within 30 days (or sooner if critical)

### What to Expect

- We will acknowledge receipt of your report
- We will investigate and assess the impact
- We will work on a fix and coordinate disclosure
- We will credit you in the security advisory (unless you prefer to remain anonymous)

## Security Considerations

CTOS is designed for chemical terminal operations. While this is an open-source project, deployments handling real operational data should:

- Use strong JWT secrets in production
- Enable HTTPS for all connections
- Restrict database access with proper credentials
- Implement network-level security (firewalls, VPNs)
- Regularly audit user access and role assignments
- Keep all dependencies up to date

## Current Security Measures

- **JWT Authentication** with token expiry
- **Role-Based Access Control** (RBAC) with 6 defined roles
- **Input validation** using Zod schemas
- **Parameterized queries** via Prisma ORM (SQL injection prevention)
- **CORS** configured for allowed origins only
- **Helmet.js** for HTTP security headers
- **Append-only event log** for full audit trail

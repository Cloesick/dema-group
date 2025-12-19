3# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it responsibly:

**Email:** info@demashop.be

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact

We will respond within 48 hours and work to address the issue promptly.

## Security Measures

This project implements the following security measures:

### Authentication & Authorization
- NextAuth.js for secure authentication
- Role-based access control (Admin, Employee, Customer)
- Session management with secure cookies

### Data Protection
- All sensitive data stored in environment variables
- No hardcoded credentials in source code
- HTTPS enforced in production

### Input Validation
- Server-side validation on all API endpoints
- Sanitization of user inputs
- CSRF protection via NextAuth

### File Upload Security
- File type validation
- Size limits enforced
- Secure file storage paths

## Environment Variables

Never commit the following to version control:
- `.env`
- `.env.local`
- `.env.production`
- Any file containing API keys, secrets, or passwords

Use `.env.example` as a template for required environment variables.

## Dependencies

- Regular dependency updates via Dependabot
- Security audits with `npm audit`

## Contact

For security concerns: info@demashop.be

# MiroHero Chrome Extension Constitution

## Core Principles

### Manifest v3 Compliance
All extension code and configuration MUST comply with Chrome Manifest v3 requirements. Service workers, permissions, and background logic MUST be implemented according to official documentation. No deprecated APIs allowed.
Rationale: Ensures compatibility, security, and future-proofing.

### Content Security Policy (CSP)
All scripts, styles, and resources MUST adhere to a strict CSP. Inline scripts and eval() are forbidden. Only trusted sources allowed for external resources.
Rationale: Prevents XSS and other injection attacks.

### Permission Management
Permissions MUST be minimized and justified. Only request permissions essential for functionality. All permission changes require review and documentation.
Rationale: Reduces attack surface and increases user trust.

### Storage API Usage
All sensitive data MUST be stored using Chrome's storage API with least privilege. No plaintext secrets or passwords in code or local storage. Data access and mutation MUST be encapsulated and tested.
Rationale: Protects user data and supports extension portability.

### Security & Performance
All code MUST be reviewed for security vulnerabilities and performance bottlenecks. Use Chrome extension best practices for async operations, event listeners, and resource management. No blocking operations in background or content scripts.
Rationale: Ensures safe, fast, and reliable user experience.

### Code Quality & Testing
Code MUST be modular, readable, and covered by automated tests. Linting and formatting tools MUST be used. All features require unit and integration tests before release.
Rationale: Maintains maintainability and reduces bugs.

## Workflow
All code changes require peer review. Automated tests MUST pass before merging. Manual testing on latest Chrome required before release. All permission and storage changes require explicit review. Versioning follows semantic rules: MAJOR for breaking changes, MINOR for new principles, PATCH for clarifications.

## Standards
All code MUST pass Chrome extension security review. Performance targets: UI actions <200ms, background tasks <500ms. No unnecessary dependencies. All third-party libraries MUST be vetted for security and license compliance.

## Governance
This constitution supersedes all other practices. Amendments require documentation, approval, and a migration plan. All PRs and reviews MUST verify compliance. Complexity must be justified. Runtime guidance for agents lives in `AGENTS.md`.

**Version**: 1.0.0 | **Ratified**: 2025-09-28 | **Last Amended**: 2025-09-28

This constitution supersedes all other practices. Amendments require documentation, approval, and migration plan. All PRs/reviews MUST verify compliance with principles. Complexity must be justified. Use this document for runtime development guidance.

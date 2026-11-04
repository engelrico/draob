# [PROJECT_NAME] Constitution
<!-- Example: Spec Constitution, TaskFlow Constitution, etc. -->
# MiroHero Chrome Extension Constitution

## Core Principles

### [PRINCIPLE_1_NAME]
<!-- Example: I. Library-First -->
Manifest v3 Compliance
All extension code and configuration MUST comply with Chrome Manifest v3 requirements. Service workers, permissions, and background logic MUST be implemented according to official documentation. No deprecated APIs allowed.
Rationale: Ensures compatibility, security, and future-proofing.

### [PRINCIPLE_2_NAME]
<!-- Example: II. CLI Interface -->
Content Security Policy (CSP)
All scripts, styles, and resources MUST adhere to a strict CSP. Inline scripts and eval() are forbidden. Only trusted sources allowed for external resources.
Rationale: Prevents XSS and other injection attacks.

### [PRINCIPLE_3_NAME]
<!-- Example: III. Test-First (NON-NEGOTIABLE) -->
Permission Management
Permissions MUST be minimized and justified. Only request permissions essential for functionality. All permission changes require review and documentation.
Rationale: Reduces attack surface and increases user trust.

### [PRINCIPLE_4_NAME]
<!-- Example: IV. Integration Testing -->
Storage API Usage
All sensitive data MUST be stored using Chrome's storage API with least privilege. No plaintext secrets or passwords in code or local storage. Data access and mutation MUST be encapsulated and tested.
Rationale: Protects user data and supports extension portability.

### [PRINCIPLE_5_NAME]
<!-- Example: V. Observability, VI. Versioning & Breaking Changes, VII. Simplicity -->
Security & Performance
All code MUST be reviewed for security vulnerabilities and performance bottlenecks. Use Chrome extension best practices for async operations, event listeners, and resource management. No blocking operations in background or content scripts.
Rationale: Ensures safe, fast, and reliable user experience.

Code Quality & Testing
Code MUST be modular, readable, and covered by automated tests. Linting and formatting tools MUST be used. All features require unit and integration tests before release.
Rationale: Maintains maintainability and reduces bugs.

## [SECTION_2_NAME]
<!-- Example: Additional Constraints, Security Requirements, Performance Standards, etc. -->
Development Workflow & Quality Gates
All code changes require peer review. Automated tests MUST pass before merging. Manual testing on latest Chrome required before release. All permission and storage changes require explicit review. Versioning follows semantic rules: MAJOR for breaking changes, MINOR for new principles, PATCH for clarifications.
<!-- Example: Technology stack requirements, compliance standards, deployment policies, etc. -->

## [SECTION_3_NAME]
<!-- Example: Development Workflow, Review Process, Quality Gates, etc. -->
Security & Performance Standards
All code MUST pass Chrome extension security review. Performance targets: UI actions <200ms, background tasks <500ms. No unnecessary dependencies. All third-party libraries MUST be vetted for security and license compliance.
<!-- Example: Code review requirements, testing gates, deployment approval process, etc. -->

## Governance
<!-- Example: Constitution supersedes all other practices; Amendments require documentation, approval, migration plan -->

[GOVERNANCE_RULES]
<!-- Example: All PRs/reviews must verify compliance; Complexity must be justified; Use [GUIDANCE_FILE] for runtime development guidance -->

**Version**: [CONSTITUTION_VERSION] | **Ratified**: [RATIFICATION_DATE] | **Last Amended**: [LAST_AMENDED_DATE]
<!-- Example: Version: 2.1.1 | Ratified: 2025-06-13 | Last Amended: 2025-07-16 -->
<!--
Sync Impact Report
Version change: 0.0.0 → 1.0.0
Modified principles: All replaced with Chrome Extension principles
Added sections: Security & Performance Standards, Development Workflow & Quality Gates
Removed sections: None (template sections replaced)
Templates requiring updates:
✅ plan-template.md (checked)
✅ spec-template.md (checked)
✅ tasks-template.md (checked)
⚠ commands/* (directory missing, manual check required)
⚠ README.md (missing, manual creation recommended)
Follow-up TODOs:
TODO(RATIFICATION_DATE): Set original ratification date if known
-->
**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): Set original ratification date if known | **Last Amended**: 2025-09-28

This constitution supersedes all other practices. Amendments require documentation, approval, and migration plan. All PRs/reviews MUST verify compliance with principles. Complexity must be justified. Use this document for runtime development guidance.
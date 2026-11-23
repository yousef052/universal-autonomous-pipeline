# ASP.NET Core Enterprise Backend Architect (Azure WAF 130-Step Master Roadmap)

This document provides the complete, unabridged **130-Step Engineering Master Roadmap** for constructing, auditing, and defending flagship **ASP.NET Core Web API** projects, aligned strictly with the five pillars of the **Microsoft Azure Well-Architected Framework (WAF)**.

---

## 🏛️ The 5 Pillars of Azure Well-Architected Framework (WAF)

- **[REL] Reliability:** Prevent data corruption, manage concurrent updates (Optimistic Concurrency), automatic retries with exponential backoff, transaction outbox, and deep readiness/liveness health checks.
- **[SEC] Security:** Zero Trust architecture, strict token lifecycle & rotation, automatic reuse detection, anti-IDOR resource ownership handlers, and defense-in-depth secret isolation.
- **[COST] Cost Optimization:** Slash CPU, memory, and database usage through selective projections (`.Select()`), connection pooling, scheduled cleanup workers, and multi-stage container optimization.
- **[OPS] Operational Excellence:** Centralized dependency governance, RFC 9457 `ProblemDetails`, Serilog structured JSON logging, OpenTelemetry distributed tracing, and automated architectural tests (`NetArchTest`).
- **[PERF] Performance Efficiency:** High-speed indexing (Composite/Filtered), `AsNoTracking()`, HybridCache/Redis cache-aside, non-blocking asynchronous calls with `CancellationToken`, and response compression.

---

## 🗺️ The Complete 130-Step Master Roadmap

---

### Phase 0: System Architecture, Blueprint & Visual Diagrams (Steps 0.1–0.10)
*Executed at the very start before writing a single line of code. Generates visual specifications and architectural foundations in `/docs`.*

0.1. **[OPS]** Define the **Problem Statement & Scope**, user personas (`Admin`, `User`, `Guest`), and the core system value proposition.  
0.2. **[OPS, SEC]** Document **Functional Requirements** as granular user stories categorized by role and permission level.  
0.3. **[REL, PERF, COST]** Specify measurable **Non-Functional Requirements (NFRs)** (e.g. API latency < 200ms p95, 99.9% uptime SLA).  
0.4. **[OPS]** Author **C4 Context Diagram** (using Mermaid.js) mapping system boundaries, external services, and actors.  
0.5. **[OPS, SEC]** Author **C4 Container Diagram** detailing interactions between ASP.NET Core API, SQL Server, Redis, and Worker services.  
0.6. **[REL, SEC]** Author **Sequence Diagrams** (in Mermaid) for critical flows: `Login + Refresh Token Rotation` and primary domain transaction.  
0.7. **[OPS]** Define architectural boundaries (**Bounded Contexts / Modules**) and assign responsibilities within Clean Architecture layers.  
0.8. **[SEC]** Build the **RBAC & Resource Ownership Matrix** mapping every planned endpoint to required permissions.  
0.9. **[OPS]** Establish `/docs` directory inside the repository as the living repository of architectural diagrams and specifications.  
0.10. **[OPS]** Author Architecture Decision Record **ADR-001** justifying Clean Architecture + SQL Server + Redis against Azure WAF pillars.

> **Phase 0 Starter Prompt:**
> ```markdown
> Role: Senior .NET Backend Architect & Mentor. I type all code manually in Visual Studio to master the stack.
> Strict Rules:
> 1. Work strictly one micro-step/document per response. Explain WHY (design, security, performance, Azure WAF) briefly BEFORE every artifact.
> 2. Clean Architecture (Domain has zero dependencies). RESTful Web API ONLY (no MVC).
> 3. Use Mermaid.js syntax for all diagrams so they render natively in GitHub Markdown.
> 
> Project Idea: [Insert project concept in two lines]
> 
> Task: We are starting Phase 0 (Steps 0.1–0.10): System Architecture & Project Blueprint. Break Steps 0.1 to 0.10 down into concrete micro-steps and wait for my approval to start Step 0.1.
> ```

---

### Phase 1: Architecture Foundation & Code Standards (Steps 1–10)
1. **[OPS]** Create Clean Architecture Solution with 4 projects (`Domain`, `Application`, `Infrastructure`, `API`) with strict inward dependency flow.
2. **[OPS]** Configure `Directory.Packages.props` for centralized NuGet version management to prevent version drift.
3. **[OPS, REL]** Enable `Nullable Reference Types` and `TreatWarningsAsErrors` in `Directory.Build.props` to eliminate runtime `NullReferenceException`.
4. **[OPS]** Configure `.editorconfig` enforcing C# naming conventions, file-scoped namespaces, and formatting rules.
5. **[OPS]** Implement modular Dependency Injection extensions per layer (`AddApplication()`, `AddInfrastructure()`).
6. **[OPS, REL]** Build Global Exception Handling Middleware adhering to **RFC 9457 (`ProblemDetails`)** with sanitized client errors.
7. **[OPS]** Configure **API Versioning** (`Asp.Versioning.Http`) from Day 1 to prevent breaking changes.
8. **[OPS]** Configure OpenAPI / Scalar / Swagger with JWT Bearer Token integration for interactive testing.
9. **[SEC, OPS]** Implement Options Pattern (`IOptions<T>`) with startup validation (`ValidateDataAnnotations().ValidateOnStart()`).
10. **[REL]** Add Middleware to ensure `CancellationToken` is propagated across all controllers and handlers.

---

### Phase 2: Domain Abstractions & Functional Result Pattern (Steps 11–20)
11. **[REL]** Create `BaseEntity` with strongly-typed IDs or `Guid`, encapsulating private setters.
12. **[SEC, OPS]** Implement `IAuditableEntity` (`CreatedAtUtc`, `CreatedBy`, `LastModifiedAtUtc`, `LastModifiedBy`).
13. **[REL]** Implement `ISoftDeletable` (`IsDeleted`, `DeletedAtUtc`, `DeletedBy`) to prevent physical loss of business data.
14. **[REL]** Implement `DomainEvents` inside `BaseEntity` to decouple domain side-effects.
15. **[PERF, REL]** Implement functional **Result Pattern** (`Result`, `Result<T>`, `Error`) to handle expected domain failures without throwing expensive exceptions.
16. **[OPS]** Build extension methods mapping domain `Error` instances directly to appropriate HTTP status codes (400, 404, 409).
17. **[REL]** Implement Guard Clauses inside domain entity factories/constructors to enforce an "Always-Valid Domain Model".
18. **[OPS]** Define generic repository interfaces (`IRepository<T>`) and `IUnitOfWork` strictly inside the `Application` layer.
19. **[SEC]** Define `ICurrentUserService` interface in `Application` to decouple user identity access from `HttpContext`.
20. **[OPS]** Define `IDateTimeProvider` to abstract system clock (`DateTimeOffset.UtcNow`) for deterministic testing.

---

### Phase 2.5: Database Architecture & Data Modeling (Steps 2.5.1–2.5.10)
*Executed after Phase 2 (Domain abstractions) and before Phase 3 (EF Core code & migrations).*

2.5.1. **[REL, OPS]** Analyze domain entities, extract exact attributes, and select appropriate SQL data types with bounds.  
2.5.2. **[REL, PERF]** Apply database normalization up to **3rd Normal Form (3NF)** to eliminate update, insertion, and deletion anomalies.  
2.5.3. **[PERF, COST]** Plan deliberate **Denormalization** cases (e.g. cached aggregations, order snapshots) to eliminate heavy analytical joins.  
2.5.4. **[PERF, REL]** Finalize Primary Key strategy: adopt **Sequential GUIDs (`Guid.CreateVersion7()`)** to eliminate clustered index fragmentation.  
2.5.5. **[REL, SEC]** Design relational cardinality (`1:1`, `1:N`, `M:N`) and define referential integrity (`Restrict`, `Cascade`, `Soft Delete`).  
2.5.6. **[OPS]** Author complete **Entity-Relationship Diagram (ERD)** in Mermaid.js and save to `/docs/database/erd.md`.  
2.5.7. **[OPS]** Author comprehensive **Data Dictionary** documenting every table, column, constraint, default value, and nullability.  
2.5.8. **[PERF, COST]** Map **Query Access Patterns**: identify top 10 critical read and write queries with expected execution frequency.  
2.5.9. **[PERF, COST]** Design **Indexing Blueprint** (Clustered, Non-Clustered Covering with `INCLUDE`, Filtered) based on actual query patterns.  
2.5.10. **[COST, REL]** Formulate **Data Retention & Archiving Strategy** for high-velocity tables (`AuditLogs`, `RefreshTokens`).

> **Phase 2.5 Transition Prompt:**
> ```markdown
> --- CHECKPOINT: PHASE 2 COMPLETED ---
> Ignore all intermediate drafts and troubleshooting above this line.
> Current State: Phase 0 Blueprint, Phase 1 Clean Architecture foundation, and Phase 2 Domain abstractions (`BaseEntity`, `IAuditableEntity`, `ISoftDeletable`, `DomainEvents`, `Result<T>`, and Application interfaces) are complete.
> Rules Reminder: One artifact/micro-step per response + explain WHY (performance, storage cost, integrity) first.
> 
> Next Task: Before writing any EF Core code in Phase 3, branch Phase 2.5 (Steps 2.5.1–2.5.10): Database Architecture & Data Modeling into concrete micro-steps and wait for my approval.
> ```

---

### Phase 3: Database Engineering, EF Core & Relational Constraints (Steps 21–30)
21. **[REL, PERF]** Configure `AppDbContext` in `Infrastructure` with optimized DbContext pooling (`AddDbContextPool`).
22. **[REL]** Enable EF Core **Connection Resiliency** (`EnableRetryOnFailure`) for automatic recovery from transient network breaks.
23. **[OPS]** Implement isolated entity configuration files implementing `IEntityTypeConfiguration<T>` loaded via `ApplyConfigurationsFromAssembly`.
24. **[REL, SEC]** Enforce strict database column limits in Fluent API (`HasMaxLength`, `HasPrecision`, `IsRequired`).
25. **[REL]** Add database-level **Check Constraints** (`HasCheckConstraint`) to guarantee invariants (e.g. `Price >= 0`).
26. **[SEC, REL]** Add **Unique Constraints / Indexes** on business-critical fields (e.g. Email, ReferenceCode) to prevent race-condition duplicates.
27. **[PERF, COST]** Design **Composite & Filtered Indexes** matching top read query patterns to prevent table scans.
28. **[REL]** Implement **Optimistic Concurrency Control** using `RowVersion` (`IsRowVersion()`) to prevent Lost Updates.
29. **[SEC, REL]** Configure EF Core **Global Query Filters** in `AppDbContext` to automatically exclude soft-deleted records (`!e.IsDeleted`).
30. **[OPS]** Review and verify the generated SQL migration script manually before execution to confirm indexing accuracy.

---

### Phase 4: Automated Auditing & EF Core Interceptors (Steps 31–40)
31. **[SEC]** Implement `CurrentUserService` in `API` extracting `UserId`, `Roles`, and `Permissions` safely from `ClaimsPrincipal`.
32. **[SEC, OPS]** Build `AuditableEntityInterceptor` inheriting from `SaveChangesInterceptor` to auto-populate audit stamps.
33. **[SEC, OPS]** Design `AuditLogs` table capturing granular changes (TableName, EntityId, Action, OldValues, NewValues as JSON, UserId).
34. **[SEC, OPS]** Extend the interceptor to inspect `ChangeTracker.Entries()` and record diffs into `AuditLogs` within the same transaction.
35. **[REL]** Build `DomainEventsDispatcherInterceptor` to dispatch queued domain events immediately after `SaveChangesAsync`.
36. **[REL]** Implement `UnitOfWork` with explicit `IDbContextTransaction` support for atomic multi-step operations.
37. **[OPS, REL]** Implement an idempotent database seeder to bootstrap system roles and root admin on startup.
38. **[OPS]** Isolate auto-migration logic so production migrations are applied through CI/CD pipelines instead of app startup.
39. **[SEC]** Sanitize audit logs to strictly exclude passwords, tokens, and credit card numbers from `OldValues`/`NewValues`.
40. **[PERF]** Enforce non-blocking `SaveChangesAsync(cancellationToken)` on all database write paths.

---

### Phase 5: Identity, JWT Security & Refresh Token Rotation (Steps 41–50)
41. **[SEC]** Design `User`, `Role`, `UserRole`, and `RefreshToken` entities with full relational constraints.
42. **[SEC]** Implement secure password hashing using `PasswordHasher<User>` (PBKDF2 with HMAC-SHA512) or Argon2id with strong complexity policies.
43. **[SEC]** Build `JwtTokenGenerator` producing short-lived **Access Tokens** (10–15 mins) with minimal essential claims.
44. **[SEC]** Build cryptographically secure **Refresh Token** generator using `RandomNumberGenerator.GetBytes(64)`.
45. **[SEC]** Store only cryptographic **Hashes (SHA-256)** of Refresh Tokens in the database rather than plain-text tokens.
46. **[SEC]** Build `Register` endpoint enforcing unique email verification and returning safe user representation.
47. **[SEC]** Build `Login` endpoint with **Account Lockout** policy to neutralize brute-force attacks.
48. **[SEC, REL]** Implement **Refresh Token Rotation**: invalidate old token and issue a fresh pair linked via `ReplacedByToken`.
49. **[SEC]** Implement **Token Reuse Detection**: if an already-revoked Refresh Token is used, immediately revoke its entire token family.
50. **[SEC]** Build `Revoke / Logout` endpoint to invalidate active Refresh Tokens and clear sessions.

---

### Phase 6: Authorization, Zero Trust & Anti-IDOR (Steps 51–60)
51. **[SEC]** Configure Authentication Middleware with strict `TokenValidationParameters` (`ClockSkew = TimeSpan.Zero`, validate issuer, audience, and key).
52. **[SEC]** Enforce **Zero Trust** via global `FallbackPolicy` requiring authenticated requests by default unless `[AllowAnonymous]`.
53. **[SEC]** Implement hybrid authorization combining Roles (**RBAC**) with granular permission claims.
54. **[SEC]** Build `PermissionAuthorizationPolicyProvider` and `PermissionAuthorizationHandler` for dynamic permission policies.
55. **[SEC]** Build **Resource Ownership Requirement & Handler** (`IAuthorizationHandler`) to eliminate **IDOR** vulnerabilities.
56. **[SEC]** Apply query-level ownership filtering (`OwnerId == currentUserId`) as defense-in-depth across all queries.
57. **[SEC]** Return `404 Not Found` upon unauthorized access to resources to prevent entity enumeration.
58. **[SEC]** Build administrative role and permission management endpoints with change tracking in `AuditLogs`.
59. **[SEC]** Configure strict **CORS Policy** restricting origins, methods, and headers (disallow wildcard `*` in production).
60. **[SEC]** Add Middleware injecting critical **Security Headers** (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security`).

---

### Phase 7: API Contracts, Validation & Query Performance (Steps 61–70)
61. **[OPS, REL]** Define all request/response DTOs as **C# `record` types** for immutability.
62. **[SEC, REL]** Configure **FluentValidation** pipeline behavior to validate inputs at the API perimeter before business execution.
63. **[SEC]** Enforce string sanitization and length bounds in validators to mitigate buffer and payload abuse.
64. **[PERF, COST]** Enforce `.AsNoTracking()` on all read-only queries to eliminate ChangeTracker memory overhead.
65. **[PERF, COST]** Enforce **Projection (`.Select()`)** to map entities to DTOs in SQL, preventing wasteful `SELECT *`.
66. **[PERF, COST]** Implement generic **Pagination** model (`PagedList<T>`) enforcing `MaxPageSize = 50` to prevent memory blowouts.
67. **[PERF, SEC]** Implement secure Dynamic Filtering & Sorting using an explicit column whitelist.
68. **[PERF]** Eliminate N+1 query patterns using `.AsSplitQuery()` for multi-collection entity loading.
69. **[PERF]** Replace batch loops with EF Core 8+ `ExecuteUpdateAsync` and `ExecuteDeleteAsync` for single-query bulk mutations.
70. **[PERF, COST]** Enable **Response Compression** (Brotli & Gzip) to shrink wire payload sizes and reduce egress bandwidth cost.

---

### Phase 8: Resilience, Caching & Background Processing (Steps 71–80)
71. **[PERF, COST]** Configure unified caching layer using `HybridCache` or Redis `IDistributedCache` to offload database load.
72. **[REL, PERF]** Implement **Cache-Aside Pattern** with targeted cache eviction on write/update/delete operations.
73. **[REL]** Prevent **Cache Stampede** using distributed locks or `HybridCache` built-in stampede protection.
74. **[SEC, COST, REL]** Implement ASP.NET Core **Rate Limiting Middleware** (Fixed Window for anonymous, Token Bucket for users).
75. **[REL]** Implement **Idempotency Keys** (`Idempotency-Key` HTTP header) on mutation endpoints to prevent duplicate writes on client retries.
76. **[REL]** Implement **Transactional Outbox Pattern** saving domain events in the same database transaction as business data.
77. **[REL, OPS]** Build **Background Worker (`BackgroundService`)** publishing Outbox messages with Exponential Backoff retry.
78. **[COST, OPS]** Build **Scheduled Cleanup Worker** purging expired Refresh Tokens and archived audit logs.
79. **[REL]** Configure **Resilience Pipelines** (`Microsoft.Extensions.Http.Resilience`) with retries, timeouts, and circuit breakers for external HTTP calls.
80. **[OPS]** Configure **Request Timeouts Middleware** to terminate requests exceeding SLAs and prevent thread pool starvation.

---

### Phase 9: Telemetry, Observability & Automated Testing (Steps 81–90)
81. **[OPS]** Configure **Serilog Structured Logging** with compact JSON formatting for centralized log ingestion.
82. **[OPS]** Build **Correlation ID Middleware** assigning `X-Correlation-ID` to trace requests end-to-end across services.
83. **[SEC, OPS]** Configure Serilog destructuring masks to sanitize passwords, credit cards, and authorization headers.
84. **[OPS, PERF]** Integrate **OpenTelemetry** exporting metrics (duration, memory, request count) and distributed traces.
85. **[REL, OPS]** Configure **Health Checks** separated into `/health/live` (liveness probe) and `/health/ready` (SQL Server & Redis readiness probe).
86. **[REL, OPS]** Write **Unit Tests** (xUnit + FluentAssertions + Moq/NSubstitute) for domain rules, validators, and policies.
87. **[REL, OPS]** Scaffold **Integration Tests** using `WebApplicationFactory<Program>`.
88. **[REL, OPS]** Integrate **Testcontainers** to spin up ephemeral SQL Server and Redis Docker containers during test runs.
89. **[SEC, REL]** Write automated security integration tests asserting 401 on unauthenticated access, IDOR blocking, and token reuse family revocation.
90. **[OPS]** Add **Architecture Tests** (`NetArchTest.Rules`) enforcing Clean Architecture dependency directions and naming rules.

---

### Phase 10: Dockerization, CI/CD Pipeline & Production Hardening (Steps 91–100)
91. **[COST, SEC]** Write **Multi-stage `Dockerfile`** separating build SDK from runtime ASP.NET image (reducing image size by >70%).
92. **[SEC]** Harden Docker image to run under **Non-Root User** (or Microsoft Chiseled Ubuntu images) for zero-root attack surface.
93. **[COST, OPS]** Configure `.dockerignore` excluding `bin/`, `obj/`, `.git/`, and test artifacts.
94. **[OPS]** Write `docker-compose.yml` orchestrating the complete stack (API, SQL Server, Redis, Seq).
95. **[REL]** Configure `depends_on` with healthcheck conditions in docker-compose to guarantee dependency readiness.
96. **[REL]** Verify **Graceful Shutdown** behavior: handle `SIGTERM` cleanly, allowing in-flight requests to complete.
97. **[SEC]** Secure secrets management: User Secrets locally, Key Vault / Environment Variables in production with zero secrets committed to Git.
98. **[OPS, REL]** Build **GitHub Actions CI Pipeline** executing build, unit & integration tests, and vulnerability audit (`dotnet list package --vulnerable`).
99. **[OPS]** Add container build and push step in CI to publish versioned Docker images to Container Registry (GHCR/ACR).
100. **[OPS, REL]** Author comprehensive architectural `README.md` detailing system topology, WAF design decisions, ERD, and Docker setup.

---

### Phase 11: Comprehensive Technical Documentation & Developer Portal (Steps 11.1–11.10)
*Executed after Phase 10 as the professional project capstone for engineering leads and technical interviews.*

11.1. **[OPS]** Author **Architecture Decision Records (ADRs 001–005)** documenting the 5 most critical engineering trade-offs (Refresh Token Rotation, HybridCache, Outbox Pattern, Sequential GUIDs, Clean Architecture).  
11.2. **[OPS]** Enable **XML Documentation Comments** across the `API` project and configure automated inclusion into OpenAPI/Swagger schemas.  
11.3. **[OPS]** Enrich Swagger/Scalar specifications with realistic request/response payload examples (`[ProducesResponseType]`) and an exhaustive error status catalog.  
11.4. **[OPS]** Create ready-to-execute **Postman Collections and `.http` test files** organized by domain module with pre-configured environment variables.  
11.5. **[OPS, SEC]** Author the **Security Architecture Guide** (`/docs/security.md`) detailing the defense-in-depth model (Zero Trust, Token hashing, Anti-IDOR, Rate Limiting).  
11.6. **[OPS, REL]** Author the **Operational Runbook** (`/docs/runbook.md`) documenting structured log querying, `X-Correlation-ID` tracing, and emergency procedures for worker/health check failures.  
11.7. **[OPS]** Author the **Local Development & Contribution Guide** (`/docs/contributing.md`) detailing User Secrets setup, EF Core migrations, and Testcontainers prerequisites.  
11.8. **[OPS]** Review and consolidate all architectural visual diagrams (`C4 Models`, `ERD`, `Auth Sequence Diagrams`) in **Mermaid.js** within the `/docs` tree.  
11.9. **[OPS]** Construct the enterprise-grade flagship **`README.md`** showcasing system topology, Azure WAF alignment table, interactive badges, documentation links, and one-command Docker startup.  
11.10. **[OPS, SEC]** Conduct a final **Repository Security & Quality Audit**: verify clean Git commit history, confirm zero committed secrets, validate all markdown documentation links, and assert CI green badge.

> **Phase 11 Transition Prompt:**
> ```markdown
> --- CHECKPOINT: PHASE 10 COMPLETED ---
> Ignore all intermediate drafts and troubleshooting above this line.
> Current State: Phases 0 through 10 are fully implemented, tested with Testcontainers, containerized with hardened Multi-stage Docker + docker-compose, and automated via GitHub Actions CI.
> Rules Reminder: One documentation artifact/micro-step per response + explain WHY it matters for production maintainability and technical interviews.
> 
> Next Task: Branch Phase 11 (Steps 11.1–11.10): Comprehensive Technical Documentation & Developer Portal into concrete micro-steps and wait for my approval.
> ```

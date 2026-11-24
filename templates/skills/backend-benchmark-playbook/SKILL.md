---
name: backend-benchmark-playbook
description: >-
  Enterprise backend verification, performance benchmarking, and real-metric extraction playbook across 7 core
  pillars and 35 measurement points (Load/Latency, SQL/EF Core, Caching/Resilience, Concurrency, Security, Testing,
  DevOps) to generate provable, evidence-backed engineering metrics for CVs and technical interviews.
---

# Enterprise Backend Verification & Benchmarking Playbook (35-Point Measurement Framework)

This skill guides backend engineers and AI agents in planning, executing, and documenting provable, data-backed performance and security benchmarks for **Enterprise Web API & Transactional Backend Systems** (ASP.NET Core / SQL Server / Redis / Docker).

---

## 🏆 The Golden Rule of Engineering Measurement

> **Strict Mandate:** Never insert estimated, theoretical, or fabricated metrics into a resume or technical portfolio. Every single number presented in a CV must originate from a **reproducible, hands-on benchmark** with concrete visual proof (k6 execution reports, SQL Server Actual Execution Plans, Seq structured log traces, or CI run summaries) saved inside the `/docs/benchmarks/` repository directory.

---

## 🗺️ The 7 Core Measurement Pillars (35 Benchmark Points)

| # | Measurement Pillar | Primary Tools & Frameworks | Target CV Metrics Extracted |
| :-: | :--- | :--- | :--- |
| **01** | **API Load & Latency** | k6, OpenTelemetry, Seq | p50 / p95 / p99 Latency (ms), Throughput (RPS), Payload reduction (%) |
| **02** | **SQL Server & EF Core Efficiency** | STATISTICS IO/TIME, SSMS, BenchmarkDotNet | Logical Reads reduction, CPU time, Index Fragmentation (%), Memory allocations |
| **03** | **Caching & Resilience** | HybridCache, Redis CLI, Polly, WireMock.Net | Cache Hit vs Miss latency, 0% stale reads, Stampede collapse ratio, 100% Outbox delivery |
| **04** | **Concurrency & Transactional Integrity** | xUnit, Testcontainers, Task.WhenAll | Double-spend prevention (1 success / N-1 conflicts), 0 duplicate ledger records |
| **05** | **Zero-Trust Security & Anti-IDOR** | Testcontainers, dotnet list, Serilog masks | 100% default-deny coverage, token family reuse revocation, 0 IDOR leaks, 0 log secrets |
| **06** | **Code Quality & Architecture** | xUnit, Coverlet, NetArchTest, Roslyn | Total test counts, Line/Branch Coverage (%), Architecture guard rules, 0 compiler warnings |
| **07** | **Containerization & CI/CD DevOps** | Docker, Chiseled Ubuntu, GitHub Actions | Image size reduction (MB / %), Cold start readiness (sec), CI runtime, 0 vulnerabilities |

---

## 🔬 Detailed 35-Point Benchmark Specification

---

### Pillar 1: API Load & Response Latency (Points 01–05)

#### 01. Read Endpoint Latency (p50 / p95 / p99)
- **Objective:** Verify non-functional requirement (NFR) for critical read endpoints (e.g. `GET /api/v1/accounts/me`, `GET /api/v1/ledgers/{id}`).
- **Execution & Tooling:** Run k6 load script scaling from 10 to 100 concurrent Virtual Users (VUs) over 2 minutes while streaming OpenTelemetry metrics.
- **Target CV Metric:** Verified p95 and p99 latency (`< [X]ms`) under `[Y]` RPS load with zero 5xx server errors.

#### 02. Write & Transactional Mutation Latency
- **Objective:** Measure real-world throughput and latency of write paths encapsulated within database transactions (e.g. `POST /api/v1/transfers`, `POST /api/v1/orders/fund`).
- **Execution & Tooling:** k6 load script issuing concurrent mutation requests with distinct `Idempotency-Key` headers; inspect waterfall traces in Seq/OpenTelemetry.
- **Target CV Metric:** Transaction write latency (p95 `< [X]ms`) under sustained multi-user write pressure.

#### 03. Response Compression Bandwidth Savings (Brotli vs Gzip)
- **Objective:** Demonstrate egress bandwidth reduction on paginated API responses (e.g. 50 ledger entries per page).
- **Execution & Tooling:** Query endpoint with and without `Accept-Encoding: br, gzip`; compare `Content-Length` headers.
- **Target CV Metric:** Payload size reduction from `[A]KB` to `[B]KB` (`[X]%` bandwidth saved).

#### 04. Rate Limiting Protection (Fixed Window & Token Bucket)
- **Objective:** Validate graceful degradation and DDoS rejection via `429 Too Many Requests` without service failure.
- **Execution & Tooling:** Issue rapid burst requests exceeding rate limit tiers (anonymous vs authenticated) via k6 or xUnit load tasks.
- **Target CV Metric:** 100% rejection of rogue burst traffic (`429` status code) with zero infrastructure degradation or memory leaks.

#### 05. Request Timeouts & CancellationToken Immediate Abort
- **Objective:** Prove server threads and database connections terminate immediately when client aborts or SLA timeout triggers.
- **Execution & Tooling:** Simulate artificial server delay (`Task.Delay` or SQL `WAITFOR DELAY`), trigger client abort, and verify `499 Client Closed Request` or `504 Gateway Timeout` in Seq logs.
- **Target CV Metric:** Instant query termination with zero lingering zombie SQL threads or thread pool starvation.

---

### Pillar 2: SQL Server & EF Core Efficiency (Points 06–11)

#### 06. Covering & Filtered Index Impact on Read Queries
- **Objective:** Eliminate expensive Table Scans and Clustered Index Scans in favor of optimal Index Seeks on high-volume tables (100k+ rows).
- **Execution & Tooling:** Seed 100,000+ realistic records; execute query in SSMS with `SET STATISTICS IO, TIME ON`; compare Actual Execution Plan before and after index tuning.
- **Target CV Metric:** Reduced Logical Reads by `[X]%` (e.g. from 2,450 to 4 reads) and cut execution time from `[A]ms` to `[B]ms`.

#### 07. Sequential UUID v7 vs Standard UUID v4 Index Fragmentation
- **Objective:** Prove elimination of B-Tree page splits and clustered index fragmentation during high-throughput inserts.
- **Execution & Tooling:** Bulk insert 50,000–100,000 rows using `Guid.NewGuid()` vs `Guid.CreateVersion7()`; inspect `sys.dm_db_index_physical_stats`.
- **Target CV Metric:** Cut average index fragmentation (`avg_fragmentation_in_percent`) from `>90%` down to `<1%`.

#### 08. Denormalization vs Dynamic Aggregations
- **Objective:** Measure CPU and I/O savings of reading a denormalized balance vs running dynamic `SUM(Amount)` across millions of rows.
- **Execution & Tooling:** Execute both query patterns side-by-side using `STATISTICS IO, TIME ON` on equivalent datasets.
- **Target CV Metric:** Converted dynamic table scan into an `O(1)` index seek, slashing logical reads by `[X]%`.

#### 09. `.AsNoTracking()` + `.Select()` Projection Memory Savings
- **Objective:** Prove memory allocation reduction and wire data reduction by bypassing EF Core Change Tracker and projecting only required columns.
- **Execution & Tooling:** Run `BenchmarkDotNet` suite comparing full tracked entity loading vs `.AsNoTracking().Select(dto)`.
- **Target CV Metric:** `[X]%` memory allocation reduction (e.g. from 12MB to 380KB) and query execution speedup.

#### 10. Bulk Mutations: `ExecuteUpdateAsync` / `ExecuteDeleteAsync` vs Loops
- **Objective:** Measure latency and round-trip elimination when batch-purging expired records (e.g. 10,000 expired tokens).
- **Execution & Tooling:** Execute 10,000 record cleanup via traditional `foreach + SaveChangesAsync` vs single SQL command via `ExecuteDeleteAsync()` inside Testcontainers.
- **Target CV Metric:** Reduced database round-trips from `10,000` to `1` and decreased cleanup duration from `[A]s` to `[B]ms`.

#### 11. N+1 Query Detection & Cartesian Explosion Elimination
- **Objective:** Assert zero N+1 query leaks and verify `.AsSplitQuery()` efficiency on multi-collection eager loads.
- **Execution & Tooling:** Enable EF Core query logging / MiniProfiler; assert exact query count per endpoint call.
- **Target CV Metric:** 100% elimination of N+1 query patterns; zero duplicate Cartesian rows across complex joins.

---

### Pillar 3: Caching, Outbox & Resilience Under Load (Points 12–16)

#### 12. Cache Hit vs Cache Miss Latency Difference
- **Objective:** Benchmark real-world performance gain of `HybridCache` / Redis layer over direct database reads.
- **Execution & Tooling:** Measure Cold Read (Cache Miss) vs Warm Reads (Cache Hit) over 100 iterations via OpenTelemetry traces and Redis CLI `INFO stats`.
- **Target CV Metric:** Latency dropped from `[A]ms` (DB read) to `< [B]ms` (Cache hit) with a `[X]%` cache-hit ratio.

#### 13. Instant Cache Invalidation & Zero Stale Reads
- **Objective:** Guarantee data consistency by proving cached records are evicted immediately upon mutations.
- **Execution & Tooling:** Integration test that reads cached data, executes a mutation (e.g. deposit/transfer), and immediately reads back, asserting 100% ledger parity.
- **Target CV Metric:** 0% stale reads across all mutation paths.

#### 14. Cache Stampede Simulation
- **Objective:** Prove that `HybridCache` / distributed locks collapse concurrent requests for an expired key into exactly 1 database query.
- **Execution & Tooling:** Fire 50–100 concurrent requests via `Task.WhenAll` against a non-existent or expired cache key; record SQL query count.
- **Target CV Metric:** 100 concurrent requests collapsed to exactly 1 database query, shielding the database from load spikes.

#### 15. Transactional Outbox & Polly Resilience
- **Objective:** Prove guaranteed at-least-once event/webhook delivery even during transient external service outages.
- **Execution & Tooling:** Use `WireMock.Net` returning `503 Service Unavailable` for initial attempts, followed by `200 OK`; verify Outbox background worker retries with exponential backoff and circuit breaker.
- **Target CV Metric:** 100% guaranteed delivery of domain events without message loss during downstream downtime.

#### 16. Scheduled Cleanup Worker Throughput
- **Objective:** Measure background worker efficiency in purging expired sessions, idempotency records, and soft-deleted data.
- **Execution & Tooling:** Seed 50,000 expired rows; trigger cleanup worker; monitor rows deleted per second and reclaimed storage.
- **Target CV Metric:** Throughput of `[X]` rows purged/second, preventing unbounded growth of operational tables.

---

### Pillar 4: Concurrency & Transactional Integrity (Points 17–21)

#### 17. Double-Spend / Race Condition Burst Simulation
- **Objective:** Prove that rapid concurrent attempts to spend the same account balance fail safely without negative balances.
- **Execution & Tooling:** Spin up Testcontainers database; launch 25–50 concurrent withdrawal requests within the same millisecond via `Task.WhenAll`.
- **Target CV Metric:** Exactly 1 request succeeds; remaining `N-1` requests fail with `409 Conflict`; final balance matches invariants with 0 double-spends.

#### 18. Concurrent Idempotency-Key Burst
- **Objective:** Simulate network retry bursts by submitting identical payloads with the same `Idempotency-Key` simultaneously.
- **Execution & Tooling:** Dispatch 10 parallel requests with matching key; verify ledger entries in database.
- **Target CV Metric:** Exactly 1 business execution and 1 ledger entry recorded; remaining requests return cached response without re-processing.

#### 19. RequestHash Tampering Detection
- **Objective:** Verify security defense against reusing an `Idempotency-Key` with altered payload parameters (e.g. changing amount or recipient).
- **Execution & Tooling:** Integration test submitting key with Payload A, then re-submitting same key with modified Payload B.
- **Target CV Metric:** Immediate rejection with `409 Conflict` / `422 Unprocessable Entity`; 0% unauthorized mutation execution.

#### 20. Database-Level Check Constraints Bypassing C#
- **Objective:** Prove database schema invariants reject invalid states even if backend application code or ORM is completely bypassed.
- **Execution & Tooling:** Execute direct raw SQL `INSERT`/`UPDATE` violating constraints (e.g. negative balance, sender equals receiver) within Testcontainers.
- **Target CV Metric:** 100% rejection at database level via `SqlException` / Check Constraint violation.

#### 21. State Machine Legal vs Illegal Transitions Matrix
- **Objective:** Assert strict deterministic state transitions (e.g. `Created -> Processing -> Completed`) rejecting illegal transitions.
- **Execution & Tooling:** Parameterized xUnit `[Theory]` tests covering all permutations of legal and illegal state transitions.
- **Target CV Metric:** 100% test coverage across all domain state machine transitions.

---

### Pillar 5: Zero-Trust Security, Auth & Anti-IDOR (Points 22–26)

#### 22. Global FallbackPolicy Default-Deny Verification
- **Objective:** Automatically verify that zero endpoints are accidentally exposed to anonymous users without explicit `[AllowAnonymous]`.
- **Execution & Tooling:** Integration test discovering all registered endpoints via reflection/OpenAPI and issuing unauthenticated requests.
- **Target CV Metric:** 100% compliance with Zero-Trust default-deny (all endpoints return `401 Unauthorized` unless explicitly whitelisted).

#### 23. Refresh Token Theft & Family Reuse Detection
- **Objective:** Prove that replaying an already-revoked refresh token triggers automated immediate revocation of the entire token family.
- **Execution & Tooling:** Issue Login -> Rotate Token (`T1 -> T2`) -> Replay `T1`. Verify `T1` is rejected and active token `T2` is immediately revoked.
- **Target CV Metric:** Instant family-wide session revocation; account locked out upon breach attempt.

#### 24. Anti-IDOR Resource Ownership & Enumeration Defense
- **Objective:** Verify that User B cannot read, update, or enumerate resources owned by User A.
- **Execution & Tooling:** Integration tests hitting resource endpoints with foreign user credentials; assert `403 Forbidden` or `404 Not Found`.
- **Target CV Metric:** 100% blocking of Insecure Direct Object References (IDOR); zero entity enumeration leaks.

#### 25. HMAC-SHA256 Webhook Verification & Log Secret Sanitization
- **Objective:** Ensure incoming webhooks verify cryptographic signatures, and audit logs / Seq traces contain zero plaintext credentials.
- **Execution & Tooling:** Send webhooks with tampered payloads (1-byte modification) asserting rejection; run regex scan over `AuditLogs` and Serilog output for passwords/tokens.
- **Target CV Metric:** 0 plaintext secrets leaked in application logs; 100% cryptographic signature verification.

#### 26. NuGet Dependency Vulnerability Audit & Security Headers
- **Objective:** Guarantee clean software supply chain and complete defense-in-depth HTTP security headers.
- **Execution & Tooling:** Execute `dotnet list package --vulnerable --include-transitive`; verify presence of `HSTS`, `X-Content-Type-Options`, `X-Frame-Options`.
- **Target CV Metric:** 0 known package vulnerabilities; 100% grade on security header evaluation.

---

### Pillar 6: Code Quality, Architecture & Automated Testing (Points 27–30)

#### 27. Automated Test Suite Metrics & Execution Time
- **Objective:** Quantify test suite breadth and execution speed across Unit, Integration, and Architecture test categories.
- **Execution & Tooling:** Run `dotnet test --verbosity normal` recording test counts and execution duration.
- **Target CV Metric:** `[X]` total automated tests (`[U]` Unit, `[I]` Integration with Testcontainers, `[A]` Architecture) with 100% pass rate.

#### 28. Domain & Application Code Coverage
- **Objective:** Verify high-confidence test coverage on core business logic layers.
- **Execution & Tooling:** Execute `dotnet test --collect:"XPlat Code Coverage"` and generate HTML report via `ReportGenerator`.
- **Target CV Metric:** `>90%` Line and Branch Coverage on `Domain` and `Application` layers.

#### 29. Clean Architecture Boundary Enforcement via NetArchTest
- **Objective:** Prevent architectural decay, cyclic dependencies, and naming violations automatically in CI.
- **Execution & Tooling:** Execute dedicated `NetArchTest.Rules` test assembly verifying inward dependency flows.
- **Target CV Metric:** `[X]` architecture rules automated in CI guaranteeing zero architectural drift.

#### 30. Zero Compiler Warnings / Strict Quality Build
- **Objective:** Enforce zero warnings and nullable reference safety across the entire solution.
- **Execution & Tooling:** Run `dotnet build -c Release` with `<TreatWarningsAsErrors>true</TreatWarningsAsErrors>` and `<Nullable>enable</Nullable>`.
- **Target CV Metric:** 0 Warnings, 0 Errors in production Release configuration.

---

### Pillar 7: Containerization, DevOps & CI/CD Pipeline (Points 31–35)

#### 31. Multi-Stage Docker Image Optimization (Chiseled Non-Root)
- **Objective:** Measure container image size reduction and attack surface minimization.
- **Execution & Tooling:** Compare single-stage SDK image against multi-stage Chiseled non-root runtime image via `docker images`; verify `whoami`.
- **Target CV Metric:** Reduced container image size by `[X]%` (e.g. from 850MB to 110MB) running as non-root user.

#### 32. Full-Stack Cold Start & Health Probe Readiness
- **Objective:** Measure cold boot duration of the entire orchestration stack until readiness probe succeeds.
- **Execution & Tooling:** Execute `docker-compose up -d` on clean environment; measure time until `/health/ready` returns `200 OK`.
- **Target CV Metric:** Full stack (API, SQL Server, Redis, Seq) initialized and ready in `< [X]` seconds.

#### 33. Graceful Shutdown & In-Flight Request Preservation
- **Objective:** Prove zero request drops or lost database transactions during container redeployments or `SIGTERM`.
- **Execution & Tooling:** Dispatch long-running mutation, issue `docker stop` during execution, and monitor Seq logs to verify completion.
- **Target CV Metric:** 0 dropped in-flight requests during graceful shutdown.

#### 34. GitHub Actions CI Pipeline Runtime & Automated Quality Gates
- **Objective:** Track speed and rigor of continuous integration pipeline.
- **Execution & Tooling:** Inspect GitHub Actions run times across Build, Testcontainers Integration Tests, Vulnerability Scan, and Container Publishing.
- **Target CV Metric:** Full CI suite executes in `< [X]` minutes with 100% automated gate enforcement.

#### 35. Final Engineering Assets & Architecture Inventory
- **Objective:** Quantify project engineering footprint for technical portfolio review.
- **Execution & Tooling:** Inventory documented endpoints in Scalar/Swagger, completed ADRs, Mermaid diagrams, and clean Git commits.
- **Target CV Metric:** `[X]` Endpoints, `[Y]` Architecture Decision Records, `[Z]` Diagrams, and clean commit history.

---

## 📊 Blank Metrics Capture Ledger

| Metric / Benchmark Item | Tool / Source | Baseline (Raw / Before) | Optimized (Final Result) | Improvement (%) |
| :--- | :--- | :---: | :---: | :---: |
| **Read API Latency (p95)** | k6 + OpenTelemetry | `___ ms` | `___ ms` | `___ %` |
| **Write API Latency (p95)** | k6 + OpenTelemetry | `___ ms` | `___ ms` | `___ %` |
| **Response Payload Size (Compressed)** | Content-Length (Brotli) | `___ KB` | `___ KB` | `___ %` |
| **SQL Logical Reads (High-Volume Query)** | SET STATISTICS IO | `___ reads` | `___ reads` | `___ %` |
| **Clustered Index Fragmentation** | dm_db_index_physical_stats | `___ %` (v4) | `___ %` (v7) | `___ %` |
| **EF Core Memory Allocation** | BenchmarkDotNet | `___ MB` | `___ KB` | `___ %` |
| **Bulk Deletion Round-Trips** | Testcontainers | `___ queries` | `1 query` | `___ %` |
| **Cache Miss vs Cache Hit Latency** | HybridCache / Redis | `___ ms` | `___ ms` | `___ %` |
| **Cache Stampede Collapse Ratio** | Task.WhenAll (100 reqs) | `___ queries` | `1 query` | `99%` |
| **Double-Spend Protection** | Testcontainers (N reqs) | `Failure` | `1 Success / N-1 409` | `100% Safe` |
| **Total Automated Tests Count** | dotnet test | `0` | `___ tests` | `100% Pass` |
| **Domain & Application Code Coverage** | Coverlet / ReportGenerator | `___ %` | `___ %` | `___ %` |
| **Docker Image Size** | docker images | `___ MB` | `___ MB` | `___ %` |
| **Full Stack Cold Start** | docker-compose up | `___ s` | `___ s` | `___ %` |
| **GitHub Actions CI Runtime** | GitHub Actions | `___ min` | `___ min` | `___ %` |

---

## 📝 Google XYZ Resume Bullet Templates

After filling the metrics ledger above, substitute the bracketed placeholders `[___]` with verified values directly into CV bullets:

### 1. Concurrency & Transactional Integrity Bullet
> *Eliminated double-spending under **[N]** concurrent transaction bursts (**1** success, **[N-1]** HTTP 409 conflicts, **0** negative balances) via RowVersion Optimistic Concurrency, Idempotency-Key + RequestHash verification, and SQL Server Check Constraints.*

### 2. SQL Server & EF Core Optimization Bullet
> *Reduced critical ledger query logical reads by **[X]%** (from **[A]** to **[B]**) and cut clustered index fragmentation from **[C]%** to **[D]%** using covering indexes, `Guid.CreateVersion7()` sequential keys, `.AsNoTracking()` SQL projections, and Brotli compression (**[E]%** smaller wire payload).*

### 3. Caching, Latency & Resilience Bullet
> *Achieved **[X]ms** p95 read latency at **[Y]** RPS (cutting cache-hit latency by **[Z]%**) using HybridCache/Redis with stampede protection (**[N]** concurrent requests collapsed to **1** DB query), ASP.NET Core Rate Limiting, Transactional Outbox workers, and Polly HTTP resilience pipelines.*

### 4. Testing, Observability & Docker DevOps Bullet
> *Guaranteed software reliability via **[X]** automated tests (**[U]** unit, **[I]** Testcontainers SQL/Redis integration, **[A]** NetArchTest architecture rules) at **[C]%** Domain coverage; shrank Docker image size by **[D]%** (**[Before]MB** to **[After]MB**) using hardened non-root Chiseled builds with **0** vulnerable packages in GitHub Actions CI.*

---

## 📁 Technical Interview Evidence Artifacts Checklist (`/docs/benchmarks/`)

Store concrete visual proof inside `/docs/benchmarks/` to reference with confidence during technical interviews:

- [ ] `k6-read-latency.png`: Summary screenshot of k6 load test displaying RPS, p95/p99 latency, and 0% error rate.
- [ ] `sql-execution-plan-comparison.png`: Side-by-side SSMS Actual Execution Plan and `STATISTICS IO` before and after indexing.
- [ ] `index-fragmentation-v7.png`: Query output from `dm_db_index_physical_stats` showing sequential UUID v7 fragmentation `< 1%`.
- [ ] `double-spend-test-output.png`: Test output displaying 1 successful 200 OK and N-1 409 Conflicts under concurrency storm.
- [ ] `seq-trace-waterfall.png`: Seq structured log trace demonstrating `X-Correlation-ID` tracking across services.
- [ ] `docker-image-size.png`: Terminal output of `docker images` showing optimized non-root chiseled container footprint.
- [ ] `ci-green-pipeline.png`: GitHub Actions summary demonstrating clean build, tests, and security scans.

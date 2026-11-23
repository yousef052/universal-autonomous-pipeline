---
name: dotnet-backend-architect
description: >-
  Architect, scaffold, and implement production-grade ASP.NET Core Web API backends using the 130-step
  engineering master roadmap aligned with Microsoft Azure Well-Architected Framework (WAF) pillars: Reliability,
  Security, Cost Optimization, Operational Excellence, and Performance Efficiency.
---

# ASP.NET Core Enterprise Backend Architect (Azure WAF 130-Step Master Roadmap)

This skill guides agents and engineers in architecting, constructing, auditing, and defending enterprise-grade **ASP.NET Core Web API Flagship Projects**. Every design decision, database index, security middleware, and pipeline behavior is strictly justified through the five pillars of the **Microsoft Azure Well-Architected Framework (WAF)**.

The roadmap is engineered across **13 distinct phases (130 granular steps)** covering the complete software engineering lifecycle: from initial architectural C4 modeling and normalization, through core implementation and testing, to production container hardening and comprehensive developer portal documentation.

---

## 🏛️ The 5 Pillars of Azure Well-Architected Framework (WAF)

- **[REL] Reliability:** Prevent data corruption, manage concurrent updates (Optimistic Concurrency), automatic retries with exponential backoff, transaction outbox, and deep readiness/liveness health checks.
- **[SEC] Security:** Zero Trust architecture, strict token lifecycle & rotation, automatic reuse detection, anti-IDOR resource ownership handlers, and defense-in-depth secret isolation.
- **[COST] Cost Optimization:** Slash CPU, memory, and database usage through selective projections (`.Select()`), connection pooling, scheduled cleanup workers, and multi-stage container optimization.
- **[OPS] Operational Excellence:** Centralized dependency governance, RFC 9457 `ProblemDetails`, Serilog structured JSON logging, OpenTelemetry distributed tracing, and automated architectural tests (`NetArchTest`).
- **[PERF] Performance Efficiency:** High-speed indexing (Composite/Filtered), `AsNoTracking()`, HybridCache/Redis cache-aside, non-blocking asynchronous calls with `CancellationToken`, and response compression.

---

## 🗺️ The Complete 130-Step Master Roadmap

Refer to the complete, unabridged [130-Step Engineering Master Roadmap](../../docs/dotnet-backend-roadmap-130.md) for full phase-by-phase implementation guidelines and prompts.

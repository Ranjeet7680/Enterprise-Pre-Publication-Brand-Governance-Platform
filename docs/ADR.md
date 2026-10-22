# Inkloom AI — Architecture Decision Records (ADRs)

Version 1.2 • 22 October 2026

## ADR 001: Modular Monolith Plus Worker Architecture
* **Status:** Accepted
* **Context:** The platform requires low-latency policy evaluation, multi-stage review graphs, relational integrity, and background execution for document ingestion without distributed systems overhead.
* **Decision:** Build Inkloom AI as a modular monolith in FastAPI/Python backed by an asynchronous processing pipeline, rather than a fragmented fleet of microservices.
* **Consequences:** Clear module boundaries (`policy_engine`, `model_gateway`, `contracts`, `api`), simplified testing, reduced network serialization latency, and direct transactional consistency.

---

## ADR 002: Relational Canonical Workflow Store
* **Status:** Accepted
* **Context:** Workflow state transitions (Draft -> In Review -> Changes Requested -> Approved) and audit trails require strict transactional consistency, foreign key constraints, and rollback protection.
* **Decision:** Use a relational database (PostgreSQL with SQLite local dev mode) as the canonical source of truth for workspaces, immutable version snapshots, approvals, and audit events.
* **Consequences:** Eliminates eventual consistency drift in approval chains; search indexes and derived caches can be completely rebuilt from canonical tables.

---

## ADR 003: Hybrid Deterministic Rules & AI Engine
* **Status:** Accepted
* **Context:** Pure LLMs hallucinate and can be persuaded to overlook strict constraints, while pure regexes fail on semantic tone, paraphrase, and multilingual nuance.
* **Decision:** Execute a staged dependency graph: deterministic code evaluates exact constraints (glossaries, dates, numeric ranges, prompt injections, WCAG contrast) first, followed by bounded RAG and specialized AI models for tone and contextual claim evaluation.
* **Consequences:** Critical policy blockers (expired campaigns, prohibited terminology, logo aspect ratio distortion) are deterministic and reproducible. AI handles ambiguity and provides explainable rewrite suggestions.

---

## ADR 004: Retrieval Restricted Exclusively to Approved, Versioned Sources
* **Status:** Accepted
* **Context:** RAG pipelines that ingest unvetted files risk poisoning the knowledge base with draft or contradictory claims.
* **Decision:** Only source documents explicitly approved by authorized brand owners with valid effective dates enter the production retrieval index. Draft, rejected, or superseded sources are strictly excluded.
* **Consequences:** Prevents hallucinated substantiations. When two active sources disagree, the engine flags a `Source Conflict` task rather than guessing.

---

## ADR 005: Server-Enforced Human Approval for High-Risk Decisions
* **Status:** Accepted
* **Context:** Automated AI systems must not possess unilateral authority to publish or approve public campaign material.
* **Decision:** Consequential decisions (approval, rejection, policy override) require authenticated human actions. Approvals cryptographically bind to the exact SHA-256 content hash of the reviewed version; any subsequent edit immediately invalidates approval. Overrides require manager/admin roles and mandatory recorded rationale.
* **Consequences:** Accountable governance trail. Models advise; authorized humans decide.

---

## ADR 006: Provider-Agnostic Model Gateway with Local Fallback
* **Status:** Accepted
* **Context:** Dependency on external model providers introduces risks of rate limits, latency spikes, outages, and regional data residency constraints.
* **Decision:** Abstract all inference behind a `ModelGateway` interface that supports hosted providers and an offline deterministic local evaluator engine.
* **Consequences:** Guarantees 100% demo uptime and offline capability while maintaining full compliance with tenant data residency policies.

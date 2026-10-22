# Inkloom AI — Operational Runbooks

Implementation Specification IS 19 & IS 47

## Runbook 1: Resolving Source Conflict Incident
1. **Trigger:** Alert banner indicates conflicting guidance between active source documents (e.g. `98.5% certified organic` vs `100% organic`).
2. **Action:**
   - Navigate to **Brand Library & Sources**.
   - Review conflicting document versions and ownership.
   - If one document is legacy, transition its state to `SUPERSEDED`.
   - Update canonical facts in the Claims Register.
   - Trigger a re-evaluation on all affected in-review assets.

## Runbook 2: Provider Outage / Degraded Local Mode
1. **Trigger:** External AI provider latency exceeds 5000ms or returns 5xx errors.
2. **Action:**
   - The system automatically triggers circuit breaker failover to `inkloom-local-engine`.
   - Deterministic checks (glossary, freshness, contrast, logo geometry, injection scan) continue with 0% downtime.
   - Semantic checks run using local heuristics; findings are tagged with `ConfidenceBand: LOW_EXPERIMENTAL`.

## Runbook 3: Investigating Unresolved Review Blockers
1. **Trigger:** Asset cannot transition to `APPROVED` state.
2. **Action:**
   - Inspect the **Blockers Tally** on the Review Studio.
   - Review each `CRITICAL_BLOCKER` card.
   - Either accept the suggested correction patch (which automatically creates a compliant version) or have a Brand Manager submit an authorized override with audit rationale.

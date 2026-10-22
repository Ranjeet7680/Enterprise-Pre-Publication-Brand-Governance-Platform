# Inkloom AI — Enterprise Pre-Publication Brand Governance Platform

> Built strictly to the **Inkloom AI Brand Governance Architecture Blueprint (Version 1.2, 22 October 2026)**.

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI_0.115-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_19_+_Vite_+_Tailwind-61dafb.svg)](https://react.dev)
[![WCAG 2.1](https://img.shields.io/badge/Accessibility-WCAG_2.1_AA-purple.svg)](https://www.w3.org/WAI/WCAG21/quickref/)

---

## 🌟 Executive Summary
Inkloom AI is an enterprise brand-governance workspace designed for organizations whose content is authored by distributed employees, creative agencies, and generative AI tools. Rather than providing a simplistic or opaque "AI score", Inkloom delivers **evidence-linked feedback, safe correction suggestions, accountable human approvals, and insights into outdated or contradictory guidelines**.

---

## 🏗️ Architecture & Core Components

```
├── apps/
│   └── web/                   # React 19 + TypeScript + Vite + Tailwind CSS Editorial UI
├── services/
│   └── api/                   # FastAPI Modular Monolith + SQLite Canonical Workflow Store
│       ├── main.py            # REST API (IS 25 error taxonomy & OpenAPI)
│       ├── database.py        # SQLite schema, transactional queries & Nadi Naturals seed
│       └── orchestrator.py    # Multi-stage review dependency graph execution
├── packages/
│   ├── contracts/             # Shared Pydantic data contracts (IS 01 - IS 54)
│   ├── policy_engine/         # Deterministic rules (Glossary, Date Freshness, Injections)
│   ├── model_gateway/         # RAG retriever, grounded claim verifier, tone, visual & WCAG
│   └── evaluation/            # Gold-standard benchmark suite (Precision, Recall, Citations)
├── docs/                      # ADRs, Threat Model, Runbooks, Demo Guide
└── tests/                     # Pytest automated test suite
```

### Key Technical Pillars
1. **Hybrid Deterministic + AI Engine (ADR 003):** Deterministic policy checks for exact constraints (glossaries, expired campaigns, prompt injections, WCAG contrast calculations) execute alongside bounded RAG retrieval and explainable AI for semantic tone and claim substantiation.
2. **Approved Source Bounding (ADR 004):** Only source documents formally approved by authorized brand owners with valid effective windows enter the retrieval index. When active documents conflict, the system halts verification and alerts the brand owner.
3. **Cryptographic Approval Binding (ADR 005):** Approvals bind to the exact SHA-256 hash of the content version. Any subsequent edit immediately invalidates the approval and increments the version counter.
4. **Indian Languages & Voice Safety (IS 12 & IS 38):** Indian language support (Hindi, Tamil, Telugu, Bengali) with Hinglish code-switching nuance, voice dictation with editable transcripts, and Web Speech read-aloud. Voice cannot unilaterally approve content.
5. **Quality Gates & Benchmarking (IS 23):** Built-in benchmark suite measuring Precision (100%), Recall (100%), and Citation Validity (100%) against a gold-standard corpus.

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- Python 3.11+
- Node.js 18+ (tested on v24.12.0)
- npm 10+

### 2. Backend Setup & Startup
```powershell
# From the repository root
python -m venv venv
.\venv\Scripts\Activate.ps1   # Or source venv/bin/activate on Unix

# Initialize and seed database with Nadi Naturals demo data
python services/api/database.py

# Start FastAPI server on port 8000
python -m uvicorn services.api.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation (Interactive OpenAPI / Swagger) will be available at: `http://localhost:8000/docs`

### 3. Frontend Setup & Startup
```powershell
cd apps/web
npm install
npm run dev
```
Web Application will be available at: `http://localhost:3000`

---

## 🧪 Running Tests & Benchmark

```powershell
# Run automated pytest suite
pytest tests/test_engine.py -v

# Run Quality Gates evaluation benchmark
python packages/evaluation/benchmark.py
```

---

## 🎭 10 Blueprint Interactive Scenarios
Switch between scenarios instantly in the platform's top bar:
1. **Terminology Conflict:** Catches legacy name `"GlowSerum Plus"`, replaces with `"Nadi Radiant Dew"`.
2. **Unsupported Claim:** Flags unverified superlative `"Most trusted solution in India"`.
3. **Expired Offer:** Cites `"Festive Glow Kit 25% off"` past October 15, 2026.
4. **Tone Mismatch:** Replaces aggressive/sarcastic copy with calm botanical posture.
5. **Logo Misuse:** Flags stretched 1.75:1 logo violating master 3.50:1 aspect ratio.
6. **Accessibility:** Flags low contrast (`2.3:1`) and generates draft alt-text.
7. **Hinglish Nuance:** Preserves cultural colloquialisms while auditing botanical claims.
8. **Source Conflict:** Identifies contradiction between Spec v2.1 (98.5%) and Legacy Brief (100%).
9. **Voice Dictation:** Speech input with editable transcript verification.
10. **Prompt Injection Defense:** Intercepts and neutralizes malicious instruction overrides.

---

## ⚖️ Governance & Limitations Disclosure
Inkloom AI assists authorized teams; it does not replace formal legal counsel or statutory accessibility audits. All demo benchmark metrics and sample analytics are transparently labeled as synthetic demonstration records.

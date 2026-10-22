"""
Inkloom AI - SQLite Canonical Workflow & Governance Repository
Provides transactional persistence, tenant isolation, and initial seed data for 'Nadi Naturals'.
"""

import sqlite3
import json
import hashlib
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any

import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from packages.contracts.models import (
    Role,
    ReviewStatus,
    Severity,
    FindingCategory,
    FindingStatus,
    ConfidenceBand,
    SourceApprovalState,
    User,
    BrandWorkspace,
    SourceChunk,
    SourceDocument,
    ApprovedFact,
    TermEntry,
    VisualAsset,
    ContentVersion,
    ContentItem,
    Finding,
    CheckExecution,
    ReviewRun,
    Comment,
    ApprovalRecord,
    AuditEvent,
    FindingFeedback
)

DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "inkloom.db"))


def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.executescript("""
    CREATE TABLE IF NOT EXISTS tenants (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        role TEXT NOT NULL,
        created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS workspaces (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        default_locale TEXT NOT NULL,
        supported_locales TEXT NOT NULL,
        allowed_channels TEXT NOT NULL,
        retention_days INTEGER NOT NULL,
        provider_policy TEXT NOT NULL,
        tone_profile TEXT NOT NULL,
        created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS source_documents (
        id TEXT PRIMARY KEY,
        workspace_id TEXT NOT NULL,
        tenant_id TEXT NOT NULL,
        title TEXT NOT NULL,
        doc_type TEXT NOT NULL,
        current_version INTEGER NOT NULL,
        approval_state TEXT NOT NULL,
        owner_id TEXT NOT NULL,
        owner_name TEXT NOT NULL,
        effective_from TEXT,
        effective_until TEXT,
        content_hash TEXT NOT NULL,
        raw_content TEXT NOT NULL,
        chunks TEXT NOT NULL,
        created_at TEXT NOT NULL,
        approved_at TEXT,
        approved_by TEXT
    );

    CREATE TABLE IF NOT EXISTS approved_facts (
        id TEXT PRIMARY KEY,
        workspace_id TEXT NOT NULL,
        tenant_id TEXT NOT NULL,
        subject TEXT NOT NULL,
        attribute TEXT NOT NULL,
        value TEXT NOT NULL,
        unit TEXT,
        qualifier TEXT,
        locale TEXT NOT NULL,
        source_id TEXT NOT NULL,
        source_version INTEGER NOT NULL,
        source_title TEXT NOT NULL,
        effective_from TEXT,
        effective_until TEXT,
        owner TEXT NOT NULL,
        is_active INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS term_entries (
        id TEXT PRIMARY KEY,
        workspace_id TEXT NOT NULL,
        tenant_id TEXT NOT NULL,
        preferred_term TEXT NOT NULL,
        prohibited_variants TEXT NOT NULL,
        rationale TEXT NOT NULL,
        locales TEXT NOT NULL,
        channels TEXT NOT NULL,
        exceptions TEXT NOT NULL,
        owner TEXT NOT NULL,
        created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS visual_assets (
        id TEXT PRIMARY KEY,
        workspace_id TEXT NOT NULL,
        tenant_id TEXT NOT NULL,
        asset_name TEXT NOT NULL,
        asset_type TEXT NOT NULL,
        expected_aspect_ratio REAL,
        aspect_ratio_tolerance REAL,
        min_width INTEGER,
        min_height INTEGER,
        min_clear_space_px INTEGER,
        allowed_background_colors TEXT,
        approved_hex_colors TEXT,
        file_path TEXT,
        preview_url TEXT
    );

    CREATE TABLE IF NOT EXISTS content_items (
        id TEXT PRIMARY KEY,
        workspace_id TEXT NOT NULL,
        tenant_id TEXT NOT NULL,
        title TEXT NOT NULL,
        channel TEXT NOT NULL,
        locale TEXT NOT NULL,
        campaign TEXT,
        current_version INTEGER NOT NULL,
        versions TEXT NOT NULL,
        current_text TEXT NOT NULL,
        current_hash TEXT NOT NULL,
        image_metadata TEXT,
        status TEXT NOT NULL,
        created_by TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        assigned_reviewer_id TEXT,
        approved_version INTEGER,
        approved_hash TEXT
    );

    CREATE TABLE IF NOT EXISTS review_runs (
        id TEXT PRIMARY KEY,
        content_item_id TEXT NOT NULL,
        content_version INTEGER NOT NULL,
        content_hash TEXT NOT NULL,
        workspace_id TEXT NOT NULL,
        tenant_id TEXT NOT NULL,
        checks_executed TEXT NOT NULL,
        findings TEXT NOT NULL,
        total_findings INTEGER NOT NULL,
        blockers_count INTEGER NOT NULL,
        warnings_count INTEGER NOT NULL,
        model_version TEXT NOT NULL,
        prompt_version TEXT NOT NULL,
        duration_ms INTEGER NOT NULL,
        created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS comments (
        id TEXT PRIMARY KEY,
        content_item_id TEXT NOT NULL,
        content_version INTEGER NOT NULL,
        finding_id TEXT,
        author_id TEXT NOT NULL,
        author_name TEXT NOT NULL,
        author_role TEXT NOT NULL,
        text TEXT NOT NULL,
        is_resolved INTEGER NOT NULL,
        created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS approvals (
        id TEXT PRIMARY KEY,
        content_item_id TEXT NOT NULL,
        content_version INTEGER NOT NULL,
        content_hash TEXT NOT NULL,
        approver_id TEXT NOT NULL,
        approver_name TEXT NOT NULL,
        approver_role TEXT NOT NULL,
        decision TEXT NOT NULL,
        rationale TEXT NOT NULL,
        policy_snapshot TEXT NOT NULL,
        timestamp TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_events (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        workspace_id TEXT NOT NULL,
        actor_id TEXT NOT NULL,
        actor_name TEXT NOT NULL,
        actor_role TEXT NOT NULL,
        action TEXT NOT NULL,
        target_type TEXT NOT NULL,
        target_id TEXT NOT NULL,
        request_id TEXT NOT NULL,
        outcome TEXT NOT NULL,
        metadata TEXT NOT NULL,
        timestamp TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS finding_feedback (
        id TEXT PRIMARY KEY,
        finding_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        feedback_type TEXT NOT NULL,
        comment TEXT,
        created_at TEXT NOT NULL
    );
    """)

    conn.commit()
    conn.close()


def compute_sha256(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def seed_database():
    """Seeds the full 'Nadi Naturals' workspace and 10 demo scenarios."""
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()

    # Clear existing demo data
    for table in ["tenants", "users", "workspaces", "source_documents", "approved_facts", 
                  "term_entries", "visual_assets", "content_items", "review_runs", 
                  "comments", "approvals", "audit_events", "finding_feedback"]:
        cursor.execute(f"DELETE FROM {table}")

    tenant_id = "tenant-nadi-naturals-01"
    workspace_id = "ws-nadi-naturals-main"

    # 1. Tenant
    cursor.execute(
        "INSERT INTO tenants (id, name, created_at) VALUES (?, ?, ?)",
        (tenant_id, "Nadi Naturals Organic FMCG Ltd.", datetime.now(timezone.utc).isoformat())
    )

    # 2. Users with explicit roles (IS 50 & Blueprint section 4)
    users = [
        ("usr-ananya", tenant_id, "Ananya Sharma", "ananya@nadinaturals.com", Role.CREATOR.value),
        ("usr-rohit", tenant_id, "Rohit Verma", "rohit.review@nadinaturals.com", Role.REVIEWER.value),
        ("usr-priya", tenant_id, "Priya Nair", "priya.brand@nadinaturals.com", Role.MANAGER.value),
        ("usr-kavita", tenant_id, "Kavita Iyer", "kavita.legal@nadinaturals.com", Role.ADMINISTRATOR.value),
        ("usr-agency", tenant_id, "Dev Agency Lead", "campaigns@socialagency.in", Role.AGENCY.value),
    ]
    for uid, tid, name, email, role in users:
        cursor.execute(
            "INSERT INTO users (id, tenant_id, name, email, role, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            (uid, tid, name, email, role, datetime.now(timezone.utc).isoformat())
        )

    # 3. Workspace
    tone_profile = {
        "warmth": "warm",
        "conciseness": "concise",
        "expertise": "expert",
        "optimism": "optimistic",
        "directness": "direct",
        "principles": "Authentic botanical science, calm confidence, respect for Indian Ayurvedic heritage, zero hype."
    }
    provider_policy = {
        "external_ai_allowed": True,
        "region": "ap-south-1",
        "data_retention_days": 90,
        "pii_redaction_enabled": True
    }
    cursor.execute(
        """INSERT INTO workspaces (
            id, tenant_id, name, description, default_locale, supported_locales,
            allowed_channels, retention_days, provider_policy, tone_profile, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            workspace_id,
            tenant_id,
            "Nadi Naturals Master Brand",
            "Pre-publication brand governance workspace for Nadi Naturals skincare & hair wellness.",
            "en-IN",
            json.dumps(["en-IN", "hi-IN", "ta-IN", "te-IN", "bn-IN"]),
            json.dumps(["social", "web", "email", "support", "ad", "print"]),
            365,
            json.dumps(provider_policy),
            json.dumps(tone_profile),
            datetime.now(timezone.utc).isoformat()
        )
    )

    # 4. Approved Sources (IS 02)
    # Source A: Master Formulation Specification (Approved)
    src_formulation_content = """
    Nadi Radiant Dew Face Serum Formulation Specification:
    - Formulated with 98.5% certified organic botanicals, 10% active niacinamide, and 1% multi-molecular hyaluronic acid.
    - Clinically proven: 24% skin hydration improvement over 14 days in a dermatologically monitored clinical trial of 120 Indian participants.
    - Safe for sensitive skin: Dermatologist tested, non-comedogenic, free from parabens, synthetic sulfates, and artificial fragrances.
    - Note on Organic Claim: Water and mineral salts cannot be certified organic under ECOCERT standards; therefore, claims must state '98.5% certified organic botanicals', never '100% organic'.
    """
    src_formulation_chunks = [
        {"id": "chk-form-1", "source_id": "src-formulation-v2", "source_version": 2, "section": "Ingredients & Certification", "content": src_formulation_content.strip(), "page_number": 1}
    ]
    cursor.execute(
        """INSERT INTO source_documents (
            id, workspace_id, tenant_id, title, doc_type, current_version, approval_state,
            owner_id, owner_name, effective_from, effective_until, content_hash, raw_content,
            chunks, created_at, approved_at, approved_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            "src-formulation-v2",
            workspace_id,
            tenant_id,
            "Nadi Radiant Dew Formulation Specification v2.1",
            "product_factsheet",
            2,
            SourceApprovalState.APPROVED.value,
            "usr-priya",
            "Priya Nair",
            (datetime.now(timezone.utc) - timedelta(days=60)).isoformat(),
            (datetime.now(timezone.utc) + timedelta(days=365)).isoformat(),
            compute_sha256(src_formulation_content),
            src_formulation_content.strip(),
            json.dumps(src_formulation_chunks),
            datetime.now(timezone.utc).isoformat(),
            datetime.now(timezone.utc).isoformat(),
            "usr-priya"
        )
    )

    # Source B: Promotional Calendar (Expired festive offer!)
    src_promo_content = """
    Festive Glow Kit 2026 Promotional Terms:
    - Nadi Festive Glow Kit: 25% discount bundle with free brass Gua Sha.
    - Promotional window strictly valid until October 15, 2026.
    - Code: FESTIVE25. All promotional assets must cease distribution after October 15, 2026.
    """
    src_promo_chunks = [
        {"id": "chk-promo-1", "source_id": "src-festive-promo", "source_version": 1, "section": "Festive Promotion 2026", "content": src_promo_content.strip(), "page_number": 1}
    ]
    cursor.execute(
        """INSERT INTO source_documents (
            id, workspace_id, tenant_id, title, doc_type, current_version, approval_state,
            owner_id, owner_name, effective_from, effective_until, content_hash, raw_content,
            chunks, created_at, approved_at, approved_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            "src-festive-promo",
            workspace_id,
            tenant_id,
            "Festive Glow Kit 2026 Promotional Calendar",
            "claims_register",
            1,
            SourceApprovalState.APPROVED.value,
            "usr-priya",
            "Priya Nair",
            (datetime.now(timezone.utc) - timedelta(days=45)).isoformat(),
            datetime(2026, 10, 15, 23, 59, 59, tzinfo=timezone.utc).isoformat(),  # EXPIRED!
            compute_sha256(src_promo_content),
            src_promo_content.strip(),
            json.dumps(src_promo_chunks),
            datetime.now(timezone.utc).isoformat(),
            datetime.now(timezone.utc).isoformat(),
            "usr-priya"
        )
    )

    # Source C: Legacy Marketing Brief (Active document causing source conflict with Source A!)
    src_legacy_content = """
    Legacy Marketing Brief 2025:
    - Nadi Radiant Dew Face Serum contains 100% organic ingredients harvested sustainably across Western Ghats.
    """
    src_legacy_chunks = [
        {"id": "chk-legacy-1", "source_id": "src-legacy-brief", "source_version": 1, "section": "Historical Marketing Copy", "content": src_legacy_content.strip(), "page_number": 1}
    ]
    cursor.execute(
        """INSERT INTO source_documents (
            id, workspace_id, tenant_id, title, doc_type, current_version, approval_state,
            owner_id, owner_name, effective_from, effective_until, content_hash, raw_content,
            chunks, created_at, approved_at, approved_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            "src-legacy-brief",
            workspace_id,
            tenant_id,
            "Legacy Marketing Brief 2025 (Outdated Active Copy)",
            "claims_register",
            1,
            SourceApprovalState.APPROVED.value,
            "usr-priya",
            "Priya Nair",
            (datetime.now(timezone.utc) - timedelta(days=300)).isoformat(),
            (datetime.now(timezone.utc) + timedelta(days=100)).isoformat(),
            compute_sha256(src_legacy_content),
            src_legacy_content.strip(),
            json.dumps(src_legacy_chunks),
            datetime.now(timezone.utc).isoformat(),
            datetime.now(timezone.utc).isoformat(),
            "usr-priya"
        )
    )

    # 5. Approved Facts (IS 05)
    facts = [
        ("fact-01", workspace_id, tenant_id, "Nadi Radiant Dew Face Serum", "certified organic botanical content", "98.5%", "%", "certified botanicals", "en-IN", "src-formulation-v2", 2, "Nadi Radiant Dew Formulation Specification v2.1", (datetime.now(timezone.utc) - timedelta(days=60)).isoformat(), (datetime.now(timezone.utc) + timedelta(days=365)).isoformat(), "Priya Nair", 1),
        ("fact-02", workspace_id, tenant_id, "Nadi Radiant Dew Face Serum", "niacinamide concentration", "10%", "%", "active niacinamide", "en-IN", "src-formulation-v2", 2, "Nadi Radiant Dew Formulation Specification v2.1", (datetime.now(timezone.utc) - timedelta(days=60)).isoformat(), (datetime.now(timezone.utc) + timedelta(days=365)).isoformat(), "Priya Nair", 1),
        ("fact-03", workspace_id, tenant_id, "Nadi Radiant Dew Face Serum", "clinical hydration improvement", "24%", "%", "over 14 days on 120 participants", "en-IN", "src-formulation-v2", 2, "Nadi Radiant Dew Formulation Specification v2.1", (datetime.now(timezone.utc) - timedelta(days=60)).isoformat(), (datetime.now(timezone.utc) + timedelta(days=365)).isoformat(), "Priya Nair", 1),
        ("fact-04", workspace_id, tenant_id, "Festive Glow Kit 2026", "promotional discount", "25%", "%", "valid until 15 October 2026", "en-IN", "src-festive-promo", 1, "Festive Glow Kit 2026 Promotional Calendar", (datetime.now(timezone.utc) - timedelta(days=45)).isoformat(), datetime(2026, 10, 15, 23, 59, 59, tzinfo=timezone.utc).isoformat(), "Priya Nair", 1),
        # Conflicting fact from legacy source!
        ("fact-05", workspace_id, tenant_id, "Nadi Radiant Dew Face Serum", "certified organic botanical content", "100%", "%", "unqualified 100% claim", "en-IN", "src-legacy-brief", 1, "Legacy Marketing Brief 2025 (Outdated Active Copy)", (datetime.now(timezone.utc) - timedelta(days=300)).isoformat(), (datetime.now(timezone.utc) + timedelta(days=100)).isoformat(), "Priya Nair", 1),
    ]
    for fid, wid, tid, subj, attr, val, unit, qual, loc, sid, sv, st, ef, eu, own, act in facts:
        cursor.execute(
            """INSERT INTO approved_facts (
                id, workspace_id, tenant_id, subject, attribute, value, unit, qualifier,
                locale, source_id, source_version, source_title, effective_from, effective_until,
                owner, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (fid, wid, tid, subj, attr, val, unit, qual, loc, sid, sv, st, ef, eu, own, act)
        )

    # 6. Terminology & Glossary Entries (IS 08)
    glossary = [
        (
            "term-01", workspace_id, tenant_id,
            "Nadi Radiant Dew Face Serum",
            json.dumps(["GlowSerum Plus", "Glow Serum+", "Radiant Dew Drops"]),
            "Rebranded in Q1 2026 to consolidate master naming architecture. 'GlowSerum Plus' was retired.",
            json.dumps(["*"]),
            json.dumps(["*"]),
            json.dumps(["historical press archive"]),
            "Priya Nair",
            datetime.now(timezone.utc).isoformat()
        ),
        (
            "term-02", workspace_id, tenant_id,
            "Free from synthetic parabens and sulfates",
            json.dumps(["Chemical-free", "100% chemical free", "zero chemicals"]),
            "Misleading claim. Water, vitamins, and hyaluronic acid are chemical compounds. Must specify free from synthetic parabens and sulfates.",
            json.dumps(["*"]),
            json.dumps(["*"]),
            json.dumps([]),
            "Kavita Iyer",
            datetime.now(timezone.utc).isoformat()
        ),
        (
            "term-03", workspace_id, tenant_id,
            "Nadi Kesh Amrit Hair Oil",
            json.dumps(["Miracle Hair Oil", "Kesh Miracle 100", "Instant Regrowth Oil"]),
            "Cosmetic regulations prohibit claiming miraculous medicinal hair regrowth.",
            json.dumps(["*"]),
            json.dumps(["*"]),
            json.dumps([]),
            "Kavita Iyer",
            datetime.now(timezone.utc).isoformat()
        )
    ]
    for tid, wid, tnt, pref, prohib, rat, locs, chans, exc, own, ca in glossary:
        cursor.execute(
            """INSERT INTO term_entries (
                id, workspace_id, tenant_id, preferred_term, prohibited_variants, rationale,
                locales, channels, exceptions, owner, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (tid, wid, tnt, pref, prohib, rat, locs, chans, exc, own, ca)
        )

    # 7. Visual Assets (IS 10)
    cursor.execute(
        """INSERT INTO visual_assets (
            id, workspace_id, tenant_id, asset_name, asset_type, expected_aspect_ratio,
            aspect_ratio_tolerance, min_width, min_height, min_clear_space_px,
            allowed_background_colors, approved_hex_colors, file_path, preview_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            "asset-logo-primary",
            workspace_id,
            tenant_id,
            "Nadi Naturals Primary Horizontal Logo",
            "logo",
            3.5,
            0.1,
            350,
            100,
            24,
            json.dumps(["#F7F4EB", "#FFFFFF", "#1E4D2B"]),
            json.dumps(["#1E4D2B", "#F7F4EB", "#C85A32", "#2C332D"]),
            "/assets/nadi-logo-primary.svg",
            "/assets/nadi-logo-primary.svg"
        )
    )

    # 8. Sample Content Item with Initial Blueprint Demo Story (Section 39)
    # Submission with 3 distinct findings: outdated product name, unsupported superlative, incorrect percentage!
    demo_content_text = """Experience pure luxury with GlowSerum Plus! It is the number 1 in India solution for instant glass skin. Formulated with 100% organic ingredients, our botanical blend delivers 24% skin hydration improvement over 14 days. Don't miss our Festive Glow Kit with 25% off!"""
    v1_hash = compute_sha256(demo_content_text)
    content_item_id = "content-nadi-social-launch"

    versions = [
        {
            "version_number": 1,
            "content_text": demo_content_text,
            "content_hash": v1_hash,
            "author_id": "usr-ananya",
            "author_name": "Ananya Sharma",
            "created_at": (datetime.now(timezone.utc) - timedelta(hours=2)).isoformat(),
            "change_summary": "Initial draft submitted by creator"
        }
    ]

    cursor.execute(
        """INSERT INTO content_items (
            id, workspace_id, tenant_id, title, channel, locale, campaign,
            current_version, versions, current_text, current_hash, image_metadata,
            status, created_by, created_at, updated_at, assigned_reviewer_id,
            approved_version, approved_hash
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            content_item_id,
            workspace_id,
            tenant_id,
            "Nadi Radiant Dew Instagram & Social Campaign",
            "social",
            "en-IN",
            "Diwali Festive Glow 2026",
            1,
            json.dumps(versions),
            demo_content_text,
            v1_hash,
            json.dumps({
                "width": 1080,
                "height": 1080,
                "aspect_ratio": 1.0,
                "contains_logo": True,
                "logo_aspect_ratio": 1.8,  # STRETCHED LOGO VIOLATION! (Expected 3.5:1)
                "text_color": "#B0A090",   # LOW CONTRAST VIOLATION!
                "bg_color": "#F7F4EB",
                "alt_text": "",            # MISSING ALT-TEXT!
                "ocr_confidence": 0.58,    # LOW OCR CONFIDENCE (Honest failure demo)
                "is_low_res": True
            }),
            ReviewStatus.IN_REVIEW.value,
            "usr-ananya",
            (datetime.now(timezone.utc) - timedelta(hours=2)).isoformat(),
            datetime.now(timezone.utc).isoformat(),
            "usr-rohit",
            None,
            None
        )
    )

    # 9. Audit Event
    cursor.execute(
        """INSERT INTO audit_events (
            id, tenant_id, workspace_id, actor_id, actor_name, actor_role,
            action, target_type, target_id, request_id, outcome, metadata, timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            "aud-001",
            tenant_id,
            workspace_id,
            "usr-ananya",
            "Ananya Sharma",
            "creator",
            "CONTENT_SUBMITTED",
            "content",
            content_item_id,
            "req-init-seed",
            "success",
            json.dumps({"version": 1, "title": "Nadi Radiant Dew Instagram & Social Campaign"}),
            datetime.now(timezone.utc).isoformat()
        )
    )

    conn.commit()
    conn.close()
    print("Inkloom AI database initialized and seeded successfully.")


if __name__ == "__main__":
    seed_database()

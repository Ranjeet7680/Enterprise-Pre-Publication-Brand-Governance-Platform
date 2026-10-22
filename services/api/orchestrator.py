"""
Inkloom AI - Review Orchestrator
Executes the multi-stage review dependency graph, aggregates findings,
and persists execution telemetry.
"""

import uuid
import json
from datetime import datetime, timezone
from typing import List, Dict, Any, Tuple

import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from packages.contracts.models import (
    ReviewRun,
    Finding,
    CheckExecution,
    Severity,
    AuditEvent,
    SourceDocument,
    SourceApprovalState,
    ApprovedFact,
    TermEntry,
    VisualAsset
)
from packages.policy_engine.engine import PolicyEngine
from packages.model_gateway.gateway import ModelGateway
from services.api.database import get_db_connection


class ReviewOrchestrator:
    def __init__(self):
        self.policy_engine = PolicyEngine()
        self.model_gateway = ModelGateway()

    def run_review(
        self,
        content_item_id: str,
        content_version: int,
        content_text: str,
        content_hash: str,
        channel: str,
        locale: str,
        workspace_id: str,
        tenant_id: str,
        image_metadata: Dict[str, Any] = None,
        actor_id: str = "system",
        actor_name: str = "Inkloom Orchestrator",
        actor_role: str = "orchestrator"
    ) -> ReviewRun:
        start_overall = datetime.now()
        review_run_id = f"run-{uuid.uuid4().hex[:12]}"
        all_findings: List[Finding] = []
        all_executions: List[CheckExecution] = []

        # Load workspace knowledge and policies from DB
        conn = get_db_connection()
        cursor = conn.cursor()

        # 1. Load active approved sources
        cursor.execute(
            "SELECT * FROM source_documents WHERE workspace_id = ? AND approval_state = ?",
            (workspace_id, SourceApprovalState.APPROVED.value)
        )
        sources: List[SourceDocument] = []
        for row in cursor.fetchall():
            chunks_data = json.loads(row["chunks"])
            sources.append(SourceDocument(
                id=row["id"],
                workspace_id=row["workspace_id"],
                tenant_id=row["tenant_id"],
                title=row["title"],
                doc_type=row["doc_type"],
                current_version=row["current_version"],
                approval_state=SourceApprovalState(row["approval_state"]),
                owner_id=row["owner_id"],
                owner_name=row["owner_name"],
                effective_from=datetime.fromisoformat(row["effective_from"]) if row["effective_from"] else None,
                effective_until=datetime.fromisoformat(row["effective_until"]) if row["effective_until"] else None,
                content_hash=row["content_hash"],
                raw_content=row["raw_content"],
                chunks=chunks_data
            ))

        # 2. Load approved facts
        cursor.execute("SELECT * FROM approved_facts WHERE workspace_id = ? AND is_active = 1", (workspace_id,))
        facts: List[ApprovedFact] = []
        for row in cursor.fetchall():
            facts.append(ApprovedFact(
                id=row["id"],
                workspace_id=row["workspace_id"],
                tenant_id=row["tenant_id"],
                subject=row["subject"],
                attribute=row["attribute"],
                value=row["value"],
                unit=row["unit"],
                qualifier=row["qualifier"],
                locale=row["locale"],
                source_id=row["source_id"],
                source_version=row["source_version"],
                source_title=row["source_title"],
                effective_from=datetime.fromisoformat(row["effective_from"]) if row["effective_from"] else None,
                effective_until=datetime.fromisoformat(row["effective_until"]) if row["effective_until"] else None,
                owner=row["owner"],
                is_active=bool(row["is_active"])
            ))

        # 3. Load glossary terms
        cursor.execute("SELECT * FROM term_entries WHERE workspace_id = ?", (workspace_id,))
        terms: List[TermEntry] = []
        for row in cursor.fetchall():
            terms.append(TermEntry(
                id=row["id"],
                workspace_id=row["workspace_id"],
                tenant_id=row["tenant_id"],
                preferred_term=row["preferred_term"],
                prohibited_variants=json.loads(row["prohibited_variants"]),
                rationale=row["rationale"],
                locales=json.loads(row["locales"]),
                channels=json.loads(row["channels"]),
                exceptions=json.loads(row["exceptions"]),
                owner=row["owner"],
                created_at=datetime.fromisoformat(row["created_at"])
            ))

        # 4. Load visual assets
        cursor.execute("SELECT * FROM visual_assets WHERE workspace_id = ?", (workspace_id,))
        visual_assets: List[VisualAsset] = []
        for row in cursor.fetchall():
            visual_assets.append(VisualAsset(
                id=row["id"],
                workspace_id=row["workspace_id"],
                tenant_id=row["tenant_id"],
                asset_name=row["asset_name"],
                asset_type=row["asset_type"],
                expected_aspect_ratio=row["expected_aspect_ratio"],
                aspect_ratio_tolerance=row["aspect_ratio_tolerance"] or 0.1,
                min_width=row["min_width"],
                min_height=row["min_height"],
                min_clear_space_px=row["min_clear_space_px"],
                allowed_background_colors=json.loads(row["allowed_background_colors"] or "[]"),
                approved_hex_colors=json.loads(row["approved_hex_colors"] or "[]"),
                file_path=row["file_path"],
                preview_url=row["preview_url"]
            ))

        # 5. Load workspace tone profile
        cursor.execute("SELECT tone_profile FROM workspaces WHERE id = ?", (workspace_id,))
        ws_row = cursor.fetchone()
        tone_profile = json.loads(ws_row["tone_profile"]) if ws_row and ws_row["tone_profile"] else {}

        # --- EXECUTE DEPENDENCY GRAPH ---

        # 1. Prompt Injection Resistance (IS 17)
        inj_findings, inj_exec = self.policy_engine.scan_prompt_injection(
            content_text, content_item_id, content_version, review_run_id
        )
        all_findings.extend(inj_findings)
        all_executions.append(inj_exec)

        # 2. Terminology & Glossary Evaluation (IS 08)
        term_findings, term_exec = self.policy_engine.check_terminology(
            content_text, terms, channel, locale, content_item_id, content_version, review_run_id
        )
        all_findings.extend(term_findings)
        all_executions.append(term_exec)

        # 3. Deterministic Freshness & Expired Offers (IS 05)
        fresh_findings, fresh_exec = self.policy_engine.check_date_freshness(
            content_text, facts, content_item_id, content_version, review_run_id
        )
        all_findings.extend(fresh_findings)
        all_executions.append(fresh_exec)

        # 4. Superlatives & Clinical Disclosures (IS 04, IS 05)
        sup_findings, sup_exec = self.policy_engine.check_superlatives_and_disclaimers(
            content_text, content_item_id, content_version, review_run_id
        )
        all_findings.extend(sup_findings)
        all_executions.append(sup_exec)

        # 5. RAG Grounded Claim Verification (IS 06, IS 14)
        rag_findings, rag_exec = self.model_gateway.verify_grounded_claims(
            content_text, sources, facts, content_item_id, content_version, review_run_id
        )
        all_findings.extend(rag_findings)
        all_executions.append(rag_exec)

        # 6. Tone & Style Evaluation (IS 07)
        tone_findings, tone_exec = self.model_gateway.evaluate_tone_and_style(
            content_text, tone_profile, content_item_id, content_version, review_run_id
        )
        all_findings.extend(tone_findings)
        all_executions.append(tone_exec)

        # 7. Visual Governance (IS 10)
        vis_findings, vis_exec = self.model_gateway.check_visual_governance(
            image_metadata, visual_assets, content_item_id, content_version, review_run_id
        )
        all_findings.extend(vis_findings)
        all_executions.append(vis_exec)

        # 8. Accessibility & Contrast Calculation (IS 11)
        acc_findings, acc_exec = self.model_gateway.check_accessibility(
            content_text, image_metadata, content_item_id, content_version, review_run_id
        )
        all_findings.extend(acc_findings)
        all_executions.append(acc_exec)

        # 9. Indian Languages & Code-Switching Nuance (IS 12)
        lang_findings, lang_exec = self.model_gateway.check_indian_languages_and_code_switching(
            content_text, locale, content_item_id, content_version, review_run_id
        )
        all_findings.extend(lang_findings)
        all_executions.append(lang_exec)

        total_duration_ms = int((datetime.now() - start_overall).total_seconds() * 1000)
        blockers_count = sum(1 for f in all_findings if f.severity == Severity.CRITICAL_BLOCKER)
        warnings_count = sum(1 for f in all_findings if f.severity == Severity.MAJOR_WARNING)

        review_run = ReviewRun(
            id=review_run_id,
            content_item_id=content_item_id,
            content_version=content_version,
            content_hash=content_hash,
            workspace_id=workspace_id,
            tenant_id=tenant_id,
            checks_executed=all_executions,
            findings=all_findings,
            total_findings=len(all_findings),
            blockers_count=blockers_count,
            warnings_count=warnings_count,
            model_version=self.model_gateway.version,
            prompt_version="2026.10-claims-tone-v1",
            duration_ms=total_duration_ms,
            created_at=datetime.now(timezone.utc)
        )

        # Persist review run
        cursor.execute(
            """INSERT INTO review_runs (
                id, content_item_id, content_version, content_hash, workspace_id,
                tenant_id, checks_executed, findings, total_findings, blockers_count,
                warnings_count, model_version, prompt_version, duration_ms, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                review_run.id,
                review_run.content_item_id,
                review_run.content_version,
                review_run.content_hash,
                review_run.workspace_id,
                review_run.tenant_id,
                json.dumps([e.model_dump() for e in review_run.checks_executed]),
                json.dumps([f.model_dump(mode="json") for f in review_run.findings]),
                review_run.total_findings,
                review_run.blockers_count,
                review_run.warnings_count,
                review_run.model_version,
                review_run.prompt_version,
                review_run.duration_ms,
                review_run.created_at.isoformat()
            )
        )

        # Emit audit event
        audit_event = AuditEvent(
            tenant_id=tenant_id,
            workspace_id=workspace_id,
            actor_id=actor_id,
            actor_name=actor_name,
            actor_role=actor_role,
            action="REVIEW_RUN_COMPLETED",
            target_type="content",
            target_id=content_item_id,
            metadata={
                "review_run_id": review_run.id,
                "version": content_version,
                "findings": len(all_findings),
                "blockers": blockers_count,
                "warnings": warnings_count,
                "duration_ms": total_duration_ms
            }
        )
        cursor.execute(
            """INSERT INTO audit_events (
                id, tenant_id, workspace_id, actor_id, actor_name, actor_role,
                action, target_type, target_id, request_id, outcome, metadata, timestamp
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                audit_event.id,
                audit_event.tenant_id,
                audit_event.workspace_id,
                audit_event.actor_id,
                audit_event.actor_name,
                audit_event.actor_role,
                audit_event.action,
                audit_event.target_type,
                audit_event.target_id,
                audit_event.request_id,
                audit_event.outcome,
                json.dumps(audit_event.metadata),
                audit_event.timestamp.isoformat()
            )
        )

        conn.commit()
        conn.close()

        return review_run

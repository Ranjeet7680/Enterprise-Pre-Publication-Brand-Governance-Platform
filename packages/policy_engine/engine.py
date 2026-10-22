"""
Inkloom AI - Deterministic Policy Engine
Handles exact constraints, glossary compliance, date freshness, superlatives,
disclaimers, and prompt injection defense.
"""

import re
import unicodedata
from datetime import datetime, timezone
from typing import List, Optional, Tuple, Dict, Any

import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from packages.contracts.models import (
    TermEntry,
    ApprovedFact,
    Finding,
    FindingCategory,
    Severity,
    ConfidenceBand,
    TextSpan,
    SourceReference,
    CheckExecution
)


class PolicyEngine:
    def __init__(self):
        # Known prompt injection signatures
        self.injection_patterns = [
            re.compile(r"ignore\s+(all\s+)?(previous|prior|above)\s+instructions", re.IGNORECASE),
            re.compile(r"system\s*prompt\s*override", re.IGNORECASE),
            re.compile(r"system\s*instruction\s*:", re.IGNORECASE),
            re.compile(r"you\s+are\s+now\s+an\s+unrestricted", re.IGNORECASE),
            re.compile(r"bypass\s+brand\s+(rules|governance|policy)", re.IGNORECASE),
            re.compile(r"reveal\s+(system\s+prompts|other\s+brands|secrets)", re.IGNORECASE),
            re.compile(r"approve\s+(this\s+text\s+)?immediately\s+without\s+checks", re.IGNORECASE),
        ]

        # Common unverified promotional superlatives
        self.unsubstantiated_superlatives = [
            ("best in the world", "Unsubstantiated absolute superlative: requires legal audit and comparative evidence."),
            ("number 1 in india", "Unsubstantiated market leadership claim: requires external industry audit or third-party validation."),
            ("no. 1 in india", "Unsubstantiated market leadership claim: requires external industry audit."),
            ("100% cure", "Absolute medical cure claim prohibited under cosmetic & drug advertising regulations."),
            ("guaranteed overnight miracle", "Unverified absolute efficacy claim: cosmetics must not promise instantaneous permanent cure."),
            ("completely risk-free", "Absolute guarantee requires insurance backing and qualification disclosure.")
        ]

    def normalize_text(self, text: str) -> str:
        """Unicode NFKC normalization for stable matching across encodings."""
        return unicodedata.normalize("NFKC", text)

    def scan_prompt_injection(
        self,
        text: str,
        content_item_id: str,
        content_version: int,
        review_run_id: str
    ) -> Tuple[List[Finding], CheckExecution]:
        start_time = datetime.now()
        findings: List[Finding] = []
        norm_text = self.normalize_text(text)

        for pat in self.injection_patterns:
            for match in pat.finditer(norm_text):
                matched_str = match.group(0)
                span = TextSpan(
                    start_offset=match.start(),
                    end_offset=match.end(),
                    highlight_text=matched_str
                )
                findings.append(Finding(
                    review_run_id=review_run_id,
                    content_item_id=content_item_id,
                    content_version=content_version,
                    category=FindingCategory.PRIVACY,
                    severity=Severity.CRITICAL_BLOCKER,
                    title="Adversarial Prompt Injection Detected",
                    explanation=f"Content contains untrusted instruction pattern ('{matched_str}') attempting to override system behavior. Neutralized and flagged.",
                    text_span=span,
                    suggested_replacement="",
                    confidence=ConfidenceBand.HIGH,
                    requires_human_approval=True
                ))

        duration_ms = int((datetime.now() - start_time).total_seconds() * 1000)
        execution = CheckExecution(
            check_name="prompt_injection_guard",
            check_type="deterministic",
            status="failed_with_findings" if findings else "passed",
            duration_ms=duration_ms,
            findings_count=len(findings),
            details="Scanned for malicious instruction overrides. Untrusted input boundary maintained."
        )
        return findings, execution

    def check_terminology(
        self,
        text: str,
        terms: List[TermEntry],
        channel: str,
        locale: str,
        content_item_id: str,
        content_version: int,
        review_run_id: str
    ) -> Tuple[List[Finding], CheckExecution]:
        start_time = datetime.now()
        findings: List[Finding] = []
        norm_text = self.normalize_text(text)

        for term in terms:
            # Check locale/channel scope
            if "*" not in term.locales and locale not in term.locales:
                continue
            if "*" not in term.channels and channel not in term.channels:
                continue

            for prohibited in term.prohibited_variants:
                # Word-boundary aware case-insensitive regex
                pattern = re.compile(rf"\b{re.escape(prohibited)}\b", re.IGNORECASE)
                for match in pattern.finditer(norm_text):
                    matched_str = match.group(0)
                    
                    # Check exceptions
                    is_excepted = False
                    for exc in term.exceptions:
                        if exc.lower() in norm_text.lower():
                            is_excepted = True
                            break
                    if is_excepted:
                        continue

                    span = TextSpan(
                        start_offset=match.start(),
                        end_offset=match.end(),
                        highlight_text=matched_str
                    )
                    source_ref = SourceReference(
                        source_id=term.id,
                        source_version=1,
                        source_title="Brand Glossary & Terminology Guide",
                        section="Approved Product Naming & Terminology",
                        excerpt=f"Use '{term.preferred_term}' instead of '{prohibited}'. {term.rationale}"
                    )
                    findings.append(Finding(
                        review_run_id=review_run_id,
                        content_item_id=content_item_id,
                        content_version=content_version,
                        category=FindingCategory.TERMINOLOGY,
                        severity=Severity.CRITICAL_BLOCKER,
                        title=f"Prohibited Term: '{matched_str}'",
                        explanation=f"'{matched_str}' is prohibited. Preferred brand term is '{term.preferred_term}'. {term.rationale}",
                        text_span=span,
                        source_references=[source_ref],
                        suggested_replacement=term.preferred_term,
                        confidence=ConfidenceBand.HIGH,
                        requires_human_approval=False
                    ))

        duration_ms = int((datetime.now() - start_time).total_seconds() * 1000)
        execution = CheckExecution(
            check_name="terminology_glossary",
            check_type="deterministic",
            status="failed_with_findings" if findings else "passed",
            duration_ms=duration_ms,
            findings_count=len(findings),
            details=f"Evaluated against {len(terms)} approved glossary rules."
        )
        return findings, execution

    def check_date_freshness(
        self,
        text: str,
        facts: List[ApprovedFact],
        content_item_id: str,
        content_version: int,
        review_run_id: str,
        current_time: Optional[datetime] = None
    ) -> Tuple[List[Finding], CheckExecution]:
        start_time = datetime.now()
        findings: List[Finding] = []
        norm_text = self.normalize_text(text)
        now = current_time or datetime.now(timezone.utc)

        # Check for expired offers / promotions in facts
        for fact in facts:
            if fact.effective_until and fact.effective_until < now:
                # Look if fact subject or value is mentioned in text
                val_clean = fact.value.lower()
                subj_clean = fact.subject.lower()
                
                # Check if this expired campaign/offer is referenced
                if subj_clean in norm_text.lower() or (val_clean and val_clean in norm_text.lower()):
                    match_pos = norm_text.lower().find(subj_clean)
                    if match_pos == -1:
                        match_pos = norm_text.lower().find(val_clean)
                    
                    span = None
                    if match_pos != -1:
                        end_pos = match_pos + len(subj_clean if subj_clean in norm_text.lower() else val_clean)
                        span = TextSpan(
                            start_offset=match_pos,
                            end_offset=end_pos,
                            highlight_text=norm_text[match_pos:end_pos]
                        )

                    source_ref = SourceReference(
                        source_id=fact.source_id,
                        source_version=fact.source_version,
                        source_title=fact.source_title,
                        section="Promotional Calendar & Validity",
                        excerpt=f"{fact.subject} {fact.attribute}: {fact.value} (Expired on {fact.effective_until.strftime('%Y-%m-%d')})"
                    )

                    findings.append(Finding(
                        review_run_id=review_run_id,
                        content_item_id=content_item_id,
                        content_version=content_version,
                        category=FindingCategory.STALE_SOURCE,
                        severity=Severity.CRITICAL_BLOCKER,
                        title=f"Expired Offer / Promotion: {fact.subject}",
                        explanation=f"Offer '{fact.subject}' expired on {fact.effective_until.strftime('%d %B %Y')}. Cannot publish expired pricing or discounts without active promotional extension.",
                        text_span=span,
                        source_references=[source_ref],
                        suggested_replacement=None,
                        confidence=ConfidenceBand.HIGH,
                        requires_human_approval=True
                    ))

        duration_ms = int((datetime.now() - start_time).total_seconds() * 1000)
        execution = CheckExecution(
            check_name="date_freshness_verifier",
            check_type="deterministic",
            status="failed_with_findings" if findings else "passed",
            duration_ms=duration_ms,
            findings_count=len(findings),
            details="Deterministic freshness verification against campaign effective dates."
        )
        return findings, execution

    def check_superlatives_and_disclaimers(
        self,
        text: str,
        content_item_id: str,
        content_version: int,
        review_run_id: str
    ) -> Tuple[List[Finding], CheckExecution]:
        start_time = datetime.now()
        findings: List[Finding] = []
        norm_text = self.normalize_text(text)

        # 1. Superlatives
        for superlative, explanation in self.unsubstantiated_superlatives:
            pattern = re.compile(rf"\b{re.escape(superlative)}\b", re.IGNORECASE)
            for match in pattern.finditer(norm_text):
                span = TextSpan(
                    start_offset=match.start(),
                    end_offset=match.end(),
                    highlight_text=match.group(0)
                )
                findings.append(Finding(
                    review_run_id=review_run_id,
                    content_item_id=content_item_id,
                    content_version=content_version,
                    category=FindingCategory.UNSUPPORTED_CLAIM,
                    severity=Severity.MAJOR_WARNING,
                    title=f"Unsubstantiated Superlative: '{match.group(0)}'",
                    explanation=explanation,
                    text_span=span,
                    suggested_replacement="trusted personal care brand" if "no. 1" in superlative or "number 1" in superlative else None,
                    confidence=ConfidenceBand.HIGH,
                    requires_human_approval=True
                ))

        # 2. Clinical claims requiring disclaimers
        clinical_mentions = re.findall(r"\b(\d+%\s+(hydration|breakage|improvement|reduction))\b", norm_text, re.IGNORECASE)
        has_disclaimer = bool(re.search(r"(\*|based on|clinical|study|participants)", norm_text, re.IGNORECASE))

        if clinical_mentions and not has_disclaimer:
            first_match = re.search(r"\b\d+%\s+\w+\b", norm_text, re.IGNORECASE)
            span = None
            if first_match:
                span = TextSpan(
                    start_offset=first_match.start(),
                    end_offset=first_match.end(),
                    highlight_text=first_match.group(0)
                )

            findings.append(Finding(
                review_run_id=review_run_id,
                content_item_id=content_item_id,
                content_version=content_version,
                category=FindingCategory.DISCLOSURE,
                severity=Severity.MAJOR_WARNING,
                title="Missing Required Clinical Disclaimer",
                explanation="Quantitative efficacy claims (e.g. hydration improvement) require a mandatory footnote disclosing the clinical study duration and cohort size (e.g. '*Based on a 14-day clinical study with 120 participants').",
                text_span=span,
                suggested_replacement=f"{norm_text}\n\n*Based on a 14-day clinical study on 120 participants.",
                confidence=ConfidenceBand.HIGH,
                requires_human_approval=False
            ))

        duration_ms = int((datetime.now() - start_time).total_seconds() * 1000)
        execution = CheckExecution(
            check_name="superlative_and_disclosure_rules",
            check_type="deterministic",
            status="failed_with_findings" if findings else "passed",
            duration_ms=duration_ms,
            findings_count=len(findings),
            details="Scanned for unsubstantiated marketing superlatives and mandatory footnote disclosures."
        )
        return findings, execution

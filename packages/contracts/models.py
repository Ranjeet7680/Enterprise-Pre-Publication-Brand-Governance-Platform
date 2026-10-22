"""
Inkloom AI - Brand Governance Platform
Canonical Data Models & Contracts (Implementation Specification IS 01-IS 54)
"""

from datetime import datetime, timezone
from enum import Enum
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field
import uuid


class Role(str, Enum):
    CREATOR = "creator"
    REVIEWER = "reviewer"
    MANAGER = "manager"
    ADMINISTRATOR = "administrator"
    AGENCY = "agency"


class ReviewStatus(str, Enum):
    DRAFT = "draft"
    IN_REVIEW = "in_review"
    CHANGES_REQUESTED = "changes_requested"
    RESUBMITTED = "resubmitted"
    APPROVED = "approved"
    REJECTED = "rejected"
    ARCHIVED = "archived"


class Severity(str, Enum):
    CRITICAL_BLOCKER = "critical_blocker"
    MAJOR_WARNING = "major_warning"
    MINOR_ADVISORY = "minor_advisory"
    INFO = "info"


class FindingCategory(str, Enum):
    TERMINOLOGY = "terminology"
    TONE = "tone"
    MESSAGING = "messaging"
    UNSUPPORTED_CLAIM = "unsupported_claim"
    FACTUAL_CONFLICT = "factual_conflict"
    STALE_SOURCE = "stale_source"
    VISUAL_IDENTITY = "visual_identity"
    ACCESSIBILITY = "accessibility"
    PRIVACY = "privacy"
    DISCLOSURE = "disclosure"
    LOCALE_QUALITY = "locale_quality"
    PROCESSING_WARNING = "processing_warning"


class FindingStatus(str, Enum):
    OPEN = "open"
    ACCEPTED = "accepted"
    DISMISSED = "dismissed"
    ESCALATED = "escalated"
    OVERRIDDEN = "overridden"


class ConfidenceBand(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW_EXPERIMENTAL = "low_experimental"
    ABSTAIN = "abstain"


class SourceApprovalState(str, Enum):
    CANDIDATE = "candidate"
    APPROVED = "approved"
    SUPERSEDED = "superseded"
    REJECTED = "rejected"


class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    role: Role
    tenant_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class BrandWorkspace(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str
    name: str
    description: Optional[str] = None
    default_locale: str = "en-IN"
    supported_locales: List[str] = Field(default_factory=lambda: ["en-IN", "hi-IN", "ta-IN", "te-IN"])
    allowed_channels: List[str] = Field(default_factory=lambda: ["social", "web", "email", "support", "ad", "print"])
    retention_days: int = 365
    provider_policy: Dict[str, Any] = Field(default_factory=lambda: {"external_ai_allowed": True, "region": "ap-south-1"})
    tone_profile: Dict[str, Any] = Field(default_factory=lambda: {
        "warmth": "warm",
        "conciseness": "concise",
        "expertise": "expert",
        "optimism": "optimistic",
        "directness": "direct"
    })
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class SourceChunk(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    source_id: str
    source_version: int
    section: str
    content: str
    page_number: Optional[int] = 1
    metadata: Dict[str, Any] = Field(default_factory=dict)


class SourceDocument(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    workspace_id: str
    tenant_id: str
    title: str
    doc_type: str  # "brand_guide", "product_factsheet", "claims_register", "channel_policy"
    current_version: int = 1
    approval_state: SourceApprovalState = SourceApprovalState.CANDIDATE
    owner_id: str
    owner_name: str
    effective_from: Optional[datetime] = None
    effective_until: Optional[datetime] = None
    content_hash: str
    raw_content: str
    chunks: List[SourceChunk] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    approved_at: Optional[datetime] = None
    approved_by: Optional[str] = None


class ApprovedFact(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    workspace_id: str
    tenant_id: str
    subject: str
    attribute: str
    value: str
    unit: Optional[str] = None
    qualifier: Optional[str] = None
    locale: str = "en-IN"
    source_id: str
    source_version: int
    source_title: str
    effective_from: Optional[datetime] = None
    effective_until: Optional[datetime] = None
    owner: str
    is_active: bool = True


class TermEntry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    workspace_id: str
    tenant_id: str
    preferred_term: str
    prohibited_variants: List[str]
    rationale: str
    locales: List[str] = Field(default_factory=lambda: ["*"])
    channels: List[str] = Field(default_factory=lambda: ["*"])
    exceptions: List[str] = Field(default_factory=list)
    owner: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class VisualAsset(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    workspace_id: str
    tenant_id: str
    asset_name: str
    asset_type: str  # "logo", "palette", "template"
    expected_aspect_ratio: Optional[float] = None
    aspect_ratio_tolerance: float = 0.05
    min_width: Optional[int] = None
    min_height: Optional[int] = None
    min_clear_space_px: Optional[int] = 20
    allowed_background_colors: List[str] = Field(default_factory=list)
    approved_hex_colors: List[str] = Field(default_factory=list)
    file_path: Optional[str] = None
    preview_url: Optional[str] = None


class ContentVersion(BaseModel):
    version_number: int
    content_text: str
    content_hash: str  # SHA-256
    author_id: str
    author_name: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    change_summary: Optional[str] = None


class ContentItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    workspace_id: str
    tenant_id: str
    title: str
    channel: str  # "social", "web", "email", "support", "ad"
    locale: str = "en-IN"
    campaign: Optional[str] = None
    current_version: int = 1
    versions: List[ContentVersion] = Field(default_factory=list)
    current_text: str
    current_hash: str
    image_metadata: Optional[Dict[str, Any]] = None  # width, height, aspect_ratio, dominant_colors, alt_text
    status: ReviewStatus = ReviewStatus.DRAFT
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    assigned_reviewer_id: Optional[str] = None
    approved_version: Optional[int] = None
    approved_hash: Optional[str] = None


class TextSpan(BaseModel):
    start_offset: int
    end_offset: int
    highlight_text: str


class SourceReference(BaseModel):
    source_id: str
    source_version: int
    source_title: str
    section: str
    excerpt: str
    citation_valid: bool = True


class Finding(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    review_run_id: str
    content_item_id: str
    content_version: int
    category: FindingCategory
    severity: Severity
    status: FindingStatus = FindingStatus.OPEN
    title: str
    explanation: str
    text_span: Optional[TextSpan] = None
    visual_region: Optional[Dict[str, Any]] = None  # {x, y, width, height}
    source_references: List[SourceReference] = Field(default_factory=list)
    suggested_replacement: Optional[str] = None
    confidence: ConfidenceBand = ConfidenceBand.HIGH
    requires_human_approval: bool = False
    override_reason: Optional[str] = None
    overridden_by: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class CheckExecution(BaseModel):
    check_name: str
    check_type: str  # "deterministic", "rag_claim", "tone", "visual", "accessibility"
    status: str  # "passed", "failed_with_findings", "abstain", "unavailable", "skipped"
    duration_ms: int
    findings_count: int
    details: Optional[str] = None


class ReviewRun(BaseModel):
    model_config = {"protected_namespaces": ()}
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    content_item_id: str
    content_version: int
    content_hash: str
    workspace_id: str
    tenant_id: str
    checks_executed: List[CheckExecution] = Field(default_factory=list)
    findings: List[Finding] = Field(default_factory=list)
    total_findings: int = 0
    blockers_count: int = 0
    warnings_count: int = 0
    model_version: str = "inkloom-hybrid-v1.2"
    prompt_version: str = "2026.10-claims-tone-v1"
    duration_ms: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Comment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    content_item_id: str
    content_version: int
    finding_id: Optional[str] = None
    author_id: str
    author_name: str
    author_role: Role
    text: str
    is_resolved: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ApprovalRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    content_item_id: str
    content_version: int
    content_hash: str
    approver_id: str
    approver_name: str
    approver_role: Role
    decision: str  # "approved", "rejected", "changes_requested"
    rationale: str
    policy_snapshot: Dict[str, Any] = Field(default_factory=dict)
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class AuditEvent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str
    workspace_id: str
    actor_id: str
    actor_name: str
    actor_role: str
    action: str  # e.g. "SOURCE_APPROVED", "REVIEW_RUN", "SUGGESTION_ACCEPTED", "CONTENT_APPROVED", "POLICY_OVERRIDE"
    target_type: str  # "content", "source", "finding", "policy"
    target_id: str
    request_id: str = Field(default_factory=lambda: str(uuid.uuid4())[:8])
    outcome: str = "success"
    metadata: Dict[str, Any] = Field(default_factory=dict)
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class FindingFeedback(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    finding_id: str
    user_id: str
    feedback_type: str  # "helpful", "incorrect", "duplicate", "too_strict", "unclear_guidance"
    comment: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

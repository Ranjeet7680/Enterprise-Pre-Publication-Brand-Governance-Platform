"""
Inkloom AI - Full REST API Integration Test Suite
Verifies all Blueprint API endpoints using FastAPI TestClient.
"""

import pytest
from fastapi.testclient import TestClient
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from services.api.main import app
from services.api.database import seed_database

client = TestClient(app)


@pytest.fixture(scope="module", autouse=True)
def init_test_db():
    seed_database()


def test_list_workspaces():
    response = client.get("/v1/workspaces")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["name"] == "Nadi Naturals Master Brand"


def test_list_content_items_and_latest_review():
    response = client.get("/v1/content-items")
    assert response.status_code == 200
    items = response.json()
    assert len(items) >= 1
    item_id = items[0]["id"]

    # Fetch latest review
    rev_resp = client.get(f"/v1/content-items/{item_id}/reviews/latest")
    assert rev_resp.status_code == 200
    review = rev_resp.json()
    assert review["total_findings"] >= 1
    assert "checks_executed" in review


def test_scenario_loader_and_override_policy():
    # Load terminology scenario
    load_resp = client.post("/v1/demo/load-scenario/terminology_conflict")
    assert load_resp.status_code == 200
    data = load_resp.json()
    assert data["status"] == "scenario_loaded"
    assert data["blockers_count"] >= 1

    # Fetch latest review to get the blocker finding
    rev_resp = client.get("/v1/content-items/content-nadi-social-launch/reviews/latest")
    review = rev_resp.json()
    blocker = next(f for f in review["findings"] if f["severity"] == "critical_blocker")

    # Creator role cannot override (IS 36)
    forbidden_resp = client.post(f"/v1/findings/{blocker['id']}/override", json={
        "actor_id": "usr-ananya",
        "actor_name": "Ananya Sharma",
        "actor_role": "creator",
        "override_reason": "I want to publish this anyway."
    })
    assert forbidden_resp.status_code == 403

    # Manager role CAN override with valid rationale
    manager_resp = client.post(f"/v1/findings/{blocker['id']}/override", json={
        "actor_id": "usr-priya",
        "actor_name": "Priya Nair",
        "actor_role": "manager",
        "override_reason": "Authorized exception for legacy catalog reprint approved by VP."
    })
    assert manager_resp.status_code == 200
    assert manager_resp.json()["status"] == "overridden"


def test_contrast_tool_endpoint():
    resp = client.post("/v1/tools/contrast", json={
        "text_color": "#B0A090",
        "bg_color": "#F7F4EB"
    })
    assert resp.status_code == 200
    res = resp.json()
    assert res["contrast_ratio"] < 4.5
    assert res["passes_wcag_aa_normal_text"] is False


def test_source_conflicts_detection():
    resp = client.get("/v1/sources/conflicts")
    assert resp.status_code == 200
    data = resp.json()
    assert data["conflicts_count"] >= 1
    assert "organic" in data["conflicts"][0]["attribute"]


def test_evaluation_benchmark_endpoint():
    resp = client.get("/v1/evaluation/benchmark")
    assert resp.status_code == 200
    data = resp.json()
    assert data["metrics"]["precision"] >= 90.0
    assert data["metrics"]["recall"] >= 90.0
    assert data["metrics"]["citation_validity_rate"] >= 90.0

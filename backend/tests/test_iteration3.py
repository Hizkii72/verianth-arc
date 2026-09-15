"""Iteration 3 backend tests: QRIS, recurring targets + pay flow + auto-advance,
notifications from announcements, and language-agnostic API side of finance/CSV data source.
"""
import os
import pytest
import requests
from datetime import datetime, timedelta, timezone

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://verianth-community.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"
TOKEN = "test_tok_personal"
HEADERS = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}


@pytest.fixture(scope="module")
def s():
    sess = requests.Session()
    sess.headers.update(HEADERS)
    yield sess


# ---- basic auth ----
def test_auth_me(s):
    r = s.get(f"{API}/auth/me")
    assert r.status_code == 200, r.text
    j = r.json()
    assert j["is_admin"] is True
    assert j["user_id"] == "user_1344469a0e67"


# ---- QRIS ----
def test_qris_get_and_update(s):
    r = s.get(f"{API}/qris")
    assert r.status_code == 200
    # PUT image + note
    dummy_b64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
    r = s.put(f"{API}/qris", json={"qris": dummy_b64, "qris_note": "TEST_qris_note"})
    assert r.status_code == 200
    r = s.get(f"{API}/qris")
    assert r.status_code == 200
    d = r.json()
    assert d["qris"].startswith("data:image/png")
    assert d["qris_note"] == "TEST_qris_note"
    # cleanup note only, keep qris (may be seeded)
    s.put(f"{API}/qris", json={"qris_note": ""})


# ---- Recurring targets ----
@pytest.fixture(scope="module")
def recurring_target_id(s):
    yesterday = (datetime.now(timezone.utc).date() - timedelta(days=2)).isoformat()
    payload = {
        "name": "TEST_recurring",
        "price": 50000,
        "recurring": True,
        "cycle_days": 7,
        "due_date": yesterday,
        "note": "TEST",
    }
    r = s.post(f"{API}/targets", json=payload)
    assert r.status_code == 200, r.text
    tid = r.json()["target_id"]
    yield tid
    s.delete(f"{API}/targets/{tid}")


def test_target_created_recurring(s, recurring_target_id):
    r = s.get(f"{API}/targets")
    assert r.status_code == 200
    tgt = next((t for t in r.json() if t["target_id"] == recurring_target_id), None)
    assert tgt is not None
    assert tgt["recurring"] is True
    assert tgt["cycle_days"] == 7


def test_target_auto_advance_past_due(s, recurring_target_id):
    # GET should have advanced due_date beyond today (started at yesterday-2)
    r = s.get(f"{API}/targets")
    tgt = next(t for t in r.json() if t["target_id"] == recurring_target_id)
    due = datetime.fromisoformat(tgt["due_date"]).date()
    today = datetime.now(timezone.utc).date()
    assert due >= today, f"Auto-advance failed, due={due}, today={today}"


def test_target_pay_advances_and_sets_last_paid(s, recurring_target_id):
    r = s.get(f"{API}/targets")
    before = next(t for t in r.json() if t["target_id"] == recurring_target_id)
    prev_due = datetime.fromisoformat(before["due_date"]).date()
    r = s.post(f"{API}/targets/{recurring_target_id}/pay")
    assert r.status_code == 200, r.text
    after = r.json()
    new_due = datetime.fromisoformat(after["due_date"]).date()
    assert new_due > prev_due
    assert (new_due - prev_due).days % 7 == 0
    assert after["last_paid_date"] == datetime.now(timezone.utc).date().isoformat()
    assert len(after["payments"]) >= 1


def test_pay_rejects_non_recurring(s):
    r = s.post(f"{API}/targets", json={"name": "TEST_once", "price": 1000, "recurring": False})
    tid = r.json()["target_id"]
    try:
        r = s.post(f"{API}/targets/{tid}/pay")
        assert r.status_code == 400
    finally:
        s.delete(f"{API}/targets/{tid}")


# ---- Announcements create notification ----
def test_announcement_creates_notification(s):
    # baseline
    r = s.get(f"{API}/notifications")
    assert r.status_code == 200
    before_count = len(r.json()["items"])
    # mark existing notifications read
    s.post(f"{API}/notifications/read")
    # create announcement
    payload = {
        "title": "TEST_ann_notif",
        "content": "TEST body",
        "category": "Normal",
        "date": datetime.now(timezone.utc).date().isoformat(),
    }
    r = s.post(f"{API}/announcements", json=payload)
    assert r.status_code == 200, r.text
    ann_id = r.json()["ann_id"]
    try:
        r = s.get(f"{API}/notifications")
        j = r.json()
        assert len(j["items"]) == before_count + 1
        top = j["items"][0]
        assert top["title"] == "TEST_ann_notif"
        assert top["ref_id"] == ann_id
        assert top["link"] == "/pengumuman"
        assert j["unread"] >= 1
        # mark read
        assert s.post(f"{API}/notifications/read").status_code == 200
        r = s.get(f"{API}/notifications")
        assert r.json()["unread"] == 0
    finally:
        s.delete(f"{API}/announcements/{ann_id}")


# ---- Transactions endpoint (for CSV export data source) ----
def test_transactions_list_ok(s):
    r = s.get(f"{API}/transactions")
    assert r.status_code == 200
    assert isinstance(r.json(), list)

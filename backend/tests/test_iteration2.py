"""Iteration 2 backend tests: personal space, fixed roles, agenda-merged-to-announcements."""
import os
import pytest
import requests

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/") if os.environ.get("REACT_APP_BACKEND_URL") else "https://verianth-community.preview.emergentagent.com"

OWNER_TOKEN = "test_tok_personal"
USER_B_TOKEN = "test_tok_b"


def hdr(tok):
    return {"Authorization": f"Bearer {tok}", "Content-Type": "application/json"}


# -------- Roles --------
class TestRoles:
    def test_list_roles_exact_4(self):
        r = requests.get(f"{BASE_URL}/api/roles", headers=hdr(OWNER_TOKEN))
        assert r.status_code == 200
        roles = r.json()
        names = sorted([x["name"] for x in roles])
        assert names == ["APP", "Admin", "Leader", "Member"], f"Got: {names}"
        by = {x["name"]: x for x in roles}
        assert by["Leader"]["color"] == "#facc15" and by["Leader"]["is_admin"] is True
        assert by["Admin"]["color"] == "#ef4444" and by["Admin"]["is_admin"] is True
        assert by["APP"]["color"] == "#a855f7" and by["APP"]["hidden"] is True and by["APP"]["is_admin"] is True
        assert by["Member"]["color"] == "#2cc0ff" and by["Member"]["is_admin"] is False

    def test_post_roles_removed(self):
        r = requests.post(f"{BASE_URL}/api/roles", headers=hdr(OWNER_TOKEN),
                          json={"name": "Foo", "color": "#fff"})
        assert r.status_code in (404, 405), f"Expected removal, got {r.status_code}"

    def test_delete_roles_removed(self):
        r = requests.delete(f"{BASE_URL}/api/roles/role_xxx", headers=hdr(OWNER_TOKEN))
        assert r.status_code in (404, 405)


# -------- Member role validation --------
class TestMemberRole:
    def test_invalid_role_400(self):
        r = requests.put(f"{BASE_URL}/api/members/user_test_b/role",
                         headers=hdr(OWNER_TOKEN), json={"role": "Foo"})
        assert r.status_code == 400

    def test_valid_role_member(self):
        r = requests.put(f"{BASE_URL}/api/members/user_test_b/role",
                         headers=hdr(OWNER_TOKEN), json={"role": "Member"})
        assert r.status_code == 200


# -------- Agenda removed + announcements with agenda category --------
class TestAgendaMerge:
    def test_agendas_gone(self):
        r = requests.get(f"{BASE_URL}/api/agendas", headers=hdr(OWNER_TOKEN))
        assert r.status_code == 404

    def test_announcement_agenda_with_location(self):
        payload = {
            "title": "TEST_agenda_ann", "content": "meet up",
            "category": "Agenda", "date": "2026-02-01",
            "location": "Balai Warga",
        }
        r = requests.post(f"{BASE_URL}/api/announcements", headers=hdr(OWNER_TOKEN), json=payload)
        assert r.status_code == 200, r.text
        created = r.json()
        assert created["category"] == "Agenda"
        assert created["location"] == "Balai Warga"
        ann_id = created["ann_id"]
        # verify by list
        r2 = requests.get(f"{BASE_URL}/api/announcements", headers=hdr(OWNER_TOKEN))
        assert r2.status_code == 200
        found = [a for a in r2.json() if a["ann_id"] == ann_id]
        assert found and found[0]["location"] == "Balai Warga" and found[0]["category"] == "Agenda"
        # cleanup
        requests.delete(f"{BASE_URL}/api/announcements/{ann_id}", headers=hdr(OWNER_TOKEN))


# -------- Personal space --------
KINDS = ["notes", "reminders", "savings", "goals", "finance"]


class TestPersonalSpace:
    def test_unknown_kind_404(self):
        r = requests.get(f"{BASE_URL}/api/personal/foobar", headers=hdr(OWNER_TOKEN))
        assert r.status_code == 404

    @pytest.mark.parametrize("kind", KINDS)
    def test_crud_all_kinds(self, kind):
        # create
        r = requests.post(f"{BASE_URL}/api/personal/{kind}", headers=hdr(OWNER_TOKEN),
                          json={"data": {"title": f"TEST_{kind}", "value": 1}})
        assert r.status_code == 200, r.text
        item = r.json()
        assert item["user_id"] == "user_1344469a0e67"
        assert item["kind"] == kind
        assert item["title"] == f"TEST_{kind}"
        item_id = item["item_id"]

        # list
        r2 = requests.get(f"{BASE_URL}/api/personal/{kind}", headers=hdr(OWNER_TOKEN))
        assert r2.status_code == 200
        assert any(i["item_id"] == item_id for i in r2.json())

        # update
        r3 = requests.put(f"{BASE_URL}/api/personal/{kind}/{item_id}",
                          headers=hdr(OWNER_TOKEN), json={"data": {"value": 42}})
        assert r3.status_code == 200
        assert r3.json()["value"] == 42

        # delete
        r4 = requests.delete(f"{BASE_URL}/api/personal/{kind}/{item_id}", headers=hdr(OWNER_TOKEN))
        assert r4.status_code == 200

        # 2nd delete -> 404
        r5 = requests.delete(f"{BASE_URL}/api/personal/{kind}/{item_id}", headers=hdr(OWNER_TOKEN))
        assert r5.status_code == 404

    def test_per_user_isolation(self):
        # user A creates note
        rA = requests.post(f"{BASE_URL}/api/personal/notes", headers=hdr(OWNER_TOKEN),
                           json={"data": {"title": "TEST_A_note"}})
        assert rA.status_code == 200
        a_item_id = rA.json()["item_id"]

        # user B creates note
        rB = requests.post(f"{BASE_URL}/api/personal/notes", headers=hdr(USER_B_TOKEN),
                           json={"data": {"title": "TEST_B_note"}})
        assert rB.status_code == 200
        b_item_id = rB.json()["item_id"]

        # B lists -> only own
        rBlist = requests.get(f"{BASE_URL}/api/personal/notes", headers=hdr(USER_B_TOKEN))
        assert rBlist.status_code == 200
        b_items = rBlist.json()
        assert all(i["user_id"] == "user_test_b" for i in b_items)
        assert not any(i["item_id"] == a_item_id for i in b_items)

        # B cannot update A's item -> 404
        rBupd = requests.put(f"{BASE_URL}/api/personal/notes/{a_item_id}",
                             headers=hdr(USER_B_TOKEN), json={"data": {"title": "hacked"}})
        assert rBupd.status_code == 404

        # B cannot delete A's item -> 404
        rBdel = requests.delete(f"{BASE_URL}/api/personal/notes/{a_item_id}", headers=hdr(USER_B_TOKEN))
        assert rBdel.status_code == 404

        # cleanup
        requests.delete(f"{BASE_URL}/api/personal/notes/{a_item_id}", headers=hdr(OWNER_TOKEN))
        requests.delete(f"{BASE_URL}/api/personal/notes/{b_item_id}", headers=hdr(USER_B_TOKEN))

    def test_requires_auth(self):
        r = requests.get(f"{BASE_URL}/api/personal/notes")
        assert r.status_code == 401

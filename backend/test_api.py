"""
Assignmentor Backend Verification Suite (Updated for Unit-Free Hierarchy & Login Security)
"""
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def run_tests():
    print("========================================")
    print(" RUNNING ASSIGNMENTOR API TEST SUITE")
    print(" (Subject -> Assignment -> Question)   ")
    print("========================================")

    # 1. Health & Root
    root_res = client.get("/")
    assert root_res.status_code == 200, f"Root failed: {root_res.status_code}"
    assert "hierarchy" in root_res.json()
    print("[PASS] Root endpoint (Subject -> Assignment -> Question): OK")

    health_res = client.get("/api/health")
    assert health_res.status_code == 200, f"Health failed: {health_res.status_code}"
    print("[PASS] Health check: OK")

    # 2. Authentication: Admin Login
    admin_login = client.post("/api/auth/login", json={"username": "ADMIN", "password": "admin@040905"})
    assert admin_login.status_code == 200, f"Admin login failed: {admin_login.text}"
    admin_data = admin_login.json()["data"]
    admin_token = admin_data["token"]
    assert admin_data["user"]["role"] == "admin"
    print("[PASS] Admin Login: OK")

    # 3. Authentication: User Login
    user_login = client.post("/api/auth/login", json={"username": "USER", "password": "user@123"})
    assert user_login.status_code == 200, f"User login failed: {user_login.text}"
    user_data = user_login.json()["data"]
    user_token = user_data["token"]
    assert user_data["user"]["role"] == "user"
    print("[PASS] User Login: OK")

    # 4. CHANGE 1 SECURITY TEST: Failed login returns ONLY generic error and does not leak credentials
    bad_pass_res = client.post("/api/auth/login", json={"username": "ADMIN", "password": "wrong_password"})
    assert bad_pass_res.status_code == 401
    assert bad_pass_res.json()["message"] == "Invalid username or password."
    # Ensure no credentials leaked in body
    assert "wrong_password" not in bad_pass_res.text
    print("[PASS] Change 1 Security: Failed password returns strictly 'Invalid username or password.': OK")

    bad_user_res = client.post("/api/auth/login", json={"username": "NON_EXISTENT_USER", "password": "user@123"})
    assert bad_user_res.status_code == 401
    assert bad_user_res.json()["message"] == "Invalid username or password."
    assert "NON_EXISTENT_USER" not in bad_user_res.text
    print("[PASS] Change 1 Security: Non-existent user returns strictly 'Invalid username or password.': OK")

    # 5. Token Verification & Role Check
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {admin_token}"})
    assert me_res.status_code == 200
    assert me_res.json()["data"]["role"] == "admin"
    print("[PASS] Admin /api/auth/me: OK")

    user_me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {user_token}"})
    assert user_me.status_code == 200
    assert user_me.json()["data"]["role"] == "user"
    print("[PASS] User /api/auth/me: OK")

    # 6. Admin Dashboard Stats (Subjects, Assignments, Questions - NO UNITS)
    stats_res = client.get("/api/stats", headers={"Authorization": f"Bearer {admin_token}"})
    assert stats_res.status_code == 200
    stats = stats_res.json()["data"]
    assert "subjects" in stats and "assignments" in stats and "questions" in stats
    assert "units" not in stats
    print(f"[PASS] Stats API (Unit-Free): OK {stats}")

    # 7. Admin CRUD & Academic Hierarchy: Subject -> Assignment -> Question -> Answer
    new_sub = client.post(
        "/api/subjects",
        json={"name": "Machine Learning", "description": "Study of ML algorithms", "order": 1},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert new_sub.status_code == 201
    created_sub_id = new_sub.json()["data"]["id"]

    new_assign = client.post(
        "/api/assignments",
        json={"subjectId": created_sub_id, "name": "Assignment 1", "assignmentNumber": 1, "description": "Supervised Learning", "order": 1},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert new_assign.status_code == 201
    created_assign_id = new_assign.json()["data"]["id"]

    new_q = client.post(
        "/api/questions",
        json={
            "subjectId": created_sub_id,
            "assignmentId": created_assign_id,
            "questionNumber": 1,
            "questionText": "Explain Supervised Learning with examples.",
            "answer": "<p>Supervised learning involves training a model on labeled data.</p>",
            "questionDiagramUrl": "assignmentor/question-diagrams/mock/diagram_q.png",
            "answerDiagramUrl": "assignmentor/answer-diagrams/mock/diagram_a.png",
            "order": 1
        },
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert new_q.status_code == 201
    created_q_id = new_q.json()["data"]["id"]
    print("[PASS] Admin Hierarchy Creation (Subject -> Assignment -> Question): OK")

    # 8. User Read-Only Verification
    subj_res = client.get("/api/subjects", headers={"Authorization": f"Bearer {user_token}"})
    assert subj_res.status_code == 200
    subjects = subj_res.json()["data"]
    assert len(subjects) > 0
    print(f"[PASS] Subjects GET (User): Found {len(subjects)} subjects")

    sub_assigns_res = client.get(f"/api/subjects/{created_sub_id}/assignments", headers={"Authorization": f"Bearer {user_token}"})
    assert sub_assigns_res.status_code == 200
    sub_assigns = sub_assigns_res.json()["data"]
    assert len(sub_assigns) > 0
    print(f"[PASS] Subject Assignments GET (User): Found {len(sub_assigns)} assignments directly under subject")

    questions_res = client.get(f"/api/assignments/{created_assign_id}/questions", headers={"Authorization": f"Bearer {user_token}"})
    assert questions_res.status_code == 200
    questions = questions_res.json()["data"]
    assert len(questions) > 0
    first_q = questions[0]
    assert "unitId" not in first_q
    assert "questionDiagramUrl" in first_q
    assert "answerDiagramUrl" in first_q
    print("[PASS] Questions GET (User): Found questions (Outside/Inside Diagram URLs verified, no unitId)")

    # 9. RBAC Security: User blocked with HTTP 403 on mutations
    unauthorized_create = client.post(
        "/api/subjects",
        json={"name": "Forbidden Subject", "description": "Should fail", "order": 99},
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert unauthorized_create.status_code == 403
    print("[PASS] RBAC Security: User blocked with HTTP 403 Forbidden on write: OK")

    # 10. Search API (Hierarchy: Subject -> Assignment -> Question)
    search_res = client.get("/api/search?q=Supervised", headers={"Authorization": f"Bearer {user_token}"})
    assert search_res.status_code == 200
    results = search_res.json()["data"]
    assert len(results) > 0
    for item in results:
        assert "unit" not in item
        assert "unitId" not in item
    print(f"[PASS] Search API: Found {len(results)} hierarchical results without units")

    # 11. Cascade Delete: Delete subject removes child assignment and question
    del_sub = client.delete(
        f"/api/subjects/{created_sub_id}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert del_sub.status_code == 200
    assert client.get(f"/api/assignments/{created_assign_id}", headers={"Authorization": f"Bearer {admin_token}"}).status_code == 404
    assert client.get(f"/api/questions/{created_q_id}", headers={"Authorization": f"Bearer {admin_token}"}).status_code == 404
    print("[PASS] Admin Cascade Delete (Subject -> Assignment -> Question): OK")


    print("\n========================================")
    print(" ALL 10 UNIT-FREE TESTS PASSED!         ")
    print("========================================")

if __name__ == "__main__":
    run_tests()

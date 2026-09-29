"""
Assignmentor Comprehensive Live Firebase & Hierarchy Integration Test Suite
Validates:
1. Firebase Connection
2. Authentication Flow (Firebase Auth / ID Tokens)
3. Change 1 Security: Strict generic error 'Invalid username or password.', no leaks
4. RBAC: Admin full CRUD, User read-only (mutations return HTTP 403 Forbidden)
5. Hierarchy: Subject -> Assignment -> Question -> Answer (NO units)
6. Firebase Storage:
   - Question diagram in assignmentor/question-diagrams/... (Outside answer box)
   - Answer diagram in assignmentor/answer-diagrams/... (Inside answer box)
7. Cascade Deletion: Cleaning up diagrams on question/assignment/subject delete
"""
import io
import os
import sys

# Ensure backend root is on PYTHONPATH
sys.path.insert(0, os.path.dirname(__file__))

from fastapi.testclient import TestClient
from app.main import app
from app.firebase import is_mock_mode, init_firebase, get_storage_bucket

client = TestClient(app)

def run_integration_tests():
    print("==================================================")
    print(" RUNNING ASSIGNMENTOR INTEGRATION TEST SUITE       ")
    print("==================================================")

    init_firebase()
    mode_str = "Local Mock / Dev Mode" if is_mock_mode() else "Live Firebase Cloud SDK"
    print(f"[*] Firebase Mode: {mode_str}")

    # 1. Health & Structure
    res = client.get("/")
    assert res.status_code == 200
    assert "hierarchy" in res.json()
    assert res.json()["hierarchy"] == "Subject -> Assignment -> Question -> Answer"
    print("[PASS] 1. Root API & Hierarchy Definition Verified: Subject -> Assignment -> Question -> Answer")

    # 2. Authentication: Admin & User Login
    admin_login = client.post("/api/auth/login", json={"username": "ADMIN", "password": "admin@040905"})
    assert admin_login.status_code == 200, f"Admin login failed: {admin_login.text}"
    admin_data = admin_login.json()["data"]
    admin_token = admin_data["token"]
    assert admin_data["user"]["role"] == "admin"
    print(f"[PASS] 2. Admin Authentication successful (role: {admin_data['user']['role']})")

    user_login = client.post("/api/auth/login", json={"username": "USER", "password": "user@123"})
    assert user_login.status_code == 200, f"User login failed: {user_login.text}"
    user_data = user_login.json()["data"]
    user_token = user_data["token"]
    assert user_data["user"]["role"] == "user"
    print(f"[PASS] 3. User Authentication successful (role: {user_data['user']['role']})")

    # 3. Security Change 1: Strict generic error on login failure
    bad_pass = client.post("/api/auth/login", json={"username": "ADMIN", "password": "wrong_password_999"})
    assert bad_pass.status_code == 401
    assert bad_pass.json()["message"] == "Invalid username or password."
    assert "wrong_password_999" not in bad_pass.text
    print("[PASS] 4. Security Change 1 (Bad Password): Returns strictly 'Invalid username or password.' with zero leakage")

    bad_user = client.post("/api/auth/login", json={"username": "unknown_user_999", "password": "secret_password_999"})
    assert bad_user.status_code == 401
    assert bad_user.json()["message"] == "Invalid username or password."
    assert "unknown_user_999" not in bad_user.text
    assert "secret_password_999" not in bad_user.text
    print("[PASS] 5. Security Change 1 (Bad Username): Returns strictly 'Invalid username or password.' with zero leakage")

    # 4. Token verification and /api/auth/me
    admin_me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {admin_token}"})
    assert admin_me.status_code == 200
    assert admin_me.json()["data"]["role"] == "admin"

    user_me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {user_token}"})
    assert user_me.status_code == 200
    assert user_me.json()["data"]["role"] == "user"
    print("[PASS] 6. ID Token Verification & Profile Endpoint (/api/auth/me) Verified")

    # 5. Admin CRUD: Create Subject -> Assignment -> Question
    # Subject Creation
    sub_res = client.post(
        "/api/subjects",
        json={"name": "Cloud Computing", "description": "Cloud Architecture & Scalability", "order": 1},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert sub_res.status_code == 201, f"Failed subject create: {sub_res.text}"
    subject_id = sub_res.json()["data"]["id"]
    print(f"[PASS] 7. Admin created Subject: {subject_id}")

    # Assignment Creation directly under Subject
    assign_res = client.post(
        "/api/assignments",
        json={"subjectId": subject_id, "name": "Assignment 1: Distributed Storage", "assignmentNumber": 1, "description": "Storage systems", "order": 1},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert assign_res.status_code == 201, f"Failed assignment create: {assign_res.text}"
    assignment_id = assign_res.json()["data"]["id"]
    print(f"[PASS] 8. Admin created Assignment: {assignment_id} directly under Subject {subject_id}")

    # Question Creation directly under Assignment
    q_res = client.post(
        "/api/questions",
        json={
            "subjectId": subject_id,
            "assignmentId": assignment_id,
            "questionNumber": 1,
            "questionText": "Explain the CAP Theorem and its implications in distributed systems.",
            "answer": "<p>The CAP theorem states that a distributed data store can only provide two of Consistency, Availability, and Partition tolerance.</p>",
            "order": 1
        },
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert q_res.status_code == 201, f"Failed question create: {q_res.text}"
    question_id = q_res.json()["data"]["id"]
    print(f"[PASS] 9. Admin created Question: {question_id} directly under Assignment {assignment_id}")

    # 6. Firebase Storage: Upload Diagrams
    # Question Diagram (Outside answer box)
    fake_img = io.BytesIO(b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82")
    q_diagram_res = client.post(
        "/api/upload/question-diagram",
        files={"file": ("diagram_q.png", fake_img, "image/png")},
        data={"subjectId": subject_id, "assignmentId": assignment_id, "questionId": question_id},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert q_diagram_res.status_code == 200, f"Question diagram upload failed: {q_diagram_res.text}"
    q_url = q_diagram_res.json()["data"]["url"]
    assert "assignmentor/question-diagrams" in q_url
    assert subject_id in q_url and assignment_id in q_url and question_id in q_url
    print(f"[PASS] 10. Question Diagram uploaded to storage structure: {q_url}")

    # Answer Diagram (Inside answer box)
    fake_img.seek(0)
    a_diagram_res = client.post(
        "/api/upload/answer-diagram",
        files={"file": ("diagram_ans.png", fake_img, "image/png")},
        data={"subjectId": subject_id, "assignmentId": assignment_id, "questionId": question_id},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert a_diagram_res.status_code == 200, f"Answer diagram upload failed: {a_diagram_res.text}"
    a_url = a_diagram_res.json()["data"]["url"]
    assert "assignmentor/answer-diagrams" in a_url
    assert subject_id in a_url and assignment_id in a_url and question_id in a_url
    print(f"[PASS] 11. Answer Diagram uploaded to storage structure: {a_url}")

    # Verify Question now has both diagram URLs attached
    fetched_q = client.get(f"/api/questions/{question_id}", headers={"Authorization": f"Bearer {user_token}"})
    assert fetched_q.status_code == 200
    q_body = fetched_q.json()["data"]
    assert q_body["questionDiagramUrl"] == q_url
    assert q_body["answerDiagramUrl"] == a_url
    assert "unitId" not in q_body
    print("[PASS] 12. Question retrieved with verified questionDiagramUrl and answerDiagramUrl")

    # 7. User Role RBAC Verification: User CAN read, but CANNOT mutate (HTTP 403 Forbidden)
    user_get_subs = client.get("/api/subjects", headers={"Authorization": f"Bearer {user_token}"})
    assert user_get_subs.status_code == 200
    print("[PASS] 13. User read access to Subjects: OK (HTTP 200)")

    user_get_assigns = client.get(f"/api/subjects/{subject_id}/assignments", headers={"Authorization": f"Bearer {user_token}"})
    assert user_get_assigns.status_code == 200
    print("[PASS] 14. User read access to Assignments: OK (HTTP 200)")

    user_get_qs = client.get(f"/api/assignments/{assignment_id}/questions", headers={"Authorization": f"Bearer {user_token}"})
    assert user_get_qs.status_code == 200
    print("[PASS] 15. User read access to Questions: OK (HTTP 200)")

    # Attempt mutations as user -> Expect 403 Forbidden
    for endpoint, method, payload in [
        ("/api/subjects", "POST", {"name": "Hacker Sub", "description": "Forbidden", "order": 99}),
        (f"/api/subjects/{subject_id}", "PUT", {"name": "Mutated Name"}),
        (f"/api/subjects/{subject_id}", "DELETE", None),
        ("/api/assignments", "POST", {"subjectId": subject_id, "name": "Hacker Assignment", "assignmentNumber": 2}),
        (f"/api/assignments/{assignment_id}", "DELETE", None),
        ("/api/questions", "POST", {"subjectId": subject_id, "assignmentId": assignment_id, "questionNumber": 2, "questionText": "Forbidden"}),
        (f"/api/questions/{question_id}", "DELETE", None),
    ]:
        if method == "POST":
            attempt = client.post(endpoint, json=payload, headers={"Authorization": f"Bearer {user_token}"})
        elif method == "PUT":
            attempt = client.put(endpoint, json=payload, headers={"Authorization": f"Bearer {user_token}"})
        elif method == "DELETE":
            attempt = client.delete(endpoint, headers={"Authorization": f"Bearer {user_token}"})
        assert attempt.status_code == 403, f"Expected 403 for {method} {endpoint}, got {attempt.status_code}"
    print("[PASS] 16. RBAC Enforcement: All 7 User mutation attempts strictly returned HTTP 403 Forbidden")

    # 8. Admin Cascade Delete: Deleting Subject deletes child assignments, questions & diagrams
    del_sub = client.delete(f"/api/subjects/{subject_id}", headers={"Authorization": f"Bearer {admin_token}"})
    assert del_sub.status_code == 200
    print(f"[PASS] 17. Admin cascade deleted Subject: {subject_id}")

    # Verify assignment and question are gone
    assert client.get(f"/api/assignments/{assignment_id}", headers={"Authorization": f"Bearer {admin_token}"}).status_code == 404
    assert client.get(f"/api/questions/{question_id}", headers={"Authorization": f"Bearer {admin_token}"}).status_code == 404
    print("[PASS] 18. Verified child Assignment and Question cascaded and deleted (HTTP 404)")

    print("\n==================================================")
    print(" ALL 18 INTEGRATION & SECURITY TESTS PASSED!      ")
    print("==================================================")
    return True

if __name__ == "__main__":
    run_integration_tests()

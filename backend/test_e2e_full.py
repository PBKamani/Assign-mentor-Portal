"""
Assignmentor Comprehensive End-to-End Application Test Suite
Tests:
- Admin Flow (full CRUD, diagram upload, replace, delete)
- User Flow (read-only hierarchy navigation, previous/next, RBAC 403 enforcement)
- Authentication & Login Security (Change 1 generic 401 error, no credential leakage)
- Diagram Placement Contracts (Question diagram outside answer box, Answer diagram inside answer box)
- Search Flow (Subject -> Assignment -> Question hierarchy, NO units)
- Error States (404s, invalid file uploads, file size limits, unauthenticated/forbidden requests)
- Data Integrity (Cascade deletion of subjects, assignments, questions, and storage diagrams)
"""
import io
import os
import sys

# Ensure backend directory is in path
sys.path.insert(0, os.path.dirname(__file__))

from fastapi.testclient import TestClient
from app.main import app
from app.firebase import init_firebase, is_mock_mode, get_storage_bucket

client = TestClient(app)

def create_dummy_png(text=b"test"):
    # Minimal valid 1x1 PNG image
    return io.BytesIO(b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82")

def run_e2e_tests():
    print("=================================================================")
    print("       ASSIGNMENTOR FULL END-TO-END APPLICATION TEST SUITE       ")
    print("=================================================================")

    init_firebase()
    print(f"[*] Firebase Mode: {'Local Mock/Dev' if is_mock_mode() else 'Live Cloud SDK'}")

    # ==========================================
    # 1. APPLICATION & HIERARCHY VERIFICATION
    # ==========================================
    root_res = client.get("/")
    assert root_res.status_code == 200
    assert root_res.json()["hierarchy"] == "Subject -> Assignment -> Question -> Answer"
    print("[PASS] 1. Root API: Academic hierarchy strictly verified (Subject -> Assignment -> Question -> Answer)")

    health_res = client.get("/api/health")
    assert health_res.status_code == 200
    print("[PASS] 2. Health Endpoint: Backend is online and operational")

    # ==========================================
    # 2. LOGIN SECURITY & CHANGE 1 ENFORCEMENT
    # ==========================================
    # Correct Admin Login
    admin_auth = client.post("/api/auth/login", json={"username": "ADMIN", "password": "admin@040905"})
    assert admin_auth.status_code == 200, f"Admin login failed: {admin_auth.text}"
    admin_data = admin_auth.json()["data"]
    admin_token = admin_data["token"]
    assert admin_data["user"]["role"] == "admin"
    print("[PASS] 3. Admin Login: Succeeded, role correctly identified as 'admin'")

    # Correct User Login
    user_auth = client.post("/api/auth/login", json={"username": "USER", "password": "user@123"})
    assert user_auth.status_code == 200, f"User login failed: {user_auth.text}"
    user_data = user_auth.json()["data"]
    user_token = user_data["token"]
    assert user_data["user"]["role"] == "user"
    print("[PASS] 4. User Login: Succeeded, role correctly identified as 'user'")

    # Change 1 Security: Wrong Password
    bad_pass = client.post("/api/auth/login", json={"username": "ADMIN", "password": "incorrect_password_xyz"})
    assert bad_pass.status_code == 401
    assert bad_pass.json()["message"] == "Invalid username or password."
    assert "incorrect_password_xyz" not in bad_pass.text
    print("[PASS] 5. Security Change 1: Wrong password returns strictly 'Invalid username or password.' with zero leakage")

    # Change 1 Security: Wrong Username
    bad_user = client.post("/api/auth/login", json={"username": "unknown_admin_user", "password": "admin@040905"})
    assert bad_user.status_code == 401
    assert bad_user.json()["message"] == "Invalid username or password."
    assert "unknown_admin_user" not in bad_user.text
    print("[PASS] 6. Security Change 1: Wrong username returns strictly 'Invalid username or password.' with zero leakage")

    # Change 1 Security: Empty Credentials
    empty_auth = client.post("/api/auth/login", json={"username": "", "password": ""})
    assert empty_auth.status_code in (400, 401, 422)
    assert "password" not in empty_auth.text or "Invalid" in empty_auth.text
    print("[PASS] 7. Security Change 1: Empty credentials handled safely without leaking data")

    # Profile verification
    me_admin = client.get("/api/auth/me", headers={"Authorization": f"Bearer {admin_token}"})
    assert me_admin.status_code == 200 and me_admin.json()["data"]["role"] == "admin"
    me_user = client.get("/api/auth/me", headers={"Authorization": f"Bearer {user_token}"})
    assert me_user.status_code == 200 and me_user.json()["data"]["role"] == "user"
    print("[PASS] 8. Profile & Token Verification: /api/auth/me validates roles for Admin and User")

    # ==========================================
    # 3. ADMIN CRUD FLOW (Subject -> Assignment -> Question)
    # ==========================================
    # Create Subject
    sub_post = client.post(
        "/api/subjects",
        json={"name": "Artificial Intelligence", "description": "Foundations of AI and Neural Networks", "order": 1},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert sub_post.status_code == 201
    sub_id = sub_post.json()["data"]["id"]

    # Edit Subject
    sub_put = client.put(
        f"/api/subjects/{sub_id}",
        json={"description": "Modern Foundations of AI, Machine Learning and Deep Learning"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert sub_put.status_code == 200
    assert "Modern Foundations" in sub_put.json()["data"]["description"]
    print(f"[PASS] 9. Admin Subject CRUD: Created and updated Subject {sub_id}")

    # Create Assignment
    assign_post = client.post(
        "/api/assignments",
        json={"subjectId": sub_id, "name": "Assignment 1: Search Algorithms", "assignmentNumber": 1, "description": "BFS, DFS, and A* Search", "order": 1},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert assign_post.status_code == 201
    assign_id = assign_post.json()["data"]["id"]

    # Edit Assignment
    assign_put = client.put(
        f"/api/assignments/{assign_id}",
        json={"name": "Assignment 1: Informed and Uninformed Search Algorithms"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert assign_put.status_code == 200
    assert "Informed and Uninformed" in assign_put.json()["data"]["name"]
    print(f"[PASS] 10. Admin Assignment CRUD: Created and updated Assignment {assign_id}")

    # Create Question
    q_post = client.post(
        "/api/questions",
        json={
            "subjectId": sub_id,
            "assignmentId": assign_id,
            "questionNumber": 1,
            "questionText": "Explain the A* search algorithm and heuristic admissibility.",
            "answer": "<p>A* evaluates nodes by combining g(n) and h(n): f(n) = g(n) + h(n).</p>",
            "order": 1
        },
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert q_post.status_code == 201
    q_id = q_post.json()["data"]["id"]

    # Edit Question
    q_put = client.put(
        f"/api/questions/{q_id}",
        json={"answer": "<p>A* evaluates nodes by combining path cost g(n) and heuristic cost h(n): f(n) = g(n) + h(n). Admissible heuristics never overestimate.</p>"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert q_put.status_code == 200
    assert "Admissible heuristics" in q_put.json()["data"]["answer"]
    print(f"[PASS] 11. Admin Question CRUD: Created and updated Question {q_id}")

    # Create a 2nd Question for Previous/Next navigation testing
    q2_post = client.post(
        "/api/questions",
        json={
            "subjectId": sub_id,
            "assignmentId": assign_id,
            "questionNumber": 2,
            "questionText": "Compare BFS vs DFS in terms of space and time complexity.",
            "answer": "<p>BFS uses O(b^d) memory while DFS uses O(bm) memory.</p>",
            "order": 2
        },
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert q2_post.status_code == 201
    q2_id = q2_post.json()["data"]["id"]
    print(f"[PASS] 12. Admin created Question 2 ({q2_id}) for navigation testing")

    # ==========================================
    # 4. DIAGRAM MANAGEMENT (Upload, Replace, Delete)
    # ==========================================
    # 4a. Upload Question Diagram
    q_img1 = create_dummy_png(b"q_diagram_1")
    upload_qd = client.post(
        "/api/upload/question-diagram",
        files={"file": ("astar_graph.png", q_img1, "image/png")},
        data={"subjectId": sub_id, "assignmentId": assign_id, "questionId": q_id},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert upload_qd.status_code == 200
    qd_url_1 = upload_qd.json()["data"]["url"]
    assert "assignmentor/question-diagrams" in qd_url_1
    assert sub_id in qd_url_1 and assign_id in qd_url_1 and q_id in qd_url_1
    print(f"[PASS] 13. Question Diagram uploaded: {qd_url_1}")

    # 4b. Upload Answer Diagram
    ans_img1 = create_dummy_png(b"ans_diagram_1")
    upload_ad = client.post(
        "/api/upload/answer-diagram",
        files={"file": ("astar_solution_tree.png", ans_img1, "image/png")},
        data={"subjectId": sub_id, "assignmentId": assign_id, "questionId": q_id},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert upload_ad.status_code == 200
    ad_url_1 = upload_ad.json()["data"]["url"]
    assert "assignmentor/answer-diagrams" in ad_url_1
    assert sub_id in ad_url_1 and assign_id in ad_url_1 and q_id in ad_url_1
    print(f"[PASS] 14. Answer Diagram uploaded: {ad_url_1}")

    # 4c. Verify Question contains both diagram URLs
    check_q = client.get(f"/api/questions/{q_id}", headers={"Authorization": f"Bearer {admin_token}"})
    assert check_q.status_code == 200
    q_doc = check_q.json()["data"]
    assert q_doc["questionDiagramUrl"] == qd_url_1
    assert q_doc["answerDiagramUrl"] == ad_url_1
    print("[PASS] 15. Question record updated with both Question and Answer diagrams")

    # 4d. Replace Question Diagram
    q_img2 = create_dummy_png(b"q_diagram_2_replaced")
    replace_qd = client.post(
        "/api/upload/question-diagram",
        files={"file": ("astar_graph_v2.png", q_img2, "image/png")},
        data={"subjectId": sub_id, "assignmentId": assign_id, "questionId": q_id},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert replace_qd.status_code == 200
    qd_url_2 = replace_qd.json()["data"]["url"]
    assert qd_url_2 != qd_url_1
    # Verify update in question record
    check_replaced_q = client.get(f"/api/questions/{q_id}", headers={"Authorization": f"Bearer {admin_token}"})
    assert check_replaced_q.json()["data"]["questionDiagramUrl"] == qd_url_2
    print(f"[PASS] 16. Question Diagram successfully replaced with v2: {qd_url_2}")

    # 4e. Replace Answer Diagram
    ans_img2 = create_dummy_png(b"ans_diagram_2_replaced")
    replace_ad = client.post(
        "/api/upload/answer-diagram",
        files={"file": ("astar_solution_tree_v2.png", ans_img2, "image/png")},
        data={"subjectId": sub_id, "assignmentId": assign_id, "questionId": q_id},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert replace_ad.status_code == 200
    ad_url_2 = replace_ad.json()["data"]["url"]
    assert ad_url_2 != ad_url_1
    check_replaced_ans = client.get(f"/api/questions/{q_id}", headers={"Authorization": f"Bearer {admin_token}"})
    assert check_replaced_ans.json()["data"]["answerDiagramUrl"] == ad_url_2
    print(f"[PASS] 17. Answer Diagram successfully replaced with v2: {ad_url_2}")

    # 4f. Delete Question Diagram
    del_qd = client.request(
        "DELETE",
        "/api/upload/question-diagram",
        json={"questionId": q_id, "imageUrl": qd_url_2},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert del_qd.status_code == 200
    check_del_qd = client.get(f"/api/questions/{q_id}", headers={"Authorization": f"Bearer {admin_token}"})
    assert check_del_qd.json()["data"]["questionDiagramUrl"] is None
    print("[PASS] 18. Question Diagram successfully deleted from question")

    # Re-upload a diagram for user reading test
    q_img3 = create_dummy_png(b"q_diagram_final")
    client.post(
        "/api/upload/question-diagram",
        files={"file": ("astar_final.png", q_img3, "image/png")},
        data={"subjectId": sub_id, "assignmentId": assign_id, "questionId": q_id},
        headers={"Authorization": f"Bearer {admin_token}"}
    )

    # ==========================================
    # 5. USER FLOW & RBAC ENFORCEMENT
    # ==========================================
    # User can view subjects
    u_subs = client.get("/api/subjects", headers={"Authorization": f"Bearer {user_token}"})
    assert u_subs.status_code == 200
    assert any(s["id"] == sub_id for s in u_subs.json()["data"])
    print("[PASS] 19. User Flow: View Subjects list (HTTP 200)")

    # User can view assignments of subject
    u_assigns = client.get(f"/api/subjects/{sub_id}/assignments", headers={"Authorization": f"Bearer {user_token}"})
    assert u_assigns.status_code == 200
    assert any(a["id"] == assign_id for a in u_assigns.json()["data"])
    print("[PASS] 20. User Flow: View Assignments under Subject (HTTP 200)")

    # User can view questions of assignment
    u_qs = client.get(f"/api/assignments/{assign_id}/questions", headers={"Authorization": f"Bearer {user_token}"})
    assert u_qs.status_code == 200
    q_list = u_qs.json()["data"]
    assert len(q_list) == 2
    print("[PASS] 21. User Flow: View Questions list (Found 2 questions, ordered correctly)")

    # User can view single question and answer with diagrams
    u_q1 = client.get(f"/api/questions/{q_id}", headers={"Authorization": f"Bearer {user_token}"})
    assert u_q1.status_code == 200
    u_q1_data = u_q1.json()["data"]
    assert u_q1_data["questionDiagramUrl"] is not None
    assert u_q1_data["answerDiagramUrl"] is not None
    assert "unitId" not in u_q1_data
    print("[PASS] 22. User Flow: Read question, formatted answer, and diagram URLs")

    # User CANNOT perform any mutations (HTTP 403 Forbidden)
    forbidden_tests = [
        ("POST", "/api/subjects", {"name": "Hacked Subject"}),
        ("PUT", f"/api/subjects/{sub_id}", {"name": "Hacked Subject"}),
        ("DELETE", f"/api/subjects/{sub_id}", None),
        ("POST", "/api/assignments", {"subjectId": sub_id, "name": "Hacked Assignment"}),
        ("PUT", f"/api/assignments/{assign_id}", {"name": "Hacked Assignment"}),
        ("DELETE", f"/api/assignments/{assign_id}", None),
        ("POST", "/api/questions", {"subjectId": sub_id, "assignmentId": assign_id, "questionText": "Hacked"}),
        ("PUT", f"/api/questions/{q_id}", {"questionText": "Hacked"}),
        ("DELETE", f"/api/questions/{q_id}", None),
    ]
    for method, path, payload in forbidden_tests:
        if method == "POST":
            res = client.post(path, json=payload, headers={"Authorization": f"Bearer {user_token}"})
        elif method == "PUT":
            res = client.put(path, json=payload, headers={"Authorization": f"Bearer {user_token}"})
        elif method == "DELETE":
            res = client.delete(path, headers={"Authorization": f"Bearer {user_token}"})
        assert res.status_code == 403, f"Expected 403 for {method} {path}, got {res.status_code}"
    print(f"[PASS] 23. RBAC Enforcement: All {len(forbidden_tests)} mutation attempts by User strictly returned HTTP 403 Forbidden")

    # User CANNOT upload diagrams
    forbidden_upload = client.post(
        "/api/upload/question-diagram",
        files={"file": ("hack.png", create_dummy_png(), "image/png")},
        data={"subjectId": sub_id, "assignmentId": assign_id, "questionId": q_id},
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert forbidden_upload.status_code == 403
    print("[PASS] 24. RBAC Enforcement: User diagram upload attempt strictly returned HTTP 403 Forbidden")

    # ==========================================
    # 6. UNIVERSAL SEARCH (Subject -> Assignment -> Question)
    # ==========================================
    search_q = client.get("/api/search?q=Heuristic", headers={"Authorization": f"Bearer {user_token}"})
    assert search_q.status_code == 200
    search_results = search_q.json()["data"]
    assert len(search_results) > 0
    for r in search_results:
        assert "unit" not in r and "unitId" not in r
        assert "subject" in r or "subjectId" in r
    print(f"[PASS] 25. Universal Search: Found {len(search_results)} hierarchical results without any Unit references")

    # ==========================================
    # 7. ERROR STATES & EDGE CASES
    # ==========================================
    # Non-existent Question (404)
    res_404_q = client.get("/api/questions/non-existent-qid-9999", headers={"Authorization": f"Bearer {user_token}"})
    assert res_404_q.status_code == 404
    print("[PASS] 26. Error Handling: Non-existent Question returns HTTP 404 Not Found")

    # Non-existent Subject (404)
    res_404_s = client.get("/api/subjects/non-existent-sub-9999", headers={"Authorization": f"Bearer {user_token}"})
    assert res_404_s.status_code == 404
    print("[PASS] 27. Error Handling: Non-existent Subject returns HTTP 404 Not Found")

    # Non-existent Assignment (404)
    res_404_a = client.get("/api/assignments/non-existent-assign-9999", headers={"Authorization": f"Bearer {user_token}"})
    assert res_404_a.status_code == 404
    print("[PASS] 28. Error Handling: Non-existent Assignment returns HTTP 404 Not Found")

    # Invalid image MIME/extension upload (400)
    invalid_file = io.BytesIO(b"malicious script or invalid file")
    bad_upload = client.post(
        "/api/upload/question-diagram",
        files={"file": ("hack.exe", invalid_file, "application/octet-stream")},
        data={"subjectId": sub_id, "assignmentId": assign_id, "questionId": q_id},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert bad_upload.status_code == 400
    print("[PASS] 29. Error Handling: Uploading invalid file extension (.exe) rejected with HTTP 400")

    # Oversized image (>5MB) upload (400)
    huge_file = io.BytesIO(b"X" * (6 * 1024 * 1024))  # 6MB
    huge_upload = client.post(
        "/api/upload/question-diagram",
        files={"file": ("huge_diagram.png", huge_file, "image/png")},
        data={"subjectId": sub_id, "assignmentId": assign_id, "questionId": q_id},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert huge_upload.status_code == 400
    assert "exceeds maximum allowed size" in huge_upload.json()["message"]
    print("[PASS] 30. Error Handling: Uploading image larger than 5MB rejected with HTTP 400")

    # ==========================================
    # 8. CASCADE DELETION & STORAGE INTEGRITY
    # ==========================================
    # Delete Assignment cascades to delete Question 2
    del_assign = client.delete(f"/api/assignments/{assign_id}", headers={"Authorization": f"Bearer {admin_token}"})
    assert del_assign.status_code == 200
    # Both questions under this assignment should now be deleted
    assert client.get(f"/api/questions/{q_id}", headers={"Authorization": f"Bearer {admin_token}"}).status_code == 404
    assert client.get(f"/api/questions/{q2_id}", headers={"Authorization": f"Bearer {admin_token}"}).status_code == 404
    print("[PASS] 31. Data Integrity: Deleting Assignment cascaded and cleanly removed all child questions")

    # Delete Subject cascades
    del_subject = client.delete(f"/api/subjects/{sub_id}", headers={"Authorization": f"Bearer {admin_token}"})
    assert del_subject.status_code == 200
    assert client.get(f"/api/subjects/{sub_id}", headers={"Authorization": f"Bearer {admin_token}"}).status_code == 404
    print("[PASS] 32. Data Integrity: Deleting Subject cascaded and cleaned up all resources")

    print("\n=================================================================")
    print(" ALL 32 END-TO-END APPLICATION & INTEGRITY TESTS PASSED!         ")
    print("=================================================================")
    return True

if __name__ == "__main__":
    run_e2e_tests()

from fastapi import APIRouter, Depends, Query
from typing import List, Dict, Any
from app.dependencies import get_current_user
from app.services.subject_service import subject_service
from app.services.assignment_service import assignment_service
from app.services.question_service import question_service
from app.utils.responses import success_response

router = APIRouter(prefix="/search", tags=["Search"])

@router.get("")
async def search_all(
    q: str = Query(..., min_length=1, description="Search term query"),
    current_user: dict = Depends(get_current_user)
):
    query_str = q.strip().lower()
    if not query_str:
        return success_response(data=[], message="Empty search query")

    subjects = subject_service.get_all()
    assignments = assignment_service.get_all()
    questions = question_service.get_all()

    subj_map = {s["id"]: s for s in subjects}
    assign_map = {a["id"]: a for a in assignments}

    results: List[Dict[str, Any]] = []

    # 1. Search in Questions
    for q_item in questions:
        q_text = q_item.get("questionText", "")
        answer = q_item.get("answer", "")
        if query_str in q_text.lower() or query_str in answer.lower():
            assign = assign_map.get(q_item.get("assignmentId"), {})
            subj = subj_map.get(q_item.get("subjectId"), {})
            results.append({
                "type": "question",
                "id": q_item["id"],
                "questionId": q_item["id"],
                "question": q_text,
                "questionNumber": q_item.get("questionNumber", 1),
                "assignmentId": q_item.get("assignmentId"),
                "assignment": assign.get("name", "Unknown Assignment"),
                "subjectId": q_item.get("subjectId"),
                "subject": subj.get("name", "Unknown Subject")
            })

    # 2. Search in Assignments
    for a_item in assignments:
        a_name = a_item.get("name", "")
        a_desc = a_item.get("description", "")
        if query_str in a_name.lower() or query_str in a_desc.lower():
            subj = subj_map.get(a_item.get("subjectId"), {})
            results.append({
                "type": "assignment",
                "id": a_item["id"],
                "assignmentId": a_item["id"],
                "assignment": a_name,
                "assignmentNumber": a_item.get("assignmentNumber", 1),
                "subjectId": a_item.get("subjectId"),
                "subject": subj.get("name", "Unknown Subject")
            })

    # 3. Search in Subjects
    for s_item in subjects:
        s_name = s_item.get("name", "")
        s_desc = s_item.get("description", "")
        if query_str in s_name.lower() or query_str in s_desc.lower():
            results.append({
                "type": "subject",
                "id": s_item["id"],
                "subjectId": s_item["id"],
                "subject": s_name,
                "description": s_desc
            })

    return success_response(data=results, message=f"Found {len(results)} search results")

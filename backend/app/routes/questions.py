from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional
from app.schemas.question import QuestionCreate, QuestionUpdate
from app.services.question_service import question_service
from app.dependencies import get_current_user, require_admin
from app.utils.responses import success_response

router = APIRouter(prefix="/questions", tags=["Questions"])

@router.get("")
async def get_questions(
    assignmentId: Optional[str] = Query(None, description="Filter questions by assignment ID"),
    subjectId: Optional[str] = Query(None, description="Filter questions by subject ID"),
    current_user: dict = Depends(get_current_user)
):
    data = question_service.get_all(
        assignment_id=assignmentId,
        subject_id=subjectId
    )
    return success_response(data=data, message="Questions retrieved successfully")

@router.get("/{question_id}")
async def get_question(question_id: str, current_user: dict = Depends(get_current_user)):
    data = question_service.get_by_id(question_id)
    if not data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
    return success_response(data=data, message="Question retrieved successfully")

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_question(data: QuestionCreate, admin_user: dict = Depends(require_admin)):
    created = question_service.create(data)
    return success_response(data=created, message="Question created successfully")

@router.put("/{question_id}")
async def update_question(question_id: str, data: QuestionUpdate, admin_user: dict = Depends(require_admin)):
    updated = question_service.update(question_id, data)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
    return success_response(data=updated, message="Question updated successfully")

@router.delete("/{question_id}")
async def delete_question(question_id: str, admin_user: dict = Depends(require_admin)):
    deleted = question_service.delete(question_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
    return success_response(data={"id": question_id}, message="Question deleted successfully")

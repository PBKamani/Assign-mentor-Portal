from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional
from app.schemas.assignment import AssignmentCreate, AssignmentUpdate
from app.services.assignment_service import assignment_service
from app.services.question_service import question_service
from app.dependencies import get_current_user, require_admin
from app.utils.responses import success_response

router = APIRouter(prefix="/assignments", tags=["Assignments"])

@router.get("")
async def get_assignments(
    subjectId: Optional[str] = Query(None, description="Filter assignments by subject ID"),
    current_user: dict = Depends(get_current_user)
):
    data = assignment_service.get_all(subject_id=subjectId)
    return success_response(data=data, message="Assignments retrieved successfully")

@router.get("/{assignment_id}")
async def get_assignment(assignment_id: str, current_user: dict = Depends(get_current_user)):
    data = assignment_service.get_by_id(assignment_id)
    if not data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")
    return success_response(data=data, message="Assignment retrieved successfully")

@router.get("/{assignment_id}/questions")
async def get_assignment_questions(assignment_id: str, current_user: dict = Depends(get_current_user)):
    assign = assignment_service.get_by_id(assignment_id)
    if not assign:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")
    data = question_service.get_all(assignment_id=assignment_id)
    return success_response(data=data, message="Questions for assignment retrieved successfully")

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_assignment(data: AssignmentCreate, admin_user: dict = Depends(require_admin)):
    created = assignment_service.create(data)
    return success_response(data=created, message="Assignment created successfully")

@router.put("/{assignment_id}")
async def update_assignment(assignment_id: str, data: AssignmentUpdate, admin_user: dict = Depends(require_admin)):
    updated = assignment_service.update(assignment_id, data)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")
    return success_response(data=updated, message="Assignment updated successfully")

@router.delete("/{assignment_id}")
async def delete_assignment(assignment_id: str, admin_user: dict = Depends(require_admin)):
    deleted = assignment_service.delete(assignment_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")
    return success_response(data={"id": assignment_id}, message="Assignment and questions deleted successfully")

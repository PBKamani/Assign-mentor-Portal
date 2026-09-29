from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.subject import SubjectCreate, SubjectUpdate
from app.services.subject_service import subject_service
from app.services.assignment_service import assignment_service
from app.dependencies import get_current_user, require_admin
from app.utils.responses import success_response

router = APIRouter(prefix="/subjects", tags=["Subjects"])

@router.get("")
async def get_subjects(current_user: dict = Depends(get_current_user)):
    data = subject_service.get_all()
    return success_response(data=data, message="Subjects retrieved successfully")

@router.get("/{subject_id}")
async def get_subject(subject_id: str, current_user: dict = Depends(get_current_user)):
    data = subject_service.get_by_id(subject_id)
    if not data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found")
    return success_response(data=data, message="Subject retrieved successfully")

@router.get("/{subject_id}/assignments")
async def get_subject_assignments(subject_id: str, current_user: dict = Depends(get_current_user)):
    subj = subject_service.get_by_id(subject_id)
    if not subj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found")
    assignments = assignment_service.get_all(subject_id=subject_id)
    return success_response(data=assignments, message="Assignments for subject retrieved successfully")

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_subject(data: SubjectCreate, admin_user: dict = Depends(require_admin)):
    created = subject_service.create(data)
    return success_response(data=created, message="Subject created successfully")

@router.put("/{subject_id}")
async def update_subject(subject_id: str, data: SubjectUpdate, admin_user: dict = Depends(require_admin)):
    updated = subject_service.update(subject_id, data)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found")
    return success_response(data=updated, message="Subject updated successfully")

@router.delete("/{subject_id}")
async def delete_subject(subject_id: str, admin_user: dict = Depends(require_admin)):
    deleted = subject_service.delete(subject_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found")
    return success_response(data={"id": subject_id}, message="Subject and child content deleted successfully")

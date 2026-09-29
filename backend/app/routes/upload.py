import os
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.responses import FileResponse
from typing import Optional
from pydantic import BaseModel
from app.services.storage_service import storage_service
from app.services.question_service import question_service
from app.dependencies import require_admin
from app.utils.responses import success_response, error_response

router = APIRouter(prefix="/upload", tags=["Uploads"])

class DeleteDiagramRequest(BaseModel):
    questionId: str
    imageUrl: Optional[str] = None

@router.post("/question-diagram")
async def upload_question_diagram(
    file: UploadFile = File(...),
    subjectId: str = Form(...),
    assignmentId: str = Form(...),
    questionId: str = Form(...),
    admin_user: dict = Depends(require_admin)
):
    url = await storage_service.upload_diagram(
        file=file,
        diagram_type="question-diagrams",
        subject_id=subjectId,
        assignment_id=assignmentId,
        question_id=questionId
    )

    question = question_service.get_by_id(questionId)
    if question:
        from app.schemas.question import QuestionUpdate
        question_service.update(questionId, QuestionUpdate(questionDiagramUrl=url))

    return success_response(
        data={"url": url, "questionId": questionId},
        message="Question diagram uploaded successfully"
    )

@router.delete("/question-diagram")
async def delete_question_diagram(
    payload: DeleteDiagramRequest,
    admin_user: dict = Depends(require_admin)
):
    question = question_service.get_by_id(payload.questionId)
    image_url = payload.imageUrl or (question.get("questionDiagramUrl") if question else None)

    if image_url:
        storage_service.delete_by_url(image_url)

    if question:
        from app.schemas.question import QuestionUpdate
        question_service.update(payload.questionId, QuestionUpdate(questionDiagramUrl=None))

    return success_response(message="Question diagram deleted successfully")

@router.post("/answer-diagram")
async def upload_answer_diagram(
    file: UploadFile = File(...),
    subjectId: str = Form(...),
    assignmentId: str = Form(...),
    questionId: str = Form(...),
    admin_user: dict = Depends(require_admin)
):
    url = await storage_service.upload_diagram(
        file=file,
        diagram_type="answer-diagrams",
        subject_id=subjectId,
        assignment_id=assignmentId,
        question_id=questionId
    )

    question = question_service.get_by_id(questionId)
    if question:
        from app.schemas.question import QuestionUpdate
        question_service.update(questionId, QuestionUpdate(answerDiagramUrl=url))

    return success_response(
        data={"url": url, "questionId": questionId},
        message="Answer diagram uploaded successfully"
    )

@router.delete("/answer-diagram")
async def delete_answer_diagram(
    payload: DeleteDiagramRequest,
    admin_user: dict = Depends(require_admin)
):
    question = question_service.get_by_id(payload.questionId)
    image_url = payload.imageUrl or (question.get("answerDiagramUrl") if question else None)

    if image_url:
        storage_service.delete_by_url(image_url)

    if question:
        from app.schemas.question import QuestionUpdate
        question_service.update(payload.questionId, QuestionUpdate(answerDiagramUrl=None))

    return success_response(message="Answer diagram deleted successfully")

@router.get("/static/{file_path:path}")
async def serve_mock_static(file_path: str):
    base_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
    full_path = os.path.join(base_dir, file_path.replace("/", os.sep))
    if not os.path.exists(full_path):
        raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(full_path)

import datetime
import uuid
from typing import List, Optional, Dict, Any
from app.firebase import get_db
from app.schemas.question import QuestionCreate, QuestionUpdate
from app.services.storage_service import storage_service

class QuestionService:
    @staticmethod
    def get_all(
        assignment_id: Optional[str] = None,
        subject_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        db = get_db()
        col = db.collection("questions")
        if assignment_id:
            docs = col.where("assignmentId", "==", assignment_id).stream()
        elif subject_id:
            docs = col.where("subjectId", "==", subject_id).stream()
        else:
            docs = col.stream()

        results = []
        for doc in docs:
            data = doc.to_dict()
            data["id"] = doc.id
            results.append(data)

        results.sort(key=lambda x: (x.get("questionNumber", 1), x.get("order", 1)))
        return results

    @staticmethod
    def get_by_id(question_id: str) -> Optional[Dict[str, Any]]:
        db = get_db()
        doc = db.collection("questions").document(question_id).get()
        if not doc.exists:
            return None
        data = doc.to_dict()
        data["id"] = doc.id
        return data

    @staticmethod
    def create(data: QuestionCreate) -> Dict[str, Any]:
        db = get_db()
        doc_id = str(uuid.uuid4())
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        payload = data.model_dump()
        payload["createdAt"] = now
        payload["updatedAt"] = now

        db.collection("questions").document(doc_id).set(payload)
        payload["id"] = doc_id
        return payload

    @staticmethod
    def update(question_id: str, data: QuestionUpdate) -> Optional[Dict[str, Any]]:
        db = get_db()
        doc_ref = db.collection("questions").document(question_id)
        existing_doc = doc_ref.get()
        if not existing_doc.exists:
            return None

        existing_data = existing_doc.to_dict()
        update_payload = {k: v for k, v in data.model_dump().items() if v is not None}
        update_payload["updatedAt"] = datetime.datetime.now(datetime.timezone.utc).isoformat()

        # Clean up old diagrams if replaced
        if "questionDiagramUrl" in update_payload:
            old_url = existing_data.get("questionDiagramUrl")
            new_url = update_payload.get("questionDiagramUrl")
            if old_url and old_url != new_url:
                storage_service.delete_by_url(old_url)

        if "answerDiagramUrl" in update_payload:
            old_url = existing_data.get("answerDiagramUrl")
            new_url = update_payload.get("answerDiagramUrl")
            if old_url and old_url != new_url:
                storage_service.delete_by_url(old_url)

        doc_ref.update(update_payload)
        updated = doc_ref.get().to_dict()
        updated["id"] = question_id
        return updated

    @staticmethod
    def delete(question_id: str) -> bool:
        db = get_db()
        doc_ref = db.collection("questions").document(question_id)
        existing = doc_ref.get()
        if not existing.exists:
            return False

        data = existing.to_dict()
        if data.get("questionDiagramUrl"):
            storage_service.delete_by_url(data.get("questionDiagramUrl"))
        if data.get("answerDiagramUrl"):
            storage_service.delete_by_url(data.get("answerDiagramUrl"))

        doc_ref.delete()
        return True

question_service = QuestionService()

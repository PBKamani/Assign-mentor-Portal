import datetime
import uuid
from typing import List, Optional, Dict, Any
from app.firebase import get_db
from app.schemas.assignment import AssignmentCreate, AssignmentUpdate

class AssignmentService:
    @staticmethod
    def get_all(subject_id: Optional[str] = None) -> List[Dict[str, Any]]:
        db = get_db()
        col = db.collection("assignments")
        if subject_id:
            docs = col.where("subjectId", "==", subject_id).stream()
        else:
            docs = col.stream()

        results = []
        for doc in docs:
            data = doc.to_dict()
            data["id"] = doc.id
            results.append(data)

        results.sort(key=lambda x: (x.get("assignmentNumber", 1), x.get("order", 1)))
        return results

    @staticmethod
    def get_by_id(assignment_id: str) -> Optional[Dict[str, Any]]:
        db = get_db()
        doc = db.collection("assignments").document(assignment_id).get()
        if not doc.exists:
            return None
        data = doc.to_dict()
        data["id"] = doc.id
        return data

    @staticmethod
    def create(data: AssignmentCreate) -> Dict[str, Any]:
        db = get_db()
        doc_id = str(uuid.uuid4())
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        payload = data.model_dump()
        payload["createdAt"] = now
        payload["updatedAt"] = now

        db.collection("assignments").document(doc_id).set(payload)
        payload["id"] = doc_id
        return payload

    @staticmethod
    def update(assignment_id: str, data: AssignmentUpdate) -> Optional[Dict[str, Any]]:
        db = get_db()
        doc_ref = db.collection("assignments").document(assignment_id)
        existing = doc_ref.get()
        if not existing.exists:
            return None

        update_payload = {k: v for k, v in data.model_dump().items() if v is not None}
        update_payload["updatedAt"] = datetime.datetime.now(datetime.timezone.utc).isoformat()

        doc_ref.update(update_payload)
        updated = doc_ref.get().to_dict()
        updated["id"] = assignment_id
        return updated

    @staticmethod
    def delete(assignment_id: str) -> bool:
        db = get_db()
        doc_ref = db.collection("assignments").document(assignment_id)
        if not doc_ref.get().exists:
            return False

        # Cascade delete child questions
        questions = db.collection("questions").where("assignmentId", "==", assignment_id).stream()
        for q in questions:
            db.collection("questions").document(q.id).delete()

        doc_ref.delete()
        return True

assignment_service = AssignmentService()

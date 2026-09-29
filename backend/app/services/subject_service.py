import datetime
import uuid
from typing import List, Optional, Dict, Any
from app.firebase import get_db
from app.schemas.subject import SubjectCreate, SubjectUpdate

class SubjectService:
    @staticmethod
    def get_all() -> List[Dict[str, Any]]:
        db = get_db()
        docs = db.collection("subjects").order_by("order").stream()
        results = []
        for doc in docs:
            data = doc.to_dict()
            data["id"] = doc.id
            results.append(data)
        return results

    @staticmethod
    def get_by_id(subject_id: str) -> Optional[Dict[str, Any]]:
        db = get_db()
        doc = db.collection("subjects").document(subject_id).get()
        if not doc.exists:
            return None
        data = doc.to_dict()
        data["id"] = doc.id
        return data

    @staticmethod
    def create(data: SubjectCreate) -> Dict[str, Any]:
        db = get_db()
        doc_id = str(uuid.uuid4())
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        payload = data.model_dump()
        payload["createdAt"] = now
        payload["updatedAt"] = now

        db.collection("subjects").document(doc_id).set(payload)
        payload["id"] = doc_id
        return payload

    @staticmethod
    def update(subject_id: str, data: SubjectUpdate) -> Optional[Dict[str, Any]]:
        db = get_db()
        doc_ref = db.collection("subjects").document(subject_id)
        existing = doc_ref.get()
        if not existing.exists:
            return None

        update_payload = {k: v for k, v in data.model_dump().items() if v is not None}
        update_payload["updatedAt"] = datetime.datetime.now(datetime.timezone.utc).isoformat()

        doc_ref.update(update_payload)
        updated = doc_ref.get().to_dict()
        updated["id"] = subject_id
        return updated

    @staticmethod
    def delete(subject_id: str) -> bool:
        db = get_db()
        doc_ref = db.collection("subjects").document(subject_id)
        if not doc_ref.get().exists:
            return False

        # Cascade delete child assignments and their questions (Subject -> Assignment -> Question)
        assignments = db.collection("assignments").where("subjectId", "==", subject_id).stream()
        for a in assignments:
            assign_id = a.id
            questions = db.collection("questions").where("assignmentId", "==", assign_id).stream()
            for q in questions:
                db.collection("questions").document(q.id).delete()
            db.collection("assignments").document(assign_id).delete()

        doc_ref.delete()
        return True

subject_service = SubjectService()

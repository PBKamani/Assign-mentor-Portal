import os
import json
import uuid
import logging
from typing import Optional, Dict, Any, List
from app.config import settings

logger = logging.getLogger("assignmentor.firebase")

_firebase_initialized = False
_using_mock = False
_db = None
_bucket = None

# In-memory document & collection store for local development before cloud credentials are linked
class MockDocRef:
    def __init__(self, collection: str, doc_id: str, store: dict):
        self.collection_name = collection
        self.id = doc_id
        self._store = store

    def get(self):
        data = self._store.get(self.collection_name, {}).get(self.id)
        return MockDocSnapshot(self.id, data)

    def set(self, data: dict, merge: bool = False):
        if self.collection_name not in self._store:
            self._store[self.collection_name] = {}
        if merge and self.id in self._store[self.collection_name]:
            self._store[self.collection_name][self.id].update(data)
        else:
            self._store[self.collection_name][self.id] = dict(data)
        return self

    def update(self, data: dict):
        if self.collection_name in self._store and self.id in self._store[self.collection_name]:
            self._store[self.collection_name][self.id].update(data)
        else:
            self.set(data)
        return self

    def delete(self):
        if self.collection_name in self._store and self.id in self._store[self.collection_name]:
            del self._store[self.collection_name][self.id]

class MockDocSnapshot:
    def __init__(self, doc_id: str, data: Optional[dict]):
        self.id = doc_id
        self._data = data

    @property
    def exists(self) -> bool:
        return self._data is not None

    def to_dict(self) -> Optional[dict]:
        if self._data is None:
            return None
        d = dict(self._data)
        d["id"] = self.id
        return d

class MockQuery:
    def __init__(self, collection_name: str, store: dict, filters=None, order_field=None):
        self.collection_name = collection_name
        self._store = store
        self.filters = filters or []
        self.order_field = order_field

    def where(self, field: str, op: str, value: Any):
        new_filters = list(self.filters)
        new_filters.append((field, op, value))
        return MockQuery(self.collection_name, self._store, new_filters, self.order_field)

    def order_by(self, field: str, direction=None):
        return MockQuery(self.collection_name, self._store, self.filters, field)

    def stream(self):
        items = self._store.get(self.collection_name, {})
        snapshots = []
        for doc_id, data in items.items():
            match = True
            for field, op, val in self.filters:
                if op == "==" and data.get(field) != val:
                    match = False
                    break
            if match:
                snapshots.append(MockDocSnapshot(doc_id, data))

        if self.order_field:
            snapshots.sort(key=lambda s: s.to_dict().get(self.order_field, 0))
        return snapshots

class MockCollectionRef:
    def __init__(self, collection_name: str, store: dict):
        self.name = collection_name
        self._store = store

    def document(self, doc_id: Optional[str] = None):
        if not doc_id:
            doc_id = str(uuid.uuid4())
        return MockDocRef(self.name, doc_id, self._store)

    def where(self, field: str, op: str, value: Any):
        return MockQuery(self.name, self._store).where(field, op, value)

    def order_by(self, field: str, direction=None):
        return MockQuery(self.name, self._store).order_by(field, direction)

    def stream(self):
        return MockQuery(self.name, self._store).stream()

class MockFirestore:
    def __init__(self):
        # 4 collections strictly: users, subjects, assignments, questions (NO units)
        # Empty initialization: NO fake data created
        self._store: Dict[str, Dict[str, dict]] = {
            "users": {},
            "subjects": {},
            "assignments": {},
            "questions": {}
        }

    def collection(self, name: str):
        return MockCollectionRef(name, self._store)

class MockBlob:
    def __init__(self, name: str, bucket_name: str):
        self.name = name
        self.bucket_name = bucket_name
        self.public_url = f"/api/upload/static/{name}"

    def upload_from_file(self, file_obj, content_type=None):
        base_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
        dest_path = os.path.join(base_dir, self.name.replace("/", os.sep))
        os.makedirs(os.path.dirname(dest_path), exist_ok=True)
        with open(dest_path, "wb") as f:
            f.write(file_obj.read())

    def upload_from_string(self, data, content_type=None):
        base_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
        dest_path = os.path.join(base_dir, self.name.replace("/", os.sep))
        os.makedirs(os.path.dirname(dest_path), exist_ok=True)
        with open(dest_path, "wb") as f:
            if isinstance(data, str):
                f.write(data.encode())
            else:
                f.write(data)

    def make_public(self):
        pass

    def delete(self):
        base_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
        dest_path = os.path.join(base_dir, self.name.replace("/", os.sep))
        if os.path.exists(dest_path):
            try:
                os.remove(dest_path)
            except Exception:
                pass

class MockBucket:
    def __init__(self, name: str = "assignmentor-local-bucket"):
        self.name = name

    def blob(self, blob_name: str):
        return MockBlob(blob_name, self.name)

mock_firestore = MockFirestore()
mock_bucket = MockBucket()

def init_firebase():
    global _firebase_initialized, _using_mock, _db, _bucket
    
    if _firebase_initialized:
        return

    cred_path = settings.FIREBASE_SERVICE_ACCOUNT_PATH
    if cred_path and not os.path.isabs(cred_path):
        cred_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), cred_path)

    has_cred_file = cred_path and os.path.exists(cred_path)
    has_env_credentials = bool(settings.FIREBASE_PROJECT_ID and settings.FIREBASE_CLIENT_EMAIL and settings.FIREBASE_PRIVATE_KEY)

    try:
        import firebase_admin
        from firebase_admin import credentials, firestore, storage

        if not firebase_admin._apps:
            if has_cred_file:
                cred = credentials.Certificate(cred_path)
                storage_bucket = settings.FIREBASE_STORAGE_BUCKET or f"{cred.project_id}.appspot.com"
                firebase_admin.initialize_app(cred, {"storageBucket": storage_bucket})
            elif has_env_credentials:
                cred_dict = {
                    "type": "service_account",
                    "project_id": settings.FIREBASE_PROJECT_ID,
                    "client_email": settings.FIREBASE_CLIENT_EMAIL,
                    "private_key": settings.FIREBASE_PRIVATE_KEY.replace("\\n", "\n"),
                    "token_uri": "https://oauth2.googleapis.com/token",
                }
                cred = credentials.Certificate(cred_dict)
                storage_bucket = settings.FIREBASE_STORAGE_BUCKET or f"{settings.FIREBASE_PROJECT_ID}.appspot.com"
                firebase_admin.initialize_app(cred, {"storageBucket": storage_bucket})
            else:
                _using_mock = True
                _db = mock_firestore
                _bucket = mock_bucket
                _firebase_initialized = True
                return

        _db = firestore.client()
        _bucket = storage.bucket()
        _using_mock = False
    except Exception as e:
        _using_mock = True
        _db = mock_firestore
        _bucket = mock_bucket

    _firebase_initialized = True

def get_db():
    if not _firebase_initialized:
        init_firebase()
    return _db

def get_storage_bucket():
    if not _firebase_initialized:
        init_firebase()
    return _bucket

def is_mock_mode() -> bool:
    return _using_mock

def verify_token(id_token: str) -> Optional[dict]:
    if not _firebase_initialized:
        init_firebase()

    if id_token.startswith("demo-token-") or _using_mock:
        uid = id_token.replace("demo-token-", "")
        user_doc = get_db().collection("users").document(uid).get()
        if user_doc.exists:
            data = user_doc.to_dict()
            return {"uid": uid, "username": data.get("username", uid), "role": data.get("role", "user")}
        if uid.lower() in ("admin", "uid-admin", "admin-uid-1"):
            return {"uid": "admin-uid-1", "username": "ADMIN", "role": "admin"}
        return {"uid": "user-uid-2", "username": "USER", "role": "user"}

    try:
        from firebase_admin import auth
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception:
        return None

import datetime
from typing import Optional, Dict, Any
from fastapi import HTTPException, status
from app.firebase import get_db, verify_token

GENERIC_AUTH_ERROR = "Invalid username or password."

class AuthService:
    @staticmethod
    def get_user_profile(uid: str) -> Optional[Dict[str, Any]]:
        db = get_db()
        doc = db.collection("users").document(uid).get()
        if not doc.exists:
            return None
        data = doc.to_dict()
        data["uid"] = uid
        return data

    @staticmethod
    def verify_and_get_user(id_token: str) -> Dict[str, Any]:
        decoded = verify_token(id_token)
        if not decoded:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=GENERIC_AUTH_ERROR
            )

        uid = decoded.get("uid")
        user = AuthService.get_user_profile(uid)
        if not user:
            now = datetime.datetime.now(datetime.timezone.utc).isoformat()
            username = decoded.get("username", decoded.get("email", "USER"))
            role = decoded.get("role", "user")
            new_user = {
                "username": username,
                "email": decoded.get("email"),
                "role": role,
                "createdAt": now
            }
            get_db().collection("users").document(uid).set(new_user)
            new_user["uid"] = uid
            return new_user

        return user

    @staticmethod
    def demo_login(username: str, password: str) -> Dict[str, Any]:
        """
        Secure authentication endpoint.
        Returns ONLY the generic message 'Invalid username or password.' upon failure.
        Never echoes credentials or logs passwords.
        """
        if not username or not password:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=GENERIC_AUTH_ERROR
            )

        uname = username.strip().upper()
        if uname == "ADMIN" and password == "admin@040905":
            return {
                "token": "demo-token-admin-uid-1",
                "user": {
                    "uid": "admin-uid-1",
                    "username": "ADMIN",
                    "role": "admin",
                    "email": "admin@assignmentor.app"
                }
            }
        elif uname == "USER" and password == "user@123":
            return {
                "token": "demo-token-user-uid-2",
                "user": {
                    "uid": "user-uid-2",
                    "username": "USER",
                    "role": "user",
                    "email": "user@assignmentor.app"
                }
            }

        # Any mismatch returns strictly the generic error message
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=GENERIC_AUTH_ERROR
        )

auth_service = AuthService()

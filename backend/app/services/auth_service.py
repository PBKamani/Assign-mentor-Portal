import json
import urllib.request
import urllib.error
import datetime
from typing import Optional, Dict, Any
from fastapi import HTTPException, status
from app.config import settings
from app.firebase import get_db, verify_token, is_mock_mode

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
            email = decoded.get("email", "")
            role = decoded.get("role")
            if not role:
                role = "admin" if (email and "admin" in email.lower()) else "user"
            username = decoded.get("username") or ("ADMIN" if role == "admin" else "USER")

            new_user = {
                "username": username,
                "email": email,
                "role": role,
                "createdAt": now
            }
            get_db().collection("users").document(uid).set(new_user)
            new_user["uid"] = uid
            return new_user

        return user

    @staticmethod
    def _firebase_sign_in_with_password(email: str, password: str) -> Optional[dict]:
        if not settings.FIREBASE_WEB_API_KEY:
            return None
        url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={settings.FIREBASE_WEB_API_KEY}"
        data = json.dumps({"email": email, "password": password, "returnSecureToken": True}).encode("utf-8")
        req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                if resp.status == 200:
                    return json.loads(resp.read().decode("utf-8"))
        except Exception:
            return None
        return None

    @classmethod
    def login(cls, username: str, password: str) -> Dict[str, Any]:
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

        uname = username.strip()

        # If live Firebase Auth Web API key is available and not in mock mode:
        if not is_mock_mode() and settings.FIREBASE_WEB_API_KEY:
            if uname.upper() == "ADMIN":
                email = "admin@assignmentor.app"
            elif uname.upper() == "USER":
                email = "user@assignmentor.app"
            else:
                email = uname

            auth_res = cls._firebase_sign_in_with_password(email, password)
            if auth_res and "idToken" in auth_res:
                id_token = auth_res["idToken"]
                uid = auth_res.get("localId")
                user = cls.get_user_profile(uid)
                if not user:
                    role = "admin" if (email.lower() == "admin@assignmentor.app" or "admin" in email.lower()) else "user"
                    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
                    user = {
                        "username": uname.upper() if uname.upper() in ("ADMIN", "USER") else email.split("@")[0],
                        "email": email,
                        "role": role,
                        "createdAt": now
                    }
                    get_db().collection("users").document(uid).set(user)
                    user["uid"] = uid
                return {"token": id_token, "user": user}
            else:
                # Strictly generic failure message
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail=GENERIC_AUTH_ERROR
                )

        # Fallback local credential check for development / mock mode
        if uname.upper() == "ADMIN" and password == "admin@040905":
            return {
                "token": "demo-token-admin-uid-1",
                "user": {
                    "uid": "admin-uid-1",
                    "username": "ADMIN",
                    "role": "admin",
                    "email": "admin@assignmentor.app"
                }
            }
        elif uname.upper() == "USER" and password == "user@123":
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

    # Alias for backward compatibility
    demo_login = login

auth_service = AuthService()


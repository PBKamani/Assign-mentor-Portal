from fastapi import Header, HTTPException, status, Depends
from typing import Optional
from app.firebase import verify_token, get_db

async def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing. Please provide a Bearer token."
        )

    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication scheme. Format must be 'Bearer <token>'."
        )

    decoded_token = verify_token(token)
    if not decoded_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token."
        )

    uid = decoded_token.get("uid")
    # Retrieve user from Firestore
    user_doc = get_db().collection("users").document(uid).get()
    if user_doc.exists:
        user_data = user_doc.to_dict()
        return {
            "uid": uid,
            "username": user_data.get("username", decoded_token.get("username", "USER")),
            "role": user_data.get("role", decoded_token.get("role", "user")),
            "email": user_data.get("email")
        }

    # Fallback from decoded token directly if user doc doesn't exist yet
    role = decoded_token.get("role", "user")
    username = decoded_token.get("username", "USER")
    return {
        "uid": uid,
        "username": username,
        "role": role,
        "email": decoded_token.get("email")
    }

async def require_admin(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Admin access required to perform this action."
        )
    return current_user

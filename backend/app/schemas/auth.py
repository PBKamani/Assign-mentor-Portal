from pydantic import BaseModel
from typing import Optional

class VerifyTokenRequest(BaseModel):
    id_token: str

class UserProfile(BaseModel):
    uid: str
    username: str
    email: Optional[str] = None
    role: str
    createdAt: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str

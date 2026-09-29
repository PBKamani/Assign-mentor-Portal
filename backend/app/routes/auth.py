from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.auth import VerifyTokenRequest, LoginRequest
from app.services.auth_service import auth_service
from app.dependencies import get_current_user
from app.utils.responses import success_response, error_response

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/verify")
async def verify_token_endpoint(request: VerifyTokenRequest):
    try:
        user = auth_service.verify_and_get_user(request.id_token)
        return success_response(data=user, message="Token verified successfully")
    except HTTPException as e:
        raise e
    except Exception as e:
        return error_response(message=f"Verification failed: {str(e)}")

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return success_response(data=current_user, message="Current user profile retrieved")

@router.post("/login")
async def login_endpoint(request: LoginRequest):
    """Convenient login endpoint for demo credentials specified in spec (ADMIN/USER)."""
    res = auth_service.demo_login(request.username, request.password)
    return success_response(data=res, message="Login successful")

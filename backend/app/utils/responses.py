from typing import Any, Optional
from pydantic import BaseModel

class ApiResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Any] = None

def success_response(data: Any = None, message: str = "Success") -> dict:
    return {
        "success": True,
        "message": message,
        "data": data
    }

def error_response(message: str = "An error occurred", data: Any = None) -> dict:
    return {
        "success": False,
        "message": message,
        "data": data
    }

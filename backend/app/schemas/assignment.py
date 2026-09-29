from pydantic import BaseModel, Field
from typing import Optional

class AssignmentBase(BaseModel):
    subjectId: str
    name: str = Field(..., min_length=1, max_length=150)
    assignmentNumber: int = Field(default=1, ge=1)
    description: Optional[str] = ""
    order: Optional[int] = 1

class AssignmentCreate(AssignmentBase):
    pass

class AssignmentUpdate(BaseModel):
    subjectId: Optional[str] = None
    name: Optional[str] = None
    assignmentNumber: Optional[int] = None
    description: Optional[str] = None
    order: Optional[int] = None

class AssignmentResponse(AssignmentBase):
    id: str
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None

from pydantic import BaseModel, Field
from typing import Optional

class SubjectBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=150)
    description: Optional[str] = ""
    order: Optional[int] = 1

class SubjectCreate(SubjectBase):
    pass

class SubjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    order: Optional[int] = None

class SubjectResponse(SubjectBase):
    id: str
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None

from pydantic import BaseModel, Field
from typing import Optional

class QuestionBase(BaseModel):
    subjectId: str
    assignmentId: str
    questionNumber: int = Field(default=1, ge=1)
    questionText: str = Field(..., min_length=1)
    answer: str = Field(default="")
    questionDiagramUrl: Optional[str] = None
    answerDiagramUrl: Optional[str] = None
    order: Optional[int] = 1

class QuestionCreate(QuestionBase):
    pass

class QuestionUpdate(BaseModel):
    subjectId: Optional[str] = None
    assignmentId: Optional[str] = None
    questionNumber: Optional[int] = None
    questionText: Optional[str] = None
    answer: Optional[str] = None
    questionDiagramUrl: Optional[str] = None
    answerDiagramUrl: Optional[str] = None
    order: Optional[int] = None

class QuestionResponse(QuestionBase):
    id: str
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None

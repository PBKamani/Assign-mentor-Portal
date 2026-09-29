from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from contextlib import asynccontextmanager

from app.config import settings
from app.firebase import init_firebase, is_mock_mode
from app.dependencies import get_current_user, require_admin
from app.services.subject_service import subject_service
from app.services.assignment_service import assignment_service
from app.services.question_service import question_service
from app.utils.responses import success_response, error_response

# Import routes (No units_router)
from app.routes.auth import router as auth_router
from app.routes.subjects import router as subjects_router
from app.routes.assignments import router as assignments_router
from app.routes.questions import router as questions_router
from app.routes.upload import router as upload_router
from app.routes.search import router as search_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[Startup] Initializing Assignmentor backend services...")
    init_firebase()
    yield
    print("[Shutdown] Assignmentor backend services stopping...")

app = FastAPI(
    title="Assignmentor API",
    description="High-performance backend API for academic assignment management.",
    version="1.0.0",
    lifespan=lifespan
)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://localhost:4173"
]

if settings.FRONTEND_URL and settings.FRONTEND_URL not in origins:
    origins.append(settings.FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.github\.io",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_prefix = "/api"
app.include_router(auth_router, prefix=api_prefix)
app.include_router(subjects_router, prefix=api_prefix)
app.include_router(assignments_router, prefix=api_prefix)
app.include_router(questions_router, prefix=api_prefix)
app.include_router(upload_router, prefix=api_prefix)
app.include_router(search_router, prefix=api_prefix)

@app.exception_handler(StarletteHTTPException)
async def custom_http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "message": exc.detail, "data": None}
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    error_msgs = [f"{err['loc'][-1]}: {err['msg']}" for err in exc.errors()]
    return JSONResponse(
        status_code=422,
        content={"success": False, "message": "; ".join(error_msgs), "data": None}
    )

@app.get("/")
async def root():
    return {
        "name": "Assignmentor API",
        "tagline": "Your Assignments. Organized. Simplified.",
        "status": "online",
        "version": "1.0.0",
        "hierarchy": "Subject -> Assignment -> Question -> Answer",
        "mode": "mock_development" if is_mock_mode() else "live_firebase",
        "docs_url": "/docs"
    }

@app.get("/api/health")
async def health_check():
    return success_response(
        data={"status": "healthy", "mode": "mock_development" if is_mock_mode() else "live_firebase"},
        message="Backend service is operational"
    )

@app.get("/api/stats")
async def get_dashboard_stats(admin_user: dict = Depends(require_admin)):
    """Admin dashboard summary metrics (Subjects, Assignments, Questions)."""
    subjects_count = len(subject_service.get_all())
    assignments_count = len(assignment_service.get_all())
    questions_count = len(question_service.get_all())

    return success_response(
        data={
            "subjects": subjects_count,
            "assignments": assignments_count,
            "questions": questions_count
        },
        message="Admin metrics loaded successfully"
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)

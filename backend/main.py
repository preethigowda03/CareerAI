from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database.mongodb import client

from auth import router as auth_router
from resume import router as resume_router
from analysis import router as analysis_router
from history import router as history_router
from profile import router as profile_router

from roadmap import router as roadmap_router
from chatbot import router as chatbot_router

from learning import router as learning_router
from interview import router as interview_router
from job import router as job_router
from progress import router as progress_router


app = FastAPI(
    title="CareerAI API",
    description="AI-Powered Career and Placement Assistant",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(resume_router)
app.include_router(analysis_router)
app.include_router(history_router)
app.include_router(profile_router)

app.include_router(roadmap_router)
app.include_router(chatbot_router)
app.include_router(learning_router)
app.include_router(interview_router)
app.include_router(job_router)
app.include_router(progress_router)


@app.get("/")
def root():
    return {
        "status": "success",
        "message": "CareerAI backend is running",
        "features": [
            "Authentication",
            "Resume Analysis",
            "Resume History",
            "Profile",
            "Career Roadmap",
            "AI Career Chatbot",
            "Learning Progress",
            "Interview Practice",
            "Job Readiness",
            "Overall Progress"
        ]
    }


@app.get("/health")
def health_check():
    try:
        client.admin.command("ping")

        return {
            "status": "healthy",
            "mongodb": "connected"
        }

    except Exception as e:
        return {
            "status": "unhealthy",
            "mongodb": "disconnected",
            "error": str(e)
        }
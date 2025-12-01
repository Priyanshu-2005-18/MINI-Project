from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Resume Screening Bot API",
    description="AI-powered resume screening and analysis system with NLP and voice assistance",
    version="1.0.0"
)

# Configure CORS
origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:8000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://192.168.1.12:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database tables
from app.database import engine, Base
from app.models import models  # Import models to register them
Base.metadata.create_all(bind=engine)

# Import routes
from app.routes import resume_routes, job_routes, analysis_routes, student_routes
from app.services import ats_screening

# Include routers
app.include_router(resume_routes.router, prefix="/api/resumes", tags=["Resumes"])
app.include_router(job_routes.router, prefix="/api/jobs", tags=["Jobs"])
app.include_router(analysis_routes.router, prefix="/api/analysis", tags=["Analysis"])
app.include_router(student_routes.router, prefix="/api/students", tags=["Student Tools"])
app.include_router(ats_screening.router, tags=["ATS Screening"])

@app.get("/")
async def root():
    return {
        "message": "Resume Screening Bot API",
        "version": "1.0.0",
        "endpoints": {
            "resumes": "/api/resumes",
            "jobs": "/api/jobs",
            "analysis": "/api/analysis",
            "voice": "/api/voice",
            "students": "/api/students"
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

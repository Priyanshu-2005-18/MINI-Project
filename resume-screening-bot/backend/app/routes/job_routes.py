from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import JobPosting
from app.schemas.schemas import JobPostingCreate, JobPosting as JobPostingSchema

router = APIRouter()

@router.post("/create")
async def create_job_posting(job_data: dict, db: Session = Depends(get_db)):
    """Create a new job posting"""
    try:
        user_id = job_data.get("user_id")
        if not user_id:
            raise HTTPException(status_code=400, detail="user_id required")
        
        db_job = JobPosting(
            user_id=user_id,
            title=job_data.get("title", "Untitled Position"),
            description=job_data.get("description", ""),
            required_skills=job_data.get("required_skills", []),
            nice_to_have_skills=job_data.get("nice_to_have_skills", []),
            experience_level=job_data.get("experience_level", "Not specified"),
            salary_range=job_data.get("salary_range", "")
        )
        db.add(db_job)
        db.commit()
        db.refresh(db_job)
        
        return {
            "id": db_job.id,
            "title": db_job.title,
            "description": db_job.description,
            "required_skills": db_job.required_skills,
            "created_at": db_job.created_at
        }
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{job_id}")
async def get_job(job_id: int, db: Session = Depends(get_db)):
    """Get job details"""
    job = db.query(JobPosting).filter(JobPosting.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job posting not found")
    
    return {
        "id": job.id,
        "title": job.title,
        "description": job.description,
        "required_skills": job.required_skills,
        "nice_to_have_skills": job.nice_to_have_skills,
        "experience_level": job.experience_level,
        "salary_range": job.salary_range,
        "created_at": job.created_at
    }

@router.get("/user/{user_id}/jobs")
async def get_user_jobs(user_id: int, db: Session = Depends(get_db)):
    """Get all job postings from a user"""
    jobs = db.query(JobPosting).filter(JobPosting.user_id == user_id).all()
    
    return [
        {
            "id": job.id,
            "title": job.title,
            "description": job.description,
            "created_at": job.created_at
        }
        for job in jobs
    ]

@router.put("/{job_id}")
async def update_job(job_id: int, job_update: JobPostingCreate, db: Session = Depends(get_db)):
    """Update a job posting"""
    job = db.query(JobPosting).filter(JobPosting.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job posting not found")
    
    job.title = job_update.title
    job.description = job_update.description
    job.required_skills = job_update.required_skills
    job.nice_to_have_skills = job_update.nice_to_have_skills
    job.experience_level = job_update.experience_level
    job.salary_range = job_update.salary_range
    
    db.commit()
    db.refresh(job)
    
    return {"message": "Job posting updated", "job": job}

@router.delete("/{job_id}")
async def delete_job(job_id: int, db: Session = Depends(get_db)):
    """Delete a job posting"""
    job = db.query(JobPosting).filter(JobPosting.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job posting not found")
    
    db.delete(job)
    db.commit()
    
    return {"message": "Job posting deleted"}

from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: str
    user_type: str  # "hr" or "student"

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Resume Schemas
class ResumeBase(BaseModel):
    filename: str

class ResumeCreate(ResumeBase):
    pass

class Resume(ResumeBase):
    id: int
    user_id: int
    file_path: str
    ats_score: float
    uploaded_at: datetime
    parsed_data: Optional[Dict[str, Any]]
    
    class Config:
        from_attributes = True

# Job Posting Schemas
class JobPostingBase(BaseModel):
    title: str
    description: str
    required_skills: List[str]
    nice_to_have_skills: Optional[List[str]] = []
    experience_level: str
    salary_range: Optional[str] = None

class JobPostingCreate(JobPostingBase):
    pass

class JobPosting(JobPostingBase):
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Analysis Schemas
class SkillAnalysis(BaseModel):
    skill: str
    proficiency: Optional[str] = None

class AnalysisResult(BaseModel):
    id: int
    resume_id: int
    job_id: Optional[int]
    overall_score: float
    skills_matched: List[SkillAnalysis]
    skills_missing: List[SkillAnalysis]
    extra_skills: List[SkillAnalysis]
    recommendations: List[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

class AnalyzeResumeJobRequest(BaseModel):
    resume_id: int
    job_id: int

class BulkAnalysisRequest(BaseModel):
    resume_ids: List[int]
    job_id: Optional[int] = None
    job_description: Optional[str] = None

class BulkAnalysisResponse(BaseModel):
    total_resumes: int
    results: List[AnalysisResult]
    average_score: float

# Student Schemas
class StudentCareerProfile(BaseModel):
    id: int
    user_id: int
    skills: List[str]
    education: Dict[str, Any]
    experience: List[Dict[str, Any]]
    ats_score: float
    skill_gaps: List[str]
    recommended_roles: List[str]
    recommended_companies: List[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class ResumeEvaluationRequest(BaseModel):
    resume_id: int
    job_title: Optional[str] = None
    content_type: str

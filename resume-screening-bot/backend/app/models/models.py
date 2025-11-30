from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    user_type = Column(String)  # "hr" or "student"
    created_at = Column(DateTime, default=datetime.utcnow)
    
    resumes = relationship("Resume", back_populates="user")
    jobs = relationship("JobPosting", back_populates="posted_by")
    analysis_results = relationship("AnalysisResult", back_populates="user")

class Resume(Base):
    __tablename__ = "resumes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    filename = Column(String)
    file_path = Column(String)
    raw_text = Column(Text)
    parsed_data = Column(JSON)  # Standardized resume structure
    ats_score = Column(Float, default=0.0)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="resumes")
    analysis_results = relationship("AnalysisResult", back_populates="resume")

class JobPosting(Base):
    __tablename__ = "job_postings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    description = Column(Text)
    required_skills = Column(JSON)
    nice_to_have_skills = Column(JSON)
    experience_level = Column(String)
    salary_range = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    posted_by = relationship("User", back_populates="jobs")
    analysis_results = relationship("AnalysisResult", back_populates="job")

class AnalysisResult(Base):
    __tablename__ = "analysis_results"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    resume_id = Column(Integer, ForeignKey("resumes.id"))
    job_id = Column(Integer, ForeignKey("job_postings.id"), nullable=True)
    overall_score = Column(Float)
    skills_matched = Column(JSON)
    skills_missing = Column(JSON)
    extra_skills = Column(JSON)
    recommendations = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="analysis_results")
    resume = relationship("Resume", back_populates="analysis_results")
    job = relationship("JobPosting", back_populates="analysis_results")

class StudentCareerProfile(Base):
    __tablename__ = "student_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    resume_id = Column(Integer, ForeignKey("resumes.id"))
    skills = Column(JSON)
    education = Column(JSON)
    experience = Column(JSON)
    ats_score = Column(Float)
    skill_gaps = Column(JSON)
    recommended_roles = Column(JSON)
    recommended_companies = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

from fastapi import APIRouter, HTTPException, Depends, Body
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Resume, StudentCareerProfile
from app.services.text_processor import TextPreprocessor
from app.utils.scoring import ATSScorer, ResumeRecommender
from app.utils.career_recommender import CareerRecommender
from app.services.nlp_analyzer import NLPAnalyzer
from pydantic import BaseModel
from typing import Optional

router = APIRouter()
ats_scorer = ATSScorer()
career_recommender = CareerRecommender()
nlp_analyzer = NLPAnalyzer()

class EvaluateResumeRequest(BaseModel):
    resume_id: int
    user_id: int

class CareerFitRequest(BaseModel):
    resume_id: int
    user_id: int

class SkillGapRequest(BaseModel):
    resume_id: int
    target_role: str

class CareerPathRequest(BaseModel):
    resume_id: int
    user_id: int

@router.post("/evaluate-resume")
async def evaluate_resume(request: EvaluateResumeRequest, db: Session = Depends(get_db)):
    """Evaluate resume for student improvement"""
    try:
        resume = db.query(Resume).filter(Resume.id == request.resume_id).first()
        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found")
        
        # Calculate ATS score
        ats_score = ats_scorer.calculate_ats_score(resume.parsed_data)
        
        # Get recommendations
        recommendations = ResumeRecommender.get_recommendations(resume.parsed_data, ats_score)
        
        # Extract skills
        skills = resume.parsed_data.get("technical_skills", [])
        
        return {
            "resume_id": request.resume_id,
            "ats_score": ats_score,
            "skills_identified": skills,
            "recommendations": recommendations,
            "next_steps": [
                "Review formatting recommendations to pass ATS filters",
                "Add missing skills mentioned in recommendations",
                "Explore career opportunities based on your skills"
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/career-fit")
async def get_career_fit(request: CareerFitRequest, db: Session = Depends(get_db)):
    """Get career fit recommendations based on resume"""
    try:
        resume = db.query(Resume).filter(Resume.id == request.resume_id).first()
        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found")
        
        # Extract skills and experience
        skills = resume.parsed_data.get("technical_skills", [])
        
        # Estimate years of experience
        nlp_analyzer_obj = NLPAnalyzer()
        experience_analysis = nlp_analyzer_obj.analyze_experience(resume.raw_text)
        years_of_experience = experience_analysis["estimated_years"]
        
        # Get role recommendations
        role_recommendations = career_recommender.recommend_roles(skills, years_of_experience)
        
        # Get company recommendations
        company_recommendations = career_recommender.recommend_companies(skills)
        
        return {
            "estimated_experience_years": years_of_experience,
            "top_role_matches": role_recommendations[:3],
            "top_company_fits": company_recommendations[:3],
            "skill_profile": skills
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/skill-gap-analysis")
async def analyze_skill_gaps(request: SkillGapRequest, db: Session = Depends(get_db)):
    """Analyze skill gaps for a target role"""
    try:
        resume = db.query(Resume).filter(Resume.id == request.resume_id).first()
        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found")
        
        skills = resume.parsed_data.get("technical_skills", [])
        
        gap_analysis = career_recommender.analyze_skill_gaps(skills, request.target_role)
        
        return gap_analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/career-path")
async def generate_career_path(request: CareerPathRequest, db: Session = Depends(get_db)):
    """Generate personalized career development path"""
    try:
        resume = db.query(Resume).filter(Resume.id == request.resume_id).first()
        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found")
        
        skills = resume.parsed_data.get("technical_skills", [])
        
        # Estimate experience
        nlp_analyzer_obj = NLPAnalyzer()
        experience_analysis = nlp_analyzer_obj.analyze_experience(resume.raw_text)
        years_of_experience = experience_analysis["estimated_years"]
        
        # Generate career path
        career_path = career_recommender.generate_career_path(skills, years_of_experience)
        
        # Check if profile exists
        profile = db.query(StudentCareerProfile).filter(StudentCareerProfile.user_id == request.user_id).first()
        
        if not profile:
            profile = StudentCareerProfile(
                user_id=request.user_id,
                resume_id=request.resume_id,
                skills=skills,
                education=resume.parsed_data.get("education", []),
                experience=resume.parsed_data.get("experience", []),
                ats_score=resume.ats_score,
                skill_gaps=career_path["skill_priorities"],
                recommended_roles=[r["role"] for r in career_path["recommended_next_roles"]],
                recommended_companies=[]
            )
            db.add(profile)
        else:
            profile.skills = skills
            profile.skill_gaps = career_path["skill_priorities"]
            profile.recommended_roles = [r["role"] for r in career_path["recommended_next_roles"]]
        
        db.commit()
        
        return career_path
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/improve-resume")
async def get_resume_improvement_tips(request: dict = Body(...), db: Session = Depends(get_db)):
    """Get specific tips to improve resume"""
    try:
        resume_id = request.get("resume_id")
        if not resume_id:
            raise HTTPException(status_code=400, detail="resume_id is required")
        resume = db.query(Resume).filter(Resume.id == resume_id).first()
        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found")
        
        parsed_data = resume.parsed_data
        improvements = []
        
        # Check each section
        if not parsed_data.get("personal_info", {}).get("email"):
            improvements.append({
                "section": "Personal Info",
                "issue": "Email address missing",
                "tip": "Add your professional email address at the top of your resume"
            })
        
        if not parsed_data.get("personal_info", {}).get("phone"):
            improvements.append({
                "section": "Personal Info",
                "issue": "Phone number missing",
                "tip": "Include your contact phone number"
            })
        
        if not parsed_data.get("education") or len(parsed_data["education"]) < 1:
            improvements.append({
                "section": "Education",
                "issue": "No education information",
                "tip": "Add your educational background with degree, institution, and year"
            })
        
        if not parsed_data.get("experience") or len(parsed_data["experience"]) < 1:
            improvements.append({
                "section": "Experience",
                "issue": "No work experience",
                "tip": "List your work experience with company, role, duration, and achievements"
            })
        
        if not parsed_data.get("technical_skills") or len(parsed_data["technical_skills"]) < 5:
            improvements.append({
                "section": "Technical Skills",
                "issue": "Limited skills listed",
                "tip": "Add at least 5-10 relevant technical skills"
            })
        
        if not parsed_data.get("projects") or len(parsed_data["projects"]) == 0:
            improvements.append({
                "section": "Projects",
                "issue": "No projects listed",
                "tip": "Showcase your projects with descriptions and technologies used"
            })
        
        return {
            "resume_id": resume_id,
            "improvement_count": len(improvements),
            "improvements": improvements,
            "ats_score": resume.ats_score,
            "priority": "high" if resume.ats_score < 50 else "medium" if resume.ats_score < 75 else "low"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/student-profile/{user_id}")
async def get_student_profile(user_id: int, db: Session = Depends(get_db)):
    """Get student career profile"""
    profile = db.query(StudentCareerProfile).filter(StudentCareerProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")
    
    return {
        "id": profile.id,
        "skills": profile.skills,
        "education": profile.education,
        "experience": profile.experience,
        "ats_score": profile.ats_score,
        "skill_gaps": profile.skill_gaps,
        "recommended_roles": profile.recommended_roles,
        "recommended_companies": profile.recommended_companies,
        "created_at": profile.created_at,
        "updated_at": profile.updated_at
    }

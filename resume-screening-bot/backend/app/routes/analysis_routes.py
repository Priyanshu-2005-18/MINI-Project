from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Resume, JobPosting, AnalysisResult
from app.services.nlp_analyzer import NLPAnalyzer
from app.services.text_processor import TextPreprocessor
from app.services.advanced_matcher import AdvancedResumeMatcher
from app.utils.scoring import ATSScorer, ResumeRecommender
from app.schemas.schemas import BulkAnalysisRequest, AnalyzeResumeJobRequest
from typing import List

router = APIRouter()

nlp_analyzer = NLPAnalyzer()
ats_scorer = ATSScorer()
text_processor = TextPreprocessor()
advanced_matcher = AdvancedResumeMatcher()

@router.post("/analyze-resume-job")
async def analyze_resume_against_job(request: AnalyzeResumeJobRequest, db: Session = Depends(get_db)):
    """Analyze single resume against job description using advanced matching"""
    try:
        resume_id = request.resume_id
        job_id = request.job_id
        
        resume = db.query(Resume).filter(Resume.id == resume_id).first()
        job = db.query(JobPosting).filter(JobPosting.id == job_id).first()
        
        if not resume or not job:
            raise HTTPException(status_code=404, detail="Resume or Job not found")
        
        # Use advanced matching system
        resume_data = resume.parsed_data if resume.parsed_data else {}
        job_description = job.description or ""
        
        # Debug logging
        print(f"Analyzing Resume {resume_id} against Job {job_id}")
        print(f"Job Description Length: {len(job_description)}")
        print(f"Resume Text Length: {len(resume.raw_text or '')}")
        print(f"Resume Data Keys: {list(resume_data.keys())}")
        
        match_result = advanced_matcher.match_resume_to_job(
            resume_data=resume_data,
            resume_text=resume.raw_text or "",
            job_description=job_description
        )
        
        print(f"Match Result - Score: {match_result.get('overall_score')}, Category: {match_result.get('category')}")
        
        # Save analysis result
        analysis = AnalysisResult(
            user_id=resume.user_id,
            resume_id=resume_id,
            job_id=job_id,
            overall_score=match_result["overall_score"],
            skills_matched=match_result["matched_skills"],
            skills_missing=match_result["missing_skills"],
            extra_skills=[],
            recommendations=match_result["explanation"]
        )
        db.add(analysis)
        db.commit()
        db.refresh(analysis)
        
        return {
            "analysis_id": analysis.id,
            "resume_id": resume_id,
            "filename": resume.filename,
            
            # ATS Score (First Priority)
            "ats_score": match_result.get("ats_score", 0),
            "ats_section_scores": match_result.get("ats_section_scores", {}),
            
            # Overall Match Score
            "overall_score": match_result["overall_score"],
            "category": match_result["category"],
            
            # Matching Details
            "matching_details": match_result.get("matching_details", {}),
            
            # Skills Analysis
            "matched_skills": match_result.get("matched_skills", []),
            "missing_skills": match_result.get("missing_skills", []),
            "missing_skills_list": match_result.get("missing_skills_list", match_result.get("missing_skills", [])),
            
            # Improvements
            "improvements": match_result.get("improvements", []),
            
            # Clean output format
            "result": match_result.get("result", match_result["category"]),
            "match_score": match_result.get("match_score", match_result["overall_score"]),
            "experience_match_status": match_result.get("experience_match_status", "Fair"),
            "resume_strength_10": match_result.get("resume_strength_10", match_result.get("resume_strength", 0)),
            # Detailed breakdown
            "skill_match": {
                "score": match_result["skill_match"]["score"],
                "match_percentage": match_result["skill_match"].get("match_percentage", 0),
                "jd_skills_count": match_result["skill_match"].get("jd_skills_count", 0),
                "matched_count": match_result["skill_match"]["matched_required_count"],
                "missing_count": match_result["skill_match"]["missing_required_count"],
                "skills_used_in_projects": match_result["skill_match"]["skills_used_in_projects"]
            },
            "project_relevance": {
                "score": match_result["project_relevance"]["score"],
                "relevant_projects": match_result["project_relevance"]["relevant_projects"]
            },
            "experience_alignment": {
                "score": match_result["experience_alignment"]["score"],
                "years_estimated": match_result["experience_alignment"]["years_estimated"],
                "years_required": match_result["experience_alignment"].get("years_required")
            },
            "education_fit": {
                "score": match_result["education_profile_fit"]["score"]
            },
            "keyword_similarity": match_result.get("keyword_similarity", {}),
            "matched_skills": match_result["matched_skills"],
            "missing_skills": match_result["missing_skills"],
            "explanation": match_result["explanation"],
            "detailed_breakdown": {
                "skill_match": match_result["skill_match"],
                "project_relevance": match_result["project_relevance"],
                "experience_alignment": match_result["experience_alignment"],
                "education_fit": match_result["education_profile_fit"]
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/bulk-analyze")
async def bulk_analyze(request: BulkAnalysisRequest, db: Session = Depends(get_db)):
    """Analyze multiple resumes at once using advanced matching"""
    try:
        results = []
        
        # Get job description
        job_description = ""
        job_id = None
        if request.job_id:
            job = db.query(JobPosting).filter(JobPosting.id == request.job_id).first()
            if job:
                job_description = job.description or ""
                job_id = job.id
        else:
            job_description = request.job_description or ""
        
        if not job_description:
            raise HTTPException(status_code=400, detail="Job description is required")
        
        # Analyze all resumes
        for resume_id in request.resume_ids:
            resume = db.query(Resume).filter(Resume.id == resume_id).first()
            if not resume:
                continue
            
            try:
                # Use advanced matching
                resume_data = resume.parsed_data if resume.parsed_data else {}
                match_result = advanced_matcher.match_resume_to_job(
                    resume_data=resume_data,
                    resume_text=resume.raw_text or "",
                    job_description=job_description
                )
                
                results.append({
                    "resume_id": resume_id,
                    "filename": resume.filename,
                    "overall_score": match_result["overall_score"],
                    "category": match_result["category"],
                    "ats_score": match_result.get("ats_score", 0),
                    "skill_match_score": match_result["skill_match"]["score"],
                    "project_relevance_score": match_result["project_relevance"]["score"],
                    "experience_score": match_result["experience_alignment"]["score"],
                    "education_score": match_result["education_profile_fit"]["score"],
                    "matched_skills": match_result["matched_skills"],
                    "missing_skills": match_result["missing_skills"],
                    "missing_skills_list": match_result.get("missing_skills_list", []),
                    "improvements": match_result.get("improvements", []),
                    "matching_details": match_result.get("matching_details", {}),
                    "experience_match_status": match_result.get("experience_match_status", "Fair"),
                    "resume_strength_10": match_result.get("resume_strength_10", 0),
                    "explanation": match_result["explanation"],
                    "detailed_breakdown": {
                        "skill_match": match_result["skill_match"],
                        "project_relevance": match_result["project_relevance"],
                        "experience_alignment": match_result["experience_alignment"],
                        "education_fit": match_result["education_profile_fit"]
                    }
                })
            except Exception as e:
                # Continue with other resumes if one fails
                print(f"Error analyzing resume {resume_id}: {e}")
                results.append({
                    "resume_id": resume_id,
                    "filename": resume.filename,
                    "overall_score": 0,
                    "category": "Error",
                    "error": str(e)
                })
        
        # Sort by score (highest to lowest)
        results.sort(key=lambda x: x["overall_score"], reverse=True)
        
        # Calculate statistics
        average_score = sum(r["overall_score"] for r in results) / len(results) if results else 0
        strong_matches = sum(1 for r in results if r.get("category") == "Strong Match")
        good_matches = sum(1 for r in results if r.get("category") == "Good Match")
        weak_matches = sum(1 for r in results if r.get("category") == "Weak Match")
        not_suitable = sum(1 for r in results if r.get("category") == "Not Suitable")
        
        return {
            "total_resumes": len(request.resume_ids),
            "analyzed": len(results),
            "average_score": round(average_score, 1),
            "category_breakdown": {
                "strong_match": strong_matches,
                "good_match": good_matches,
                "weak_match": weak_matches,
                "not_suitable": not_suitable
            },
            "results": results
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/calculate-ats-score")
async def calculate_ats_score(resume_id: int, db: Session = Depends(get_db)):
    """Calculate ATS score for a resume"""
    try:
        resume = db.query(Resume).filter(Resume.id == resume_id).first()
        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found")
        
        ats_score = ats_scorer.calculate_ats_score(resume.parsed_data)
        section_scores = ats_scorer.calculate_section_ats_scores(resume.parsed_data)
        recommendations = ResumeRecommender.get_recommendations(resume.parsed_data, ats_score)
        
        # Update resume with ATS score
        resume.ats_score = ats_score
        db.commit()
        
        return {
            "resume_id": resume_id,
            "ats_score": ats_score,
            "section_scores": section_scores,
            "recommendations": recommendations
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analysis-results/{analysis_id}")
async def get_analysis_result(analysis_id: int, db: Session = Depends(get_db)):
    """Get detailed analysis result"""
    analysis = db.query(AnalysisResult).filter(AnalysisResult.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    return {
        "id": analysis.id,
        "overall_score": analysis.overall_score,
        "skills_matched": analysis.skills_matched,
        "skills_missing": analysis.skills_missing,
        "extra_skills": analysis.extra_skills,
        "recommendations": analysis.recommendations,
        "created_at": analysis.created_at
    }

@router.get("/resume/{resume_id}/analyses")
async def get_resume_analyses(resume_id: int, db: Session = Depends(get_db)):
    """Get all analysis results for a resume"""
    analyses = db.query(AnalysisResult).filter(AnalysisResult.resume_id == resume_id).all()
    
    return [
        {
            "id": a.id,
            "overall_score": a.overall_score,
            "created_at": a.created_at,
            "matched_skills": len(a.skills_matched),
            "missing_skills": len(a.skills_missing)
        }
        for a in analyses
    ]

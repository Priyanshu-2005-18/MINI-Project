"""
ATS Resume Screening System
Comprehensive resume evaluation against job descriptions
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import re
import json

router = APIRouter(prefix="/api/screening", tags=["screening"])

class ResumeData(BaseModel):
    resume_id: str
    resume_text: str
    job_description: str

class SkillMatch(BaseModel):
    skill: str
    matched: bool
    category: str

class ScreeningResult(BaseModel):
    resume_id: str
    match_score: int
    ats_score: int
    decision: str
    resume_strength: str
    matched_skills: List[str]
    missing_skills: List[str]
    project_relevance: str
    experience_fit: str
    education_fit: str
    soft_skills: str
    final_summary: str
    detailed_breakdown: dict

class ATSScreener:
    def __init__(self):
        self.required_keywords = set()
        self.preferred_keywords = set()
        self.required_skills = []
        self.preferred_skills = []
        
    def extract_jd_requirements(self, jd_text: str):
        """Extract job requirements from JD"""
        jd_lower = jd_text.lower()
        
        # Common technical skills
        tech_skills = {
            'python', 'java', 'c++', 'c#', 'javascript', 'typescript', 'golang', 'rust',
            'sql', 'nosql', 'mongodb', 'postgresql', 'mysql', 'redis',
            'react', 'angular', 'vue', 'node.js', 'django', 'flask', 'fastapi',
            'aws', 'gcp', 'azure', 'docker', 'kubernetes', 'jenkins',
            'git', 'github', 'gitlab', 'bitbucket',
            'rest api', 'graphql', 'microservices', 'dsa', 'oop', 'solid',
            'html', 'css', 'tailwind', 'bootstrap', 'scss',
            'machine learning', 'deep learning', 'nlp', 'computer vision',
            'pandas', 'numpy', 'tensorflow', 'pytorch', 'scikit-learn',
            'agile', 'scrum', 'jira', 'confluence'
        }
        
        for skill in tech_skills:
            if skill in jd_lower:
                if any(word in jd_lower for word in ['required', 'must', 'essential', 'mandatory']):
                    self.required_skills.append(skill)
                else:
                    self.preferred_skills.append(skill)
    
    def extract_resume_info(self, resume_text: str) -> dict:
        """Extract structured information from resume"""
        resume_lower = resume_text.lower()
        
        extracted = {
            'skills': [],
            'languages': [],
            'tools': [],
            'experience_years': 0,
            'projects': [],
            'education': [],
            'certifications': [],
            'ats_formatting_score': 100
        }
        
        # Extract skills
        tech_skills = {
            'python', 'java', 'c++', 'c#', 'javascript', 'typescript', 'golang', 'rust',
            'sql', 'nosql', 'mongodb', 'postgresql', 'mysql', 'redis',
            'react', 'angular', 'vue', 'node.js', 'node', 'django', 'flask', 'fastapi',
            'aws', 'gcp', 'azure', 'docker', 'kubernetes', 'jenkins',
            'git', 'github', 'gitlab', 'bitbucket',
            'rest api', 'graphql', 'microservices', 'dsa', 'oop', 'solid',
            'html', 'css', 'tailwind', 'bootstrap', 'scss',
            'machine learning', 'deep learning', 'nlp', 'computer vision',
            'pandas', 'numpy', 'tensorflow', 'pytorch', 'scikit-learn',
            'agile', 'scrum', 'jira', 'confluence'
        }
        
        for skill in tech_skills:
            if skill in resume_lower:
                extracted['skills'].append(skill)
        
        # Detect education level
        if 'b.tech' in resume_lower or 'bachelor' in resume_lower:
            extracted['education'].append('B.Tech/Bachelor\'s')
        if 'm.tech' in resume_lower or 'master' in resume_lower:
            extracted['education'].append('M.Tech/Master\'s')
        
        # Check ATS formatting
        if '●' in resume_text or '•' in resume_text:
            extracted['ats_formatting_score'] = 100
        if len(resume_text.split('\n')) > 5:
            extracted['ats_formatting_score'] = max(85, extracted['ats_formatting_score'])
        
        return extracted
    
    def calculate_skill_match(self, resume_skills: List[str], required: List[str], preferred: List[str]) -> tuple:
        """Calculate skill match score (0-30)"""
        matched_required = [s for s in required if s in resume_skills]
        matched_preferred = [s for s in preferred if s in resume_skills]
        missing = [s for s in required if s not in resume_skills]
        
        score = 0
        if required:
            score += (len(matched_required) / len(required)) * 20
        score += min(len(matched_preferred) * 2, 10)
        
        return int(score), matched_required + matched_preferred, missing
    
    def calculate_project_relevance(self, resume_text: str, jd_text: str) -> tuple:
        """Calculate project relevance score (0-20)"""
        # Check for project keywords
        project_indicators = ['project', 'built', 'developed', 'created', 'deployed']
        project_count = sum(resume_text.lower().count(ind) for ind in project_indicators)
        
        score = min(project_count * 4, 20)
        relevance_desc = "No projects mentioned" if score < 5 else \
                        "Limited project experience" if score < 10 else \
                        "Some relevant projects" if score < 15 else \
                        "Strong project portfolio"
        
        return int(score), relevance_desc
    
    def calculate_experience_match(self, resume_text: str, jd_text: str) -> tuple:
        """Calculate experience match score (0-15)"""
        # Look for internship/job keywords
        exp_keywords = ['internship', 'intern', 'experience', 'worked at', 'worked on', 'role', 'position']
        exp_count = sum(resume_text.lower().count(kw) for kw in exp_keywords)
        
        score = min(exp_count * 3, 15)
        exp_desc = "No clear experience" if score < 5 else \
                  "Limited experience" if score < 10 else \
                  "Moderate experience" if score < 12 else \
                  "Strong experience match"
        
        return int(score), exp_desc
    
    def calculate_education_match(self, resume_text: str) -> tuple:
        """Calculate education match score (0-10)"""
        score = 0
        desc = "Not mentioned"
        
        if 'b.tech' in resume_text.lower() or 'bachelor' in resume_text.lower():
            score = 8
            desc = "B.Tech/Bachelor's degree"
        if 'm.tech' in resume_text.lower() or 'master' in resume_text.lower():
            score = 10
            desc = "Master's degree"
        
        if 'cgpa' in resume_text.lower() or 'gpa' in resume_text.lower():
            score = min(score + 2, 10)
        
        return int(score), desc
    
    def calculate_certifications(self, resume_text: str) -> tuple:
        """Calculate certifications & achievements score (0-5)"""
        cert_keywords = ['certification', 'certified', 'award', 'achievement', 'license']
        cert_count = sum(resume_text.lower().count(kw) for kw in cert_keywords)
        
        score = min(cert_count * 1.5, 5)
        return int(score), "Certifications/Awards present" if score > 0 else "No certifications"
    
    def calculate_soft_skills(self, resume_text: str) -> tuple:
        """Calculate soft skills evidence score (0-5)"""
        soft_skills = ['leadership', 'teamwork', 'communication', 'problem-solving', 'collaboration', 'quick learner']
        soft_count = sum(resume_text.lower().count(skill) for skill in soft_skills)
        
        score = min(soft_count * 1.2, 5)
        return int(score), "Strong soft skills evident" if score >= 3 else "Limited soft skills evidence"
    
    def calculate_keyword_similarity(self, resume_text: str, jd_text: str) -> int:
        """Calculate keyword similarity score (0-5)"""
        resume_words = set(resume_text.lower().split())
        jd_words = set(jd_text.lower().split())
        
        common = len(resume_words & jd_words)
        similarity = min((common / len(jd_words)) * 5, 5) if jd_words else 0
        
        return int(similarity)
    
    def calculate_ats_formatting(self, resume_text: str) -> int:
        """Calculate ATS formatting quality score (0-10)"""
        score = 10
        
        # Check for formatting issues
        if len(resume_text) < 100:
            score -= 3
        if resume_text.count('\n') < 3:
            score -= 2
        if any(char in resume_text for char in ['©', '™', '®']):
            score -= 2
        if '●' in resume_text or '•' in resume_text:
            score = 10
        
        return max(score, 0)
    
    def determine_decision(self, match_score: int) -> str:
        """Determine hiring decision based on score"""
        if match_score >= 85:
            return "Strong Match"
        elif match_score >= 70:
            return "Good Match"
        elif match_score >= 55:
            return "Moderate Match"
        elif match_score >= 40:
            return "Weak Match"
        else:
            return "Not Suitable"
    
    def screen_resume(self, resume_id: str, resume_text: str, jd_text: str) -> ScreeningResult:
        """Complete resume screening against JD"""
        
        # Extract JD requirements
        self.extract_jd_requirements(jd_text)
        
        # Extract resume information
        resume_info = self.extract_resume_info(resume_text)
        
        # Calculate all scores
        skill_score, matched_skills, missing_skills = self.calculate_skill_match(
            resume_info['skills'], self.required_skills, self.preferred_skills
        )
        
        project_score, project_desc = self.calculate_project_relevance(resume_text, jd_text)
        exp_score, exp_desc = self.calculate_experience_match(resume_text, jd_text)
        edu_score, edu_desc = self.calculate_education_match(resume_text)
        cert_score, cert_desc = self.calculate_certifications(resume_text)
        soft_score, soft_desc = self.calculate_soft_skills(resume_text)
        keyword_score = self.calculate_keyword_similarity(resume_text, jd_text)
        ats_score = self.calculate_ats_formatting(resume_text)
        
        # Calculate total match score
        match_score = skill_score + project_score + exp_score + edu_score + cert_score + soft_score + keyword_score
        
        # Calculate ATS score (separate from match score)
        total_ats = skill_score + ats_score + project_score + exp_score + (edu_score * 0.8)
        ats_score_final = int(min(total_ats, 100))
        
        decision = self.determine_decision(match_score)
        resume_strength = f"{min(10, max(1, (match_score // 10)))}/10"
        
        # Final summary
        if decision == "Strong Match":
            summary = f"Excellent alignment with job requirements. {len(matched_skills)} key skills matched. Strong background in {', '.join(matched_skills[:3]) if matched_skills else 'relevant areas'}."
        elif decision == "Good Match":
            summary = f"Good fit for the role. Covers {len(matched_skills)} required skills. Missing: {', '.join(missing_skills[:2]) if missing_skills else 'minor details'}."
        elif decision == "Moderate Match":
            summary = f"Potential candidate with {len(matched_skills)} matching skills. Needs development in {', '.join(missing_skills[:3]) if missing_skills else 'key areas'}."
        else:
            summary = f"Limited match. Only {len(matched_skills)} skills align with JD. Significant gaps in {', '.join(missing_skills[:3]) if missing_skills else 'critical requirements'}."
        
        detailed_breakdown = {
            'skill_match': skill_score,
            'project_relevance': project_score,
            'experience_match': exp_score,
            'education_match': edu_score,
            'certifications': cert_score,
            'soft_skills': soft_score,
            'keyword_similarity': keyword_score,
            'ats_formatting': ats_score
        }
        
        return ScreeningResult(
            resume_id=resume_id,
            match_score=match_score,
            ats_score=ats_score_final,
            decision=decision,
            resume_strength=resume_strength,
            matched_skills=matched_skills,
            missing_skills=missing_skills,
            project_relevance=project_desc,
            experience_fit=exp_desc,
            education_fit=edu_desc,
            soft_skills=soft_desc,
            final_summary=summary,
            detailed_breakdown=detailed_breakdown
        )

@router.post("/analyze")
async def analyze_resume(data: ResumeData) -> ScreeningResult:
    """Analyze single resume against job description"""
    try:
        screener = ATSScreener()
        result = screener.screen_resume(data.resume_id, data.resume_text, data.job_description)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze-batch")
async def analyze_batch(resumes: List[ResumeData]) -> List[ScreeningResult]:
    """Analyze multiple resumes and return ranked results"""
    try:
        results = []
        screener = ATSScreener()
        
        for resume_data in resumes:
            result = screener.screen_resume(
                resume_data.resume_id,
                resume_data.resume_text,
                resume_data.job_description
            )
            results.append(result)
        
        # Sort by match_score descending
        results.sort(key=lambda x: x.match_score, reverse=True)
        
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from typing import Dict, List
import json

class ATSScorer:
    """Calculate ATS compatibility scores"""
    
    def __init__(self):
        self.keyword_weights = {
            "technical_skills": 0.25,
            "experience": 0.25,
            "education": 0.20,
            "formatting": 0.15,
            "keywords": 0.15
        }
    
    def calculate_ats_score(self, parsed_resume: Dict, job_description: str = None) -> float:
        """Calculate overall ATS score"""
        score = 0
        
        # Education score
        education_score = self._score_education(parsed_resume.get("education", []))
        score += education_score * self.keyword_weights["education"]
        
        # Experience score
        experience_score = self._score_experience(parsed_resume.get("experience", []))
        score += experience_score * self.keyword_weights["experience"]
        
        # Technical skills score
        skills_score = self._score_skills(parsed_resume.get("technical_skills", []))
        score += skills_score * self.keyword_weights["technical_skills"]
        
        # Formatting/completeness score
        format_score = self._score_completeness(parsed_resume)
        score += format_score * self.keyword_weights["formatting"]
        
        # Keyword density score
        keyword_score = self._score_keyword_density(parsed_resume)
        score += keyword_score * self.keyword_weights["keywords"]
        
        return min(100, max(0, score))
    
    def _score_education(self, education_list: List[str]) -> float:
        """Score education section"""
        if not education_list:
            return 0
        
        score = 0
        keywords = ['bachelor', 'master', 'phd', 'degree', 'university', 'college', 'institute', 'gpa']
        
        for item in education_list:
            item_lower = item.lower()
            for keyword in keywords:
                if keyword in item_lower:
                    score += 10
                    break
        
        return min(100, score)
    
    def _score_experience(self, experience_list: List[str]) -> float:
        """Score experience section"""
        if not experience_list:
            return 0
        
        score = len(experience_list) * 10  # Points per job entry
        keywords = ['year', 'month', 'led', 'managed', 'developed', 'designed', 'implemented']
        
        for item in experience_list:
            item_lower = item.lower()
            for keyword in keywords:
                if keyword in item_lower:
                    score += 5
        
        return min(100, score)
    
    def _score_skills(self, skills_list: List[str]) -> float:
        """Score technical skills"""
        if not skills_list:
            return 0
        
        # Award points for each skill
        score = len(skills_list) * 5
        return min(100, score)
    
    def _score_completeness(self, parsed_resume: Dict) -> float:
        """Score resume completeness and formatting"""
        score = 50  # Base score
        
        # Check for personal info
        if parsed_resume.get("personal_info"):
            if parsed_resume["personal_info"].get("email"):
                score += 10
            if parsed_resume["personal_info"].get("phone"):
                score += 10
        
        # Check for all sections
        sections = ["education", "experience", "technical_skills", "projects"]
        for section in sections:
            if parsed_resume.get(section) and len(parsed_resume[section]) > 0:
                score += 5
        
        return min(100, score)
    
    def _score_keyword_density(self, parsed_resume: Dict) -> float:
        """Score keyword presence and density"""
        score = 0
        common_keywords = [
            'experience', 'project', 'developed', 'designed', 'implemented',
            'managed', 'team', 'python', 'java', 'sql', 'api', 'database',
            'achievement', 'award', 'certification'
        ]
        
        resume_text = json.dumps(parsed_resume).lower()
        
        for keyword in common_keywords:
            if keyword in resume_text:
                score += 5
        
        return min(100, score)
    
    def calculate_section_ats_scores(self, parsed_resume: Dict) -> Dict:
        """Calculate ATS scores for each section"""
        return {
            "education": self._score_education(parsed_resume.get("education", [])),
            "experience": self._score_experience(parsed_resume.get("experience", [])),
            "technical_skills": self._score_skills(parsed_resume.get("technical_skills", [])),
            "formatting": self._score_completeness(parsed_resume),
            "keywords": self._score_keyword_density(parsed_resume)
        }

class ResumeRecommender:
    """Generate recommendations for resume improvement"""
    
    @staticmethod
    def get_recommendations(parsed_resume: Dict, ats_score: float) -> List[str]:
        """Generate improvement recommendations"""
        recommendations = []
        
        # Check education
        if not parsed_resume.get("education") or len(parsed_resume["education"]) == 0:
            recommendations.append("Add your education details including degree, institution, and graduation date.")
        
        # Check experience
        if not parsed_resume.get("experience") or len(parsed_resume["experience"]) == 0:
            recommendations.append("Add your work experience with specific dates and achievements.")
        
        # Check technical skills
        if not parsed_resume.get("technical_skills") or len(parsed_resume["technical_skills"]) < 5:
            recommendations.append("List your technical skills clearly. Include programming languages, tools, and frameworks.")
        
        # Check projects
        if not parsed_resume.get("projects") or len(parsed_resume["projects"]) == 0:
            recommendations.append("Add projects you've worked on with descriptions and technologies used.")
        
        # Check personal info
        if not parsed_resume.get("personal_info", {}).get("email"):
            recommendations.append("Ensure your email address is clearly visible in the resume header.")
        
        # ATS-specific recommendations
        if ats_score < 60:
            recommendations.append("Your resume may not pass ATS filters. Consider using standard formatting without tables or graphics.")
            recommendations.append("Use standard section headings like 'Education', 'Experience', 'Skills' to improve ATS readability.")
        
        if ats_score < 40:
            recommendations.append("Your resume needs significant improvements. Reorganize sections and ensure proper formatting.")
        
        return recommendations
    
    @staticmethod
    def get_skill_recommendations(resume_skills: List[str], job_skills: List[str]) -> List[str]:
        """Get skill learning recommendations"""
        recommendations = []
        missing_skills = set(job_skills) - set(resume_skills)
        
        if missing_skills:
            top_missing = list(missing_skills)[:5]
            recommendations.append(f"Consider learning these in-demand skills: {', '.join(top_missing)}")
        
        return recommendations

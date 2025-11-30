from typing import List, Dict
import json

class CareerRecommender:
    """Recommend suitable roles and companies based on candidate profile"""
    
    def __init__(self):
        # Simplified role-skill mappings
        self.role_skills = {
            "Python Developer": ["python", "django", "flask", "fastapi", "sqlalchemy"],
            "JavaScript Developer": ["javascript", "nodejs", "react", "angular", "vue"],
            "Data Scientist": ["python", "machine learning", "tensorflow", "pandas", "numpy"],
            "DevOps Engineer": ["docker", "kubernetes", "aws", "ci/cd", "jenkins"],
            "Full Stack Developer": ["javascript", "react", "nodejs", "sql", "mongodb"],
            "Cloud Architect": ["aws", "azure", "gcp", "terraform", "kubernetes"],
            "Mobile Developer": ["android", "ios", "flutter", "react native", "swift"],
            "Database Administrator": ["sql", "mysql", "postgresql", "oracle", "mongodb"],
            "ML Engineer": ["python", "tensorflow", "pytorch", "machine learning", "deep learning"],
            "QA Engineer": ["testing", "selenium", "junit", "automation", "api"]
        }
        
        # Company profiles (simplified)
        self.company_profiles = {
            "Tech Startups": ["python", "javascript", "react", "aws", "agile"],
            "FAANG": ["java", "c++", "system design", "algorithms", "distributed systems"],
            "Data Companies": ["python", "machine learning", "sql", "big data", "spark"],
            "FinTech": ["java", "python", "sql", "security", "microservices"],
            "Cloud Services": ["aws", "azure", "gcp", "kubernetes", "devops"]
        }
    
    def recommend_roles(self, skills: List[str], experience_years: float = 0) -> List[Dict]:
        """Recommend suitable job roles based on skills"""
        recommendations = []
        skills_lower = [s.lower() for s in skills]
        
        for role, required_skills in self.role_skills.items():
            match_count = sum(1 for req_skill in required_skills if any(req_skill in s for s in skills_lower))
            match_percentage = (match_count / len(required_skills)) * 100 if required_skills else 0
            
            if match_percentage > 0:
                recommendations.append({
                    "role": role,
                    "match_percentage": match_percentage,
                    "matched_skills": [s for s in skills if any(req in s.lower() for req in required_skills)],
                    "missing_skills": [s for s in required_skills if not any(s in sk.lower() for sk in skills_lower)]
                })
        
        # Sort by match percentage
        recommendations.sort(key=lambda x: x["match_percentage"], reverse=True)
        return recommendations[:5]  # Top 5 recommendations
    
    def recommend_companies(self, skills: List[str]) -> List[Dict]:
        """Recommend suitable companies based on skill profile"""
        recommendations = []
        skills_lower = [s.lower() for s in skills]
        
        for company_type, company_skills in self.company_profiles.items():
            match_count = sum(1 for comp_skill in company_skills if any(comp_skill in s for s in skills_lower))
            match_percentage = (match_count / len(company_skills)) * 100 if company_skills else 0
            
            if match_percentage > 0:
                recommendations.append({
                    "company_type": company_type,
                    "match_percentage": match_percentage,
                    "matched_skills": [s for s in company_skills if any(s in sk.lower() for sk in skills_lower)],
                    "suggested_upskilling": [s for s in company_skills if not any(s in sk.lower() for sk in skills_lower)]
                })
        
        recommendations.sort(key=lambda x: x["match_percentage"], reverse=True)
        return recommendations[:5]
    
    def analyze_skill_gaps(self, current_skills: List[str], target_role: str) -> Dict:
        """Analyze skill gaps for a target role"""
        target_skills = self.role_skills.get(target_role, [])
        current_skills_lower = [s.lower() for s in current_skills]
        
        matched = [s for s in target_skills if any(s in cs for cs in current_skills_lower)]
        missing = [s for s in target_skills if not any(s in cs for cs in current_skills_lower)]
        extra = [s for s in current_skills_lower if not any(s in ts for ts in target_skills)]
        
        return {
            "target_role": target_role,
            "matched_skills": matched,
            "missing_skills": missing,
            "extra_skills": extra,
            "completion_percentage": (len(matched) / len(target_skills)) * 100 if target_skills else 0,
            "skill_gap_analysis": {
                "critical_gaps": missing[:3],  # Top 3 critical missing skills
                "learning_path": [{"skill": skill, "priority": "high" if i < 2 else "medium"} 
                                for i, skill in enumerate(missing)]
            }
        }
    
    def generate_career_path(self, current_skills: List[str], experience_years: float) -> Dict:
        """Generate a career development path"""
        recommendations = self.recommend_roles(current_skills, experience_years)
        
        current_level = "Junior" if experience_years < 2 else "Mid-level" if experience_years < 5 else "Senior"
        
        return {
            "current_level": current_level,
            "recommended_next_roles": recommendations[:3],
            "skill_priorities": self._get_skill_priorities(current_skills),
            "career_trajectory": self._get_career_trajectory(current_skills, experience_years),
            "certifications_to_pursue": self._get_recommended_certifications(current_skills)
        }
    
    def _get_skill_priorities(self, skills: List[str]) -> List[str]:
        """Get priority skills to learn"""
        in_demand_skills = [
            "python", "javascript", "cloud", "machine learning", "devops",
            "react", "aws", "kubernetes", "terraform", "sql"
        ]
        
        existing_lower = [s.lower() for s in skills]
        priorities = [skill for skill in in_demand_skills if not any(skill in e for e in existing_lower)]
        
        return priorities[:5]
    
    def _get_career_trajectory(self, skills: List[str], experience_years: float) -> List[Dict]:
        """Get career progression path"""
        roles = self.recommend_roles(skills, experience_years)
        
        trajectory = []
        if experience_years < 2:
            trajectory.append({"year": "0-2", "target": roles[0]["role"] if roles else "Entry-level role"})
            trajectory.append({"year": "2-4", "target": roles[1]["role"] if len(roles) > 1 else "Mid-level role"})
        elif experience_years < 5:
            trajectory.append({"year": "Current", "target": roles[0]["role"] if roles else "Mid-level role"})
            trajectory.append({"year": "5+", "target": roles[1]["role"] if len(roles) > 1 else "Senior role"})
        else:
            trajectory.append({"year": "Current", "target": roles[0]["role"] if roles else "Senior role"})
            trajectory.append({"year": "10+", "target": "Leadership/Architect role"})
        
        return trajectory
    
    def _get_recommended_certifications(self, skills: List[str]) -> List[str]:
        """Get recommended certifications"""
        certifications = {
            "AWS": ["aws", "cloud"],
            "GCP": ["gcp", "cloud"],
            "Azure": ["azure", "cloud"],
            "Kubernetes": ["kubernetes", "docker"],
            "TensorFlow": ["machine learning", "python"],
            "Salesforce": ["crm", "salesforce"],
            "CompTIA Security+": ["security", "devops"],
            "AWS Solutions Architect": ["aws", "architecture"]
        }
        
        skills_lower = [s.lower() for s in skills]
        recommended = []
        
        for cert, keywords in certifications.items():
            if any(keyword in s for s in skills_lower for keyword in keywords):
                recommended.append(cert)
        
        return recommended[:5]

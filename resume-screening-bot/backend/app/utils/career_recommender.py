from typing import List, Dict
import json

class CareerRecommender:
    """Recommend suitable roles and companies based on candidate profile"""
    
    def __init__(self):
        # Comprehensive role-skill mappings with proficiency levels
        self.role_skills = {
            "Python Developer": {
                "core": ["python"],
                "important": ["django", "flask", "fastapi", "sqlalchemy"],
                "nice_to_have": ["postgresql", "docker", "git"],
                "salary_range": "₹6-15L",
                "growth_potential": "High"
            },
            "Senior Python Developer": {
                "core": ["python"],
                "important": ["django", "fastapi", "microservices", "system design"],
                "nice_to_have": ["kubernetes", "docker", "redis", "celery"],
                "salary_range": "₹15-30L",
                "growth_potential": "Very High"
            },
            "JavaScript Developer": {
                "core": ["javascript"],
                "important": ["react", "nodejs", "html", "css"],
                "nice_to_have": ["webpack", "docker", "git"],
                "salary_range": "₹5-12L",
                "growth_potential": "High"
            },
            "Full Stack Developer": {
                "core": ["javascript", "python", "html", "css"],
                "important": ["react", "nodejs", "sql", "mongodb", "git"],
                "nice_to_have": ["docker", "aws", "rest api"],
                "salary_range": "₹8-18L",
                "growth_potential": "High"
            },
            "Data Scientist": {
                "core": ["python", "machine learning"],
                "important": ["tensorflow", "pandas", "numpy", "scikit-learn", "sql"],
                "nice_to_have": ["deep learning", "spark", "aws"],
                "salary_range": "₹10-20L",
                "growth_potential": "Very High"
            },
            "ML Engineer": {
                "core": ["python", "machine learning", "deep learning"],
                "important": ["tensorflow", "pytorch", "nlp", "computer vision"],
                "nice_to_have": ["kubernetes", "mlops", "aws"],
                "salary_range": "₹12-25L",
                "growth_potential": "Very High"
            },
            "DevOps Engineer": {
                "core": ["docker", "kubernetes", "linux"],
                "important": ["aws", "ci/cd", "terraform", "jenkins"],
                "nice_to_have": ["ansible", "prometheus", "grafana"],
                "salary_range": "₹8-18L",
                "growth_potential": "High"
            },
            "Cloud Architect": {
                "core": ["aws", "system design"],
                "important": ["terraform", "kubernetes", "microservices"],
                "nice_to_have": ["azure", "gcp", "security"],
                "salary_range": "₹20-35L",
                "growth_potential": "Very High"
            },
            "Database Administrator": {
                "core": ["sql", "postgresql"],
                "important": ["mysql", "mongodb", "backup", "optimization"],
                "nice_to_have": ["aws", "docker", "performance tuning"],
                "salary_range": "₹7-15L",
                "growth_potential": "Medium"
            },
            "QA Engineer": {
                "core": ["testing", "automation"],
                "important": ["selenium", "api testing", "junit"],
                "nice_to_have": ["jenkins", "python", "docker"],
                "salary_range": "₹5-12L",
                "growth_potential": "Medium"
            }
        }
        
        # Company profiles with detailed requirements
        self.company_profiles = {
            "Tech Startups": {
                "skills": ["python", "javascript", "react", "aws", "startup"],
                "culture": "Fast-paced, Innovative",
                "size": "10-500 employees",
                "growth": "Rapid",
                "avg_salary": "₹8-18L"
            },
            "FAANG": {
                "skills": ["system design", "algorithms", "java", "c++", "distributed systems"],
                "culture": "Competitive, Innovative",
                "size": "50k+ employees",
                "growth": "Steady",
                "avg_salary": "₹20-50L"
            },
            "Data & Analytics Companies": {
                "skills": ["python", "machine learning", "sql", "big data", "spark"],
                "culture": "Data-driven, Analytical",
                "size": "100-5000 employees",
                "growth": "High",
                "avg_salary": "₹12-25L"
            },
            "FinTech": {
                "skills": ["java", "python", "sql", "security", "microservices"],
                "culture": "Secure, Regulated, Fast",
                "size": "50-1000 employees",
                "growth": "High",
                "avg_salary": "₹15-35L"
            },
            "Cloud Services": {
                "skills": ["aws", "kubernetes", "devops", "terraform", "monitoring"],
                "culture": "Infrastructure-focused, Reliable",
                "size": "1k-10k employees",
                "growth": "Steady",
                "avg_salary": "₹12-28L"
            }
        }
    
    def recommend_roles(self, skills: List[str], experience_years: float = 0) -> List[Dict]:
        """Recommend suitable job roles based on skills with weighted scoring"""
        recommendations = []
        skills_lower = [s.lower() for s in skills]
        
        for role, requirements in self.role_skills.items():
            # Calculate weighted score
            core_skills = requirements["core"]
            important_skills = requirements["important"]
            nice_to_have = requirements["nice_to_have"]
            
            # Core skills match (40% weight)
            core_match = sum(1 for req_skill in core_skills if any(req_skill in s for s in skills_lower))
            core_score = (core_match / len(core_skills)) * 40 if core_skills else 0
            
            # Important skills match (35% weight)
            important_match = sum(1 for req_skill in important_skills if any(req_skill in s for s in skills_lower))
            important_score = (important_match / len(important_skills)) * 35 if important_skills else 0
            
            # Nice to have skills (15% weight)
            nice_match = sum(1 for req_skill in nice_to_have if any(req_skill in s for s in skills_lower))
            nice_score = (nice_match / len(nice_to_have)) * 15 if nice_to_have else 0
            
            # Experience fit (10% weight)
            experience_score = 10 if experience_years >= 1 else 0
            
            total_score = core_score + important_score + nice_score + experience_score
            
            if total_score > 15:  # Only include if minimum score threshold met
                recommendations.append({
                    "role": role,
                    "match_percentage": total_score,
                    "salary_range": requirements["salary_range"],
                    "growth_potential": requirements["growth_potential"],
                    "matched_skills": [s for s in skills if any(req in s.lower() for req in core_skills + important_skills)],
                    "missing_skills": [s for s in core_skills + important_skills if not any(s in sk.lower() for sk in skills_lower)],
                    "required_experience": "1-3 years" if experience_years < 2 else "3-5 years" if experience_years < 5 else "5+ years"
                })
        
        # Sort by match percentage
        recommendations.sort(key=lambda x: x["match_percentage"], reverse=True)
        return recommendations[:5]
    
    def recommend_companies(self, skills: List[str]) -> List[Dict]:
        """Recommend suitable companies based on skill profile"""
        recommendations = []
        skills_lower = [s.lower() for s in skills]
        
        for company_type, company_info in self.company_profiles.items():
            company_skills = company_info["skills"]
            match_count = sum(1 for comp_skill in company_skills if any(comp_skill in s for s in skills_lower))
            match_percentage = (match_count / len(company_skills)) * 100 if company_skills else 0
            
            if match_percentage > 0:
                recommendations.append({
                    "company_type": company_type,
                    "match_percentage": match_percentage,
                    "culture": company_info["culture"],
                    "size": company_info["size"],
                    "growth": company_info["growth"],
                    "avg_salary": company_info["avg_salary"],
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
        """Generate a detailed career development path"""
        recommendations = self.recommend_roles(current_skills, experience_years)
        
        current_level = self._determine_level(experience_years)
        career_trajectory = self._get_detailed_trajectory(current_skills, experience_years, recommendations)
        
        return {
            "current_level": current_level,
            "experience_years": experience_years,
            "recommended_next_roles": recommendations[:3],
            "skill_priorities": self._get_skill_priorities(current_skills),
            "career_trajectory": career_trajectory,
            "certifications_to_pursue": self._get_recommended_certifications(current_skills),
            "learning_resources": self._get_learning_resources(current_skills),
            "salary_progression": self._get_salary_progression(recommendations, experience_years),
            "actionable_milestones": self._get_milestones(recommendations, experience_years)
        }
    
    def _determine_level(self, experience_years: float) -> str:
        """Determine current experience level"""
        if experience_years < 1.5:
            return "Fresher"
        elif experience_years < 3:
            return "Junior"
        elif experience_years < 6:
            return "Mid-level"
        elif experience_years < 10:
            return "Senior"
        else:
            return "Lead / Architect"
    
    def _get_detailed_trajectory(self, skills: List[str], experience_years: float, recommendations: List[Dict]) -> List[Dict]:
        """Get detailed career progression path with specific timelines and roles"""
        trajectory = []
        current_level = self._determine_level(experience_years)
        primary_role = recommendations[0]["role"] if recommendations else "Software Developer"
        next_role = recommendations[1]["role"] if len(recommendations) > 1 else "Senior " + primary_role
        
        if experience_years < 1.5:
            trajectory = [
                {
                    "year": "0-1",
                    "target": primary_role,
                    "level": "Fresher",
                    "description": f"Build strong foundation in {skills[0] if skills else 'core technologies'}",
                    "goals": ["Master core technologies", "Complete 3-5 projects", "Learn best practices"],
                    "expected_salary": "₹3-6L"
                },
                {
                    "year": "1-2",
                    "target": "Junior " + primary_role,
                    "level": "Junior",
                    "description": f"Develop expertise and take on larger features",
                    "goals": ["Lead small features", "Mentor incoming freshers", "Deepen specialization"],
                    "expected_salary": "₹6-8L"
                },
                {
                    "year": "2-4",
                    "target": next_role,
                    "level": "Mid-level",
                    "description": f"Move towards senior technical roles",
                    "goals": ["Own complete modules", "Lead technical discussions", "Improve team efficiency"],
                    "expected_salary": "₹10-15L"
                }
            ]
        elif experience_years < 3:
            trajectory = [
                {
                    "year": "Current (1-3 yrs)",
                    "target": "Junior " + primary_role,
                    "level": "Junior",
                    "description": f"Strengthen expertise in {primary_role}",
                    "goals": ["Lead small projects", "Mentor junior developers", "Build portfolio"],
                    "expected_salary": "₹6-10L"
                },
                {
                    "year": "3-4",
                    "target": next_role,
                    "level": "Mid-level",
                    "description": f"Transition to more responsible technical roles",
                    "goals": ["Own critical features", "Guide technical direction", "Build leadership skills"],
                    "expected_salary": "₹12-18L"
                },
                {
                    "year": "4-5",
                    "target": f"Lead {primary_role}",
                    "level": "Senior",
                    "description": f"Take on architectural and mentoring responsibilities",
                    "goals": ["Design system architecture", "Lead team initiatives", "Make strategic decisions"],
                    "expected_salary": "₹18-25L"
                }
            ]
        elif experience_years < 6:
            trajectory = [
                {
                    "year": "Current (3-6 yrs)",
                    "target": "Mid-level " + primary_role,
                    "level": "Mid-level",
                    "description": f"Deepen expertise and take on leadership",
                    "goals": ["Lead technical teams", "Make architectural decisions", "Mentor others"],
                    "expected_salary": "₹12-18L"
                },
                {
                    "year": "6-8",
                    "target": f"Senior {primary_role}",
                    "level": "Senior",
                    "description": f"Focus on impact and mentoring",
                    "goals": ["Own strategic projects", "Build high-performing teams", "Drive innovation"],
                    "expected_salary": "₹20-30L"
                },
                {
                    "year": "8+",
                    "target": f"Technical Lead / Architect",
                    "level": "Lead",
                    "description": f"Shape technology strategy and team culture",
                    "goals": ["Define technical standards", "Lead company-wide initiatives", "Mentor leaders"],
                    "expected_salary": "₹30-50L"
                }
            ]
        else:
            trajectory = [
                {
                    "year": "Current (6+ yrs)",
                    "target": f"Senior {primary_role}",
                    "level": "Senior",
                    "description": f"Drive strategic initiatives and mentorship",
                    "goals": ["Define best practices", "Build mentoring programs", "Strategic planning"],
                    "expected_salary": "₹25-40L"
                },
                {
                    "year": "10+",
                    "target": "Technical Leader / Engineering Manager",
                    "level": "Lead",
                    "description": f"Move into leadership and decision-making roles",
                    "goals": ["Lead large teams", "Shape company direction", "Build culture"],
                    "expected_salary": "₹40-60L"
                },
                {
                    "year": "15+",
                    "target": "Principal Engineer / Director",
                    "level": "Executive",
                    "description": f"Influence across organization",
                    "goals": ["Define strategy", "Build next-gen products", "Thought leadership"],
                    "expected_salary": "₹60-100L+"
                }
            ]
        
        return trajectory
    
    def _get_skill_priorities(self, skills: List[str]) -> List[Dict]:
        """Get priority skills to learn with learning time estimates"""
        in_demand_skills = {
            "python": {"months": 2, "level": "Essential", "value": "Very High"},
            "javascript": {"months": 2, "level": "Essential", "value": "Very High"},
            "system design": {"months": 3, "level": "Important", "value": "High"},
            "machine learning": {"months": 4, "level": "Advanced", "value": "High"},
            "devops": {"months": 3, "level": "Important", "value": "High"},
            "react": {"months": 2, "level": "Essential", "value": "Very High"},
            "aws": {"months": 2, "level": "Important", "value": "Very High"},
            "kubernetes": {"months": 3, "level": "Advanced", "value": "High"},
            "terraform": {"months": 2, "level": "Advanced", "value": "High"},
            "sql": {"months": 1, "level": "Essential", "value": "Critical"},
            "docker": {"months": 1, "level": "Important", "value": "Very High"},
            "git": {"months": 1, "level": "Essential", "value": "Critical"}
        }
        
        existing_lower = [s.lower() for s in skills]
        priorities = []
        
        for skill, info in in_demand_skills.items():
            if not any(skill in e for e in existing_lower):
                priorities.append({
                    "skill": skill,
                    "priority": info["level"],
                    "learning_time_months": info["months"],
                    "business_value": info["value"]
                })
        
        # Sort by business value and learning time
        priorities.sort(key=lambda x: (x["business_value"] != "Critical", x["learning_time_months"]))
        return priorities[:8]
    
    def _get_salary_progression(self, recommendations: List[Dict], experience_years: float) -> Dict:
        """Get salary progression based on career path"""
        current_salary_range = "₹4-8L"
        target_salary_range = "₹15-25L"
        
        if experience_years < 2:
            current_salary_range = "₹4-6L"
            target_salary_range = "₹8-12L"
        elif experience_years < 5:
            current_salary_range = "₹8-12L"
            target_salary_range = "₹15-25L"
        elif experience_years < 10:
            current_salary_range = "₹15-25L"
            target_salary_range = "₹30-50L"
        else:
            current_salary_range = "₹30-50L"
            target_salary_range = "₹50-100L+"
        
        return {
            "current_range": current_salary_range,
            "expected_in_2_years": target_salary_range,
            "growth_potential": "25-35% increase with skill development and role transition",
            "factors_affecting_salary": [
                "Technical skill specialization",
                "Leadership and mentoring abilities",
                "Industry and company size",
                "Geographical location",
                "Additional certifications"
            ]
        }
    
    def _get_milestones(self, recommendations: List[Dict], experience_years: float) -> List[Dict]:
        """Get actionable milestones for career progression"""
        milestones = []
        
        # Short-term milestones (0-6 months)
        milestones.append({
            "timeframe": "0-6 Months",
            "goals": [
                "Achieve at least one project completion in current role",
                "Learn one priority skill",
                "Build portfolio with 2-3 personal projects",
                "Get certified in relevant technology"
            ],
            "impact": "Strong foundation for next level"
        })
        
        # Medium-term milestones (6-12 months)
        milestones.append({
            "timeframe": "6-12 Months",
            "goals": [
                "Lead a major project or feature",
                "Complete 2-3 advanced certifications",
                "Mentor 1-2 junior developers",
                "Contribute to open source projects"
            ],
            "impact": "Ready for promotion/role transition"
        })
        
        # Long-term milestones (1-2 years)
        milestones.append({
            "timeframe": "1-2 Years",
            "goals": [
                f"Transition to {recommendations[0]['role'] if recommendations else 'target role'}",
                "Build expertise in 2-3 specialized areas",
                "Lead or manage a team",
                "Speak at conferences or write technical blogs"
            ],
            "impact": "Significant career advancement"
        })
        
        return milestones
    
    def _get_learning_resources(self, skills: List[str]) -> Dict:
        """Get recommended learning resources and courses"""
        resources = {
            "online_platforms": [
                {"name": "Coursera", "focus": "University-level courses", "cost": "₹0-500/month"},
                {"name": "Udemy", "focus": "Practical skill courses", "cost": "₹300-3000"},
                {"name": "LinkedIn Learning", "focus": "Professional development", "cost": "₹299/month"},
                {"name": "Pluralsight", "focus": "IT and tech skills", "cost": "₹29/month"},
                {"name": "Codecademy", "focus": "Interactive coding", "cost": "₹2500/month"}
            ],
            "certifications": [
                {"name": "AWS Solutions Architect", "effort": "3-4 months", "value": "Very High"},
                {"name": "Kubernetes (CKAD)", "effort": "2-3 months", "value": "High"},
                {"name": "GCP Professional", "effort": "3-4 months", "value": "High"},
                {"name": "TensorFlow Developer", "effort": "2-3 months", "value": "High"}
            ],
            "communities": [
                {"name": "GitHub", "type": "Open Source", "benefit": "Real-world experience"},
                {"name": "Stack Overflow", "type": "Q&A", "benefit": "Problem-solving skills"},
                {"name": "Dev.to", "type": "Blogging", "benefit": "Knowledge sharing"},
                {"name": "Local meetups", "type": "Networking", "benefit": "Professional network"}
            ]
        }
        return resources
    
    def _get_recommended_certifications(self, skills: List[str]) -> List[Dict]:
        """Get recommended certifications with details"""
        certifications = {
            "AWS Solutions Architect": {"keywords": ["aws", "cloud"], "effort": "3-4 months", "salary_impact": "+₹2-5L"},
            "AWS Developer Associate": {"keywords": ["aws", "python", "nodejs"], "effort": "2-3 months", "salary_impact": "+₹1-3L"},
            "GCP Professional": {"keywords": ["gcp", "cloud", "big data"], "effort": "3-4 months", "salary_impact": "+₹2-4L"},
            "Kubernetes (CKAD)": {"keywords": ["kubernetes", "docker"], "effort": "2-3 months", "salary_impact": "+₹1-3L"},
            "TensorFlow Developer": {"keywords": ["machine learning", "python"], "effort": "2-3 months", "salary_impact": "+₹2-4L"},
            "HashiCorp Certified Terraform": {"keywords": ["terraform", "devops"], "effort": "1-2 months", "salary_impact": "+₹1-2L"},
            "CompTIA Security+": {"keywords": ["security", "devops"], "effort": "2-3 months", "salary_impact": "+₹1-3L"}
        }
        
        skills_lower = [s.lower() for s in skills]
        recommended = []
        
        for cert, details in certifications.items():
            keywords = details["keywords"]
            if any(keyword in s for s in skills_lower for keyword in keywords):
                recommended.append({
                    "name": cert,
                    "effort": details["effort"],
                    "salary_impact": details["salary_impact"],
                    "matching_skills": [kw for kw in keywords if any(kw in s for s in skills_lower)]
                })
        
        return recommended[:5]

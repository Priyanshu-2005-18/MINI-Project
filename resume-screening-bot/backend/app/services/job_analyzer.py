import re
from typing import Dict, List, Optional
from app.services.text_processor import TextPreprocessor

class JobDescriptionAnalyzer:
    """Analyze job descriptions to extract key requirements"""
    
    def __init__(self):
        self.text_processor = TextPreprocessor()
        
    def analyze_job_description(self, job_description: str) -> Dict:
        """
        Extract comprehensive information from job description
        Returns: {
            required_skills: List[str],
            preferred_skills: List[str],
            key_responsibilities: List[str],
            experience_level: str,
            ideal_profile: Dict
        }
        """
        job_lower = job_description.lower()
        
        # Extract required skills
        required_skills = self._extract_required_skills(job_description)
        
        # Extract preferred skills (nice-to-have)
        preferred_skills = self._extract_preferred_skills(job_description)
        
        # Extract key responsibilities
        key_responsibilities = self._extract_responsibilities(job_description)
        
        # Determine experience level
        experience_level = self._determine_experience_level(job_description)
        
        # Extract years of experience required
        years_required = self._extract_years_experience(job_description)
        
        # Build ideal candidate profile
        ideal_profile = {
            "required_skills": required_skills,
            "preferred_skills": preferred_skills,
            "key_responsibilities": key_responsibilities,
            "experience_level": experience_level,
            "years_experience": years_required,
            "technical_focus": self._identify_technical_focus(job_description),
            "domain_knowledge": self._extract_domain_keywords(job_description)
        }
        
        return ideal_profile
    
    def _extract_required_skills(self, job_description: str) -> List[str]:
        """Extract required/must-have skills - Enhanced extraction"""
        skills = []
        
        if not job_description or len(job_description.strip()) < 10:
            return []
        
        # Extract technical skills from entire JD (most reliable)
        tech_skills = self.text_processor.extract_skills(job_description)
        skills.extend(tech_skills)
        
        # Look for explicit required sections with better patterns
        required_patterns = [
            r"(?:required|must have|must know|qualifications?|skills required)[:\s]+(.*?)(?:\n\n|\n(?:[A-Z][a-z]+|Responsibilities|Experience|Education)|$)",
            r"(?:proficiency in|experience with|knowledge of)[:\s]+(.*?)(?:\.|;|\n)",
        ]
        
        for pattern in required_patterns:
            matches = re.finditer(pattern, job_description, re.IGNORECASE | re.DOTALL)
            for match in matches:
                required_text = match.group(1)
                if required_text:
                    skills.extend(self.text_processor.extract_skills(required_text))
        
        # Also extract from bullet points
        bullet_points = re.findall(r'[•\-\*]\s*([^•\-\*\n]+)', job_description)
        for bullet in bullet_points:
            skills.extend(self.text_processor.extract_skills(bullet))
        
        # Extract skills mentioned with common phrases
        skill_phrases = [
            r"(?:python|java|javascript|react|angular|node|sql|aws|docker|kubernetes|machine learning|ai|ml)",
            r"(?:experience with|proficient in|familiar with|knowledge of)\s+([a-z\s]+?)(?:\.|,|;|\n)",
        ]
        
        for phrase in skill_phrases:
            matches = re.finditer(phrase, job_description.lower())
            for match in matches:
                if match.groups():
                    skill_text = match.group(1) if match.groups() else match.group(0)
                    skills.extend(self.text_processor.extract_skills(skill_text))
        
        # Remove duplicates and normalize
        unique_skills = list(set([s.lower().strip() for s in skills if s.strip() and len(s.strip()) > 1]))
        
        # If still no skills found, try extracting from common technical terms in JD
        if not unique_skills:
            # Fallback: extract any technical terms mentioned
            common_tech_terms = [
                "python", "java", "javascript", "react", "angular", "vue", "node", "express",
                "sql", "mysql", "postgresql", "mongodb", "aws", "azure", "gcp", "docker",
                "kubernetes", "git", "linux", "api", "rest", "graphql", "machine learning",
                "ai", "ml", "data science", "backend", "frontend", "full stack"
            ]
            jd_lower = job_description.lower()
            for term in common_tech_terms:
                if term in jd_lower:
                    unique_skills.append(term)
        
        return unique_skills[:30]  # Limit to top 30
    
    def _extract_preferred_skills(self, job_description: str) -> List[str]:
        """Extract preferred/nice-to-have skills"""
        preferred = []
        
        preferred_patterns = [
            r"preferred[:\s]+([^\.]+)",
            r"nice to have[:\s]+([^\.]+)",
            r"bonus[:\s]+([^\.]+)",
            r"plus[:\s]+([^\.]+)",
        ]
        
        for pattern in preferred_patterns:
            matches = re.finditer(pattern, job_description, re.IGNORECASE)
            for match in matches:
                preferred_text = match.group(1)
                preferred.extend(self.text_processor.extract_skills(preferred_text))
        
        return list(set([s.lower().strip() for s in preferred if s.strip()]))[:20]
    
    def _extract_responsibilities(self, job_description: str) -> List[str]:
        """Extract key responsibilities"""
        responsibilities = []
        
        # Look for responsibilities section
        resp_section = re.search(
            r"(?:responsibilities?|duties?|key tasks?)[:\s]+(.*?)(?:\n\n|\n[A-Z]|$)",
            job_description,
            re.IGNORECASE | re.DOTALL
        )
        
        if resp_section:
            resp_text = resp_section.group(1)
            # Split by bullet points or new lines
            lines = re.split(r'[•\-\*]\s*|\n', resp_text)
            responsibilities = [line.strip() for line in lines if len(line.strip()) > 10]
        
        # If no explicit section, extract action-oriented sentences
        if not responsibilities:
            sentences = re.split(r'[.!?]\s+', job_description)
            action_verbs = ['develop', 'design', 'implement', 'build', 'create', 'manage', 'lead', 'collaborate']
            for sentence in sentences:
                if any(verb in sentence.lower() for verb in action_verbs):
                    if len(sentence.strip()) > 20:
                        responsibilities.append(sentence.strip())
        
        return responsibilities[:15]  # Top 15 responsibilities
    
    def _determine_experience_level(self, job_description: str) -> str:
        """Determine experience level: Entry, Mid, Senior, Lead"""
        job_lower = job_description.lower()
        
        if any(word in job_lower for word in ['entry', 'junior', 'fresher', 'graduate', 'intern']):
            return "Entry"
        elif any(word in job_lower for word in ['senior', 'sr.', 'lead', 'principal', 'architect']):
            return "Senior"
        elif any(word in job_lower for word in ['mid', 'intermediate', '2-4 years', '3-5 years']):
            return "Mid"
        else:
            return "Mid"  # Default
    
    def _extract_years_experience(self, job_description: str) -> Optional[float]:
        """Extract required years of experience"""
        patterns = [
            r"(\d+)[\+\-]?\s*years?\s*(?:of\s*)?experience",
            r"(\d+)[\+\-]?\s*yrs?\s*(?:of\s*)?experience",
            r"experience[:\s]+(\d+)[\+\-]?\s*years?",
        ]
        
        for pattern in patterns:
            match = re.search(pattern, job_description, re.IGNORECASE)
            if match:
                return float(match.group(1))
        
        # Try to infer from experience level
        level = self._determine_experience_level(job_description)
        if level == "Entry":
            return 0.0
        elif level == "Mid":
            return 3.0
        elif level == "Senior":
            return 6.0
        
        return None
    
    def _identify_technical_focus(self, job_description: str) -> List[str]:
        """Identify main technical focus areas"""
        focus_areas = []
        
        domain_keywords = {
            "web_development": ["web", "frontend", "backend", "full stack", "react", "angular", "vue"],
            "mobile_development": ["mobile", "ios", "android", "react native", "flutter"],
            "data_science": ["data science", "machine learning", "ml", "ai", "data analysis"],
            "cloud_devops": ["cloud", "aws", "azure", "gcp", "devops", "kubernetes", "docker"],
            "backend": ["backend", "api", "microservices", "server", "rest", "graphql"],
            "frontend": ["frontend", "ui", "ux", "react", "angular", "javascript"],
        }
        
        job_lower = job_description.lower()
        for domain, keywords in domain_keywords.items():
            if any(keyword in job_lower for keyword in keywords):
                focus_areas.append(domain)
        
        return focus_areas if focus_areas else ["general"]
    
    def _extract_domain_keywords(self, job_description: str) -> List[str]:
        """Extract domain-specific keywords"""
        # Extract important nouns and technical terms
        words = re.findall(r'\b[A-Z][a-z]+\b', job_description)
        technical_terms = [w.lower() for w in words if len(w) > 4]
        
        # Common domain keywords
        domain_keywords = [
            "e-commerce", "fintech", "healthcare", "education", "enterprise",
            "startup", "saas", "api", "microservices", "agile", "scrum"
        ]
        
        found_domains = [kw for kw in domain_keywords if kw in job_description.lower()]
        
        return list(set(technical_terms[:10] + found_domains))


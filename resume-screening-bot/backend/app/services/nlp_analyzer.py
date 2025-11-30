from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer
import numpy as np
from typing import Dict, List, Tuple

class NLPAnalyzer:
    """NLP analysis engine for resume-job matching"""
    
    def __init__(self):
        # Initialize Sentence-BERT for semantic embeddings
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.tfidf_vectorizer = TfidfVectorizer(stop_words='english', max_features=1000)
    
    def compute_semantic_similarity(self, text1: str, text2: str) -> float:
        """Compute semantic similarity between two texts using Sentence-BERT"""
        embeddings = self.model.encode([text1, text2])
        similarity = cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]
        return float(similarity)
    
    def compute_tfidf_similarity(self, text1: str, text2: str) -> float:
        """Compute TF-IDF based similarity"""
        tfidf_matrix = self.tfidf_vectorizer.fit_transform([text1, text2])
        similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        return float(similarity)
    
    def extract_keywords(self, text: str, top_n: int = 20) -> List[str]:
        """Extract top keywords from text using TF-IDF"""
        tfidf = self.tfidf_vectorizer.fit_transform([text])
        indices = tfidf.toarray()[0].argsort()[-top_n:][::-1]
        keywords = [self.tfidf_vectorizer.get_feature_names_out()[i] for i in indices]
        return keywords
    
    def match_skills(self, resume_skills: List[str], job_skills: List[str]) -> Dict:
        """Match skills between resume and job requirements"""
        resume_skills_lower = [s.lower() for s in resume_skills]
        job_skills_lower = [s.lower() for s in job_skills]
        
        matched_skills = list(set(resume_skills_lower) & set(job_skills_lower))
        missing_skills = list(set(job_skills_lower) - set(resume_skills_lower))
        extra_skills = list(set(resume_skills_lower) - set(job_skills_lower))
        
        return {
            "matched": matched_skills,
            "missing": missing_skills,
            "extra": extra_skills,
            "match_percentage": len(matched_skills) / len(job_skills_lower) * 100 if job_skills_lower else 0
        }
    
    def compute_relevance_score(self, resume_text: str, job_description: str, weights: Dict = None) -> Dict:
        """Compute comprehensive relevance score between resume and job"""
        if weights is None:
            weights = {
                "semantic": 0.4,
                "tfidf": 0.3,
                "skill_match": 0.3
            }
        
        # Compute semantic similarity
        semantic_score = self.compute_semantic_similarity(resume_text, job_description)
        
        # Compute TF-IDF similarity
        tfidf_score = self.compute_tfidf_similarity(resume_text, job_description)
        
        # Normalize scores to 0-1 range
        semantic_score = max(0, min(1, semantic_score))
        tfidf_score = max(0, min(1, tfidf_score))
        
        # Combine scores
        combined_score = (
            weights["semantic"] * semantic_score +
            weights["tfidf"] * tfidf_score
        )
        
        return {
            "semantic_score": semantic_score,
            "tfidf_score": tfidf_score,
            "combined_score": combined_score
        }
    
    def analyze_experience(self, resume_text: str, required_experience: int = None) -> Dict:
        """Analyze work experience in resume"""
        # Simple heuristic to extract years of experience
        import re
        
        years_pattern = r'(\d+)\s*(?:years?|yrs?)'
        matches = re.findall(years_pattern, resume_text, re.IGNORECASE)
        
        if matches:
            years = [int(m) for m in matches]
            total_years = sum(years) / len(years) if years else 0
        else:
            total_years = 0
        
        experience_match = True
        if required_experience:
            experience_match = total_years >= required_experience
        
        return {
            "estimated_years": total_years,
            "meets_requirement": experience_match,
            "experience_mentions": len(matches)
        }
    
    def calculate_ats_readability_score(self, text: str) -> float:
        """Calculate how ATS-friendly the text is"""
        score = 100
        
        # Check for excessive special characters
        special_chars = sum(1 for c in text if not c.isalnum() and not c.isspace())
        if special_chars > len(text) * 0.2:
            score -= 10
        
        # Check for tables (generally bad for ATS)
        if '|' in text:
            score -= 5
        
        # Check text density (very short or very long is bad)
        lines = text.split('\n')
        if len(lines) < 5 or len(lines) > 200:
            score -= 10
        
        # Check for common formatting issues
        if '\t' in text:
            score -= 5
        
        return max(0, min(100, score))
    
    def get_missing_keywords(self, resume_text: str, job_description: str, threshold: float = 0.3) -> List[str]:
        """Get important keywords from job that are missing in resume"""
        job_keywords = self.extract_keywords(job_description, top_n=30)
        resume_lower = resume_text.lower()
        
        missing = []
        for keyword in job_keywords:
            if keyword.lower() not in resume_lower:
                missing.append(keyword)
        
        return missing[:10]  # Return top 10 missing keywords

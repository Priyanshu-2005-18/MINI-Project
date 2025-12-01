# Job Description Analysis - Code Location & Explanation

## 📍 Main File Location
**File:** `backend/app/services/job_analyzer.py`

This is the **primary file** that extracts and understands job descriptions.

---

## 🔍 What It Does

The `JobDescriptionAnalyzer` class extracts and understands job descriptions by analyzing:

### 1. **Required Skills Extraction** (Lines 50-104)
- Uses regex patterns to find "required" or "must have" sections
- Extracts skills mentioned with phrases like "experience with", "proficient in"
- Searches through bullet points for skill mentions
- Has a fallback list of common tech terms

**Example Pattern:**
```python
r"(?:required|must have|must know|qualifications?|skills required)[:\s]+(.*?)(?:\n\n|\n(?:[A-Z]|Responsibilities)|$)"
```

### 2. **Preferred Skills Extraction** (Lines 106-118)
- Finds "nice to have", "preferred", "bonus", or "plus" sections
- Extracts optional skills candidates should ideally have

### 3. **Responsibilities Extraction** (Lines 120-145)
- Looks for "Responsibilities" or "Duties" section
- Extracts action-oriented sentences (with verbs like develop, design, build)
- Returns top 15 key responsibilities

### 4. **Experience Level Detection** (Lines 147-155)
- Determines if role is: Entry, Mid, or Senior
- Looks for keywords like "junior", "senior", "lead", "architect"

### 5. **Years of Experience Extraction** (Lines 157-178)
- Uses regex to find explicit year requirements
- Examples: "3+ years", "5 years experience"
- Infers from experience level if not explicitly mentioned

### 6. **Technical Focus Identification** (Lines 180-203)
- Categorizes job into domain areas:
  - Web Development
  - Mobile Development
  - Data Science
  - Cloud/DevOps
  - Backend
  - Frontend

### 7. **Domain Keywords Extraction** (Lines 205-233)
- Extracts technical terms and domain-specific keywords
- Examples: "fintech", "e-commerce", "microservices", "agile"

---

## 🔗 How It's Used

### Route File: `backend/app/routes/analysis_routes.py` (Lines 1-50)

When you analyze a resume against a job, the flow is:

```python
# Step 1: Get job description from database
job = db.query(JobPosting).filter(JobPosting.id == job_id).first()
job_description = job.description

# Step 2: Analyze the job description
from app.services.advanced_matcher import AdvancedResumeMatcher
match_result = advanced_matcher.match_resume_to_job(
    resume_data=resume_data,
    job_description=job_description
)
```

### Advanced Matcher File: `backend/app/services/advanced_matcher.py`

This file uses `JobDescriptionAnalyzer` internally to:
1. Parse job requirements
2. Compare resume skills against job requirements
3. Calculate match percentage
4. Identify gaps

---

## 📊 Output Example

When analyzing a job description like:

**Input:**
```
"Senior Python Developer needed. 
Requirements: 5+ years Python, FastAPI, PostgreSQL, Docker, Kubernetes.
Nice to have: AWS, Machine Learning.
Responsibilities: Design APIs, manage databases, lead team.
Experience level: Senior"
```

**Output:**
```json
{
  "required_skills": ["python", "fastapi", "postgresql", "docker", "kubernetes"],
  "preferred_skills": ["aws", "machine learning"],
  "years_experience": 5.0,
  "experience_level": "Senior",
  "key_responsibilities": [
    "Design APIs",
    "manage databases", 
    "lead team"
  ],
  "technical_focus": ["backend", "cloud_devops"],
  "domain_knowledge": ["microservices", "api"]
}
```

---

## 📂 Related Files

1. **`backend/app/services/text_processor.py`** - Helper to extract skills from text
2. **`backend/app/services/advanced_matcher.py`** - Matches resume against parsed job requirements
3. **`backend/app/routes/analysis_routes.py`** - API endpoint that triggers analysis
4. **`backend/app/routes/job_routes.py`** - Stores job descriptions

---

## 🔧 How to Test It

### Using the API:

1. **Create a job posting:**
```bash
POST /api/jobs/create
{
  "user_id": 1,
  "title": "Python Developer",
  "description": "Required: 5+ years Python, FastAPI, PostgreSQL..."
}
```

2. **Analyze resume against job:**
```bash
POST /api/analysis/analyze-resume-job
{
  "resume_id": 1,
  "job_id": 1
}
```

---

## 🎯 Key Takeaway

**The system understands job descriptions by:**
- ✅ Parsing text with regex patterns
- ✅ Extracting structured data (skills, experience, responsibilities)
- ✅ Categorizing information (required vs preferred, technical focus)
- ✅ Comparing against resume data to find matches and gaps

This ensures her team has accurate, extracted job requirements for matching!

# Resume Screening Bot - API Reference

## Base URL
```
http://localhost:8000/api
```

## Authentication (Ready to Implement)
Currently endpoints are open. To enable authentication, uncomment JWT code in routes.

## Resume Endpoints

### Upload Single Resume
**POST** `/resumes/upload`

Request:
```bash
curl -X POST "http://localhost:8000/api/resumes/upload" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@resume.pdf" \
  -F "user_id=1"
```

Response:
```json
{
  "id": 1,
  "filename": "resume.pdf",
  "parsed_data": {
    "personal_info": {"email": "user@example.com"},
    "education": ["B.Tech Computer Science"],
    "technical_skills": ["Python", "Java", "SQL"]
  },
  "extracted_skills": ["Python", "Java", "SQL"],
  "message": "Resume uploaded and parsed successfully"
}
```

### Bulk Upload Resumes
**POST** `/resumes/bulk-upload`

Request:
```bash
curl -X POST "http://localhost:8000/api/resumes/bulk-upload" \
  -H "Content-Type: multipart/form-data" \
  -F "files=@resume1.pdf" \
  -F "files=@resume2.docx" \
  -F "user_id=1"
```

Response:
```json
{
  "total_files": 2,
  "successful": 2,
  "failed": 0,
  "results": [
    {"id": 1, "filename": "resume1.pdf", "status": "success"},
    {"id": 2, "filename": "resume2.docx", "status": "success"}
  ]
}
```

### Get Resume Details
**GET** `/resumes/{resume_id}`

Response:
```json
{
  "id": 1,
  "filename": "resume.pdf",
  "file_path": "uploads/resume.pdf",
  "ats_score": 85.5,
  "uploaded_at": "2024-01-15T10:30:00",
  "parsed_data": {...}
}
```

### Get User Resumes
**GET** `/resumes/user/{user_id}/resumes`

Response:
```json
[
  {
    "id": 1,
    "filename": "resume1.pdf",
    "ats_score": 85.5,
    "uploaded_at": "2024-01-15T10:30:00"
  }
]
```

### Delete Resume
**DELETE** `/resumes/{resume_id}`

## Job Endpoints

### Create Job Posting
**POST** `/jobs/create`

Request:
```json
{
  "title": "Senior Python Developer",
  "description": "Looking for experienced Python developer...",
  "required_skills": ["Python", "Django", "PostgreSQL"],
  "nice_to_have_skills": ["AWS", "Docker"],
  "experience_level": "Senior",
  "salary_range": "100k-150k",
  "user_id": 1
}
```

Response:
```json
{
  "id": 1,
  "title": "Senior Python Developer",
  "required_skills": ["Python", "Django", "PostgreSQL"],
  "created_at": "2024-01-15T10:30:00"
}
```

### Get Job Details
**GET** `/jobs/{job_id}`

### Get User Jobs
**GET** `/jobs/user/{user_id}/jobs`

### Update Job
**PUT** `/jobs/{job_id}`

### Delete Job
**DELETE** `/jobs/{job_id}`

## Analysis Endpoints

### Analyze Single Resume Against Job
**POST** `/analysis/analyze-resume-job`

Request:
```json
{
  "resume_id": 1,
  "job_id": 1
}
```

Response:
```json
{
  "analysis_id": 1,
  "overall_score": 82.5,
  "relevance_score": 85.0,
  "skill_match_percentage": 78.0,
  "matched_skills": ["Python", "PostgreSQL"],
  "missing_skills": ["Docker", "AWS"],
  "extra_skills": ["Java"],
  "recommendations": [
    "Consider learning Docker for better job fit",
    "Your Python skills are excellent!"
  ]
}
```

### Bulk Analyze Resumes
**POST** `/analysis/bulk-analyze`

Request:
```json
{
  "resume_ids": [1, 2, 3],
  "job_id": 1
}
```

Response:
```json
{
  "total_resumes": 3,
  "analyzed": 3,
  "average_score": 78.3,
  "results": [
    {
      "resume_id": 1,
      "filename": "resume1.pdf",
      "overall_score": 82.5,
      "skill_match": 78.0
    }
  ]
}
```

### Calculate ATS Score
**POST** `/analysis/calculate-ats-score`

Request:
```json
{
  "resume_id": 1
}
```

Response:
```json
{
  "resume_id": 1,
  "ats_score": 85.5,
  "section_scores": {
    "education": 80.0,
    "experience": 90.0,
    "technical_skills": 85.0,
    "formatting": 75.0,
    "keywords": 88.0
  },
  "recommendations": [...]
}
```

### Get Analysis Result
**GET** `/analysis/analysis-results/{analysis_id}`

### Get Resume Analyses
**GET** `/analysis/resume/{resume_id}/analyses`

## Voice Endpoints

### Transcribe Audio File
**POST** `/voice/transcribe-file`

Request (multipart form):
```bash
curl -X POST "http://localhost:8000/api/voice/transcribe-file" \
  -F "file=@audio.wav"
```

Response:
```json
{
  "transcribed_text": "I need a senior Python developer with 5 years experience",
  "confidence": 0.95
}
```

### Text to Speech
**POST** `/voice/text-to-speech`

Request:
```json
{
  "text": "Your resume has been successfully analyzed",
  "voice_rate": 150
}
```

Response: Audio file (MP3)

### Summarize Resume with Voice
**POST** `/voice/summarize-resume-voice`

Request:
```json
{
  "resume_id": 1
}
```

Response: Audio summary

### Process Job Description Voice
**POST** `/voice/job-description-voice`

Request (multipart form):
```bash
curl -X POST "http://localhost:8000/api/voice/job-description-voice" \
  -F "file=@job_description.wav"
```

Response:
```json
{
  "job_description": "We are looking for...",
  "confidence": 0.92
}
```

### Check Voice Features
**GET** `/voice/voice-enabled`

Response:
```json
{
  "voice_enabled": true,
  "google_cloud_enabled": false
}
```

## Student Endpoints

### Evaluate Resume
**POST** `/students/evaluate-resume`

Request:
```json
{
  "resume_id": 1,
  "user_id": 1
}
```

Response:
```json
{
  "resume_id": 1,
  "ats_score": 85.5,
  "skills_identified": ["Python", "Java", "SQL"],
  "recommendations": [...]
}
```

### Get Career Fit
**POST** `/students/career-fit`

Response:
```json
{
  "estimated_experience_years": 3.5,
  "top_role_matches": [
    {
      "role": "Python Developer",
      "match_percentage": 85.0,
      "matched_skills": ["Python", "Django"]
    }
  ],
  "top_company_fits": [
    {
      "company_type": "Tech Startups",
      "match_percentage": 90.0
    }
  ]
}
```

### Analyze Skill Gaps
**POST** `/students/skill-gap-analysis`

Request:
```json
{
  "resume_id": 1,
  "target_role": "Python Developer"
}
```

Response:
```json
{
  "target_role": "Python Developer",
  "matched_skills": ["Python"],
  "missing_skills": ["Django", "PostgreSQL"],
  "completion_percentage": 50.0,
  "skill_gap_analysis": {
    "learning_path": [
      {"skill": "Django", "priority": "high"},
      {"skill": "PostgreSQL", "priority": "high"}
    ]
  }
}
```

### Generate Career Path
**POST** `/students/career-path`

Response:
```json
{
  "current_level": "Junior",
  "recommended_next_roles": [...],
  "skill_priorities": ["Cloud", "DevOps", "ML"],
  "career_trajectory": [
    {"year": "0-2", "target": "Junior Python Developer"},
    {"year": "2-4", "target": "Mid-level Full Stack Developer"}
  ]
}
```

### Get Resume Improvement Tips
**POST** `/students/improve-resume`

Response:
```json
{
  "resume_id": 1,
  "improvement_count": 3,
  "improvements": [
    {
      "section": "Technical Skills",
      "issue": "Limited skills listed",
      "tip": "Add at least 5-10 relevant technical skills"
    }
  ],
  "ats_score": 65.0,
  "priority": "high"
}
```

### Get Student Profile
**GET** `/students/student-profile/{user_id}`

Response:
```json
{
  "id": 1,
  "skills": ["Python", "Java"],
  "education": ["B.Tech Computer Science"],
  "experience": [...],
  "ats_score": 85.5,
  "skill_gaps": ["Docker", "Kubernetes"],
  "recommended_roles": ["Python Developer"],
  "created_at": "2024-01-01T00:00:00"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Invalid file type. Only PDF, DOCX, and TXT are supported."
}
```

### 404 Not Found
```json
{
  "detail": "Resume not found"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error message"
}
```

## Rate Limiting
Currently not implemented. Can be added using FastAPI middleware.

## Pagination
Bulk endpoints return all results. Can implement pagination using skip/limit parameters.

## CORS
Frontend at http://localhost:3000 is allowed by default.

---

**For interactive API documentation, visit: http://localhost:8000/docs**

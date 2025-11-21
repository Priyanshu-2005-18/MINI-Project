# Resume Screening Bot with NLP and Voice Assistance

A comprehensive AI-powered resume screening and analysis system that combines Natural Language Processing (NLP), Machine Learning, and Voice Interaction Technologies to revolutionize the recruitment process.

## Features

### For HR Teams
- **Bulk Resume Upload**: Upload single or multiple resumes at once
- **Intelligent Screening**: AI-powered resume analysis and ranking
- **ATS Score Calculation**: Evaluate how well resumes pass ATS filters
- **Skills Matching**: Identify matched, missing, and extra skills
- **Voice Assistance**: Speak job descriptions and receive audio summaries
- **Detailed Analytics**: Visual insights into candidate-job fit

### For Students
- **Resume Evaluation**: Get ATS scores and improvement recommendations
- **Career Fit Analysis**: Discover suitable roles and companies based on your profile
- **Skill Gap Analysis**: Identify missing skills for target roles
- **Career Path Generation**: Get a personalized career development roadmap
- **Resume Improvement Tips**: Specific suggestions to make your resume better

### Technical Features
- **NLP-Based Analysis**: Semantic understanding using Sentence-BERT
- **Text Preprocessing**: Advanced text cleaning and tokenization with SpaCy
- **Voice-Enabled Interface**: Google Cloud Speech-to-Text and Text-to-Speech
- **RESTful API**: FastAPI backend with comprehensive endpoints
- **Modern UI**: React-based responsive frontend with Tailwind CSS
- **Database Support**: PostgreSQL, MongoDB, or SQLite

## Project Structure

```
resume-screening-bot/
├── backend/
│   ├── app/
│   │   ├── models/          # SQLAlchemy database models
│   │   ├── routes/          # API endpoints
│   │   ├── services/        # Business logic
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── utils/           # Helper utilities
│   │   ├── main.py          # FastAPI app initialization
│   │   ├── config.py        # Configuration settings
│   │   └── database.py      # Database setup
│   ├── requirements.txt     # Python dependencies
│   └── .env.example         # Environment variables template
│
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API client
│   │   ├── utils/           # Helper functions
│   │   ├── App.js           # Main app component
│   │   └── index.js         # Entry point
│   ├── public/              # Static files
│   ├── package.json         # Node dependencies
│   └── .env                 # Environment variables
│
└── README.md
```

## Installation & Setup

### Backend Setup

1. **Create virtual environment:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies:**
```bash
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

3. **Setup environment:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Run the server:**
```bash
uvicorn app.main:app --reload
```

Backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Install dependencies:**
```bash
cd frontend
npm install
```

2. **Run the development server:**
```bash
npm start
```

Frontend will be available at `http://localhost:3000`

## API Endpoints

### Resume Management
- `POST /api/resumes/upload` - Upload single resume
- `POST /api/resumes/bulk-upload` - Upload multiple resumes
- `GET /api/resumes/{resume_id}` - Get resume details
- `DELETE /api/resumes/{resume_id}` - Delete resume

### Job Management
- `POST /api/jobs/create` - Create job posting
- `GET /api/jobs/{job_id}` - Get job details
- `PUT /api/jobs/{job_id}` - Update job
- `DELETE /api/jobs/{job_id}` - Delete job

### Analysis
- `POST /api/analysis/analyze-resume-job` - Analyze resume against job
- `POST /api/analysis/bulk-analyze` - Analyze multiple resumes
- `POST /api/analysis/calculate-ats-score` - Calculate ATS score

### Voice Services
- `POST /api/voice/transcribe-file` - Transcribe audio to text
- `POST /api/voice/text-to-speech` - Convert text to speech
- `POST /api/voice/job-description-voice` - Process voice job description

### Student Tools
- `POST /api/students/evaluate-resume` - Evaluate resume
- `POST /api/students/career-fit` - Get career fit recommendations
- `POST /api/students/skill-gap-analysis` - Analyze skill gaps
- `POST /api/students/career-path` - Generate career path

## Technology Stack

### Backend
- **Framework**: FastAPI
- **Database**: SQLAlchemy (PostgreSQL/MongoDB/SQLite)
- **NLP**: SpaCy, NLTK, Scikit-learn, Sentence-BERT
- **Voice**: SpeechRecognition, pyttsx3, Google Cloud APIs
- **PDF/DOCX Parsing**: PyPDF2, pdfplumber, python-docx

### Frontend
- **Library**: React 18
- **Styling**: Tailwind CSS
- **Charts**: Chart.js, Recharts
- **HTTP Client**: Axios
- **Icons**: React Icons
- **Notifications**: React Toastify

## Configuration

### Backend Configuration (.env)

```env
DATABASE_URL=sqlite:///./test.db
MONGODB_URL=mongodb://localhost:27017
VOICE_ENABLED=true
DEBUG=false
SECRET_KEY=your-secret-key
```

### Frontend Configuration (.env)

```env
REACT_APP_API_URL=http://localhost:8000/api
```

## Usage Examples

### For HR Teams

1. Navigate to HR Dashboard
2. Upload resumes (single or bulk)
3. Enter job description or speak it using voice
4. Click "Analyze Resumes" to get ranked candidates
5. Review detailed skill analysis and recommendations

### For Students

1. Go to Student Career Tools
2. Upload your resume
3. Get ATS score and improvement tips
4. Explore career recommendations
5. Analyze skill gaps for target roles
6. Generate personalized career path

## Database Models

### User
- id, username, email, hashed_password, full_name, is_active, user_type, created_at

### Resume
- id, user_id, filename, file_path, raw_text, parsed_data, ats_score, uploaded_at

### JobPosting
- id, user_id, title, description, required_skills, nice_to_have_skills, experience_level, created_at

### AnalysisResult
- id, user_id, resume_id, job_id, overall_score, skills_matched, skills_missing, extra_skills, recommendations, created_at

### StudentCareerProfile
- id, user_id, resume_id, skills, education, experience, ats_score, skill_gaps, recommended_roles, recommended_companies

## Features in Detail

### NLP Analysis
- **Semantic Similarity**: Uses Sentence-BERT for context-aware matching
- **TF-IDF Analysis**: Keyword extraction and comparison
- **Named Entity Recognition**: Extracts organizations, locations, people
- **Skill Extraction**: Identifies technical skills from text

### ATS Scoring
- Evaluates formatting and completeness
- Checks keyword density
- Analyzes section structure
- Verifies ATS compatibility

### Career Recommendations
- Role matching based on skills
- Company culture fit analysis
- Skill gap identification
- Learning path generation
- Certification recommendations

### Voice Features
- Real-time speech-to-text conversion
- Text-to-speech summaries
- Voice job description input
- Audio resume summaries

## Performance Optimization

- Lazy loading of NLP models
- Caching of similarity calculations
- Batch processing for multiple resumes
- Database indexing on frequently queried fields

## Security Features

- Password hashing with bcrypt
- JWT token authentication (ready to implement)
- CORS protection
- Input validation with Pydantic
- SQL injection prevention with SQLAlchemy

## Future Enhancements

- Multi-language support
- Advanced video resume analysis
- Predictive hiring analytics
- LinkedIn integration
- Real-time job market insights
- Chatbot HR assistant
- Mobile app support

## Troubleshooting

### Issue: SpaCy model not found
```bash
python -m spacy download en_core_web_sm
```

### Issue: Port already in use
```bash
# Change port in backend
uvicorn app.main:app --reload --port 8001
```

### Issue: CORS errors
Ensure backend CORS origins include frontend URL in `app/main.py`

## Contributing

1. Fork the repository
2. Create feature branch
3. Make improvements
4. Submit pull request

## License

MIT License - feel free to use for personal and commercial projects

## Support

For issues and questions:
- Create GitHub issues
- Check documentation
- Review API docs at `/docs` (FastAPI Swagger UI)

## Contact

For more information, visit the project repository or contact the development team.

---

**Made with ❤️ for modern recruitment**

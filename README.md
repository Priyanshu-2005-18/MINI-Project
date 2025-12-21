# 🤖 Resume Screening Bot  
### AI-Powered Resume Analysis & Career Development Platform

<p align="center">
  <img src="assets/banner.png" alt="Resume Screening Bot Banner" width="90%">
</p>

An end-to-end **AI-driven resume screening and career guidance platform** built for **HR teams, recruiters, and students**.  
The system leverages **Natural Language Processing (NLP)**, **Machine Learning**, and **semantic similarity models** to automate resume screening, ATS evaluation, job matching, and long-term career planning.

---

## 🖼️ Project Screenshots

> 📌 Replace the image files inside the `assets/` folder with actual screenshots from your project.

### 🏠 Landing Page
<p align="center">
  <img src="assets/home.png" alt="Landing Page" width="85%">
</p>

### 📄 Resume Upload & Management
<p align="center">
  <img src="assets/resume-upload.png" alt="Resume Upload" width="85%">
</p>

### 📊 Resume Analysis & Candidate Ranking
<p align="center">
  <img src="assets/analysis.png" alt="Resume Analysis" width="85%">
</p>

### 🎓 Career Roadmap & Skill Gap Analysis
<p align="center">
  <img src="assets/career-roadmap.png" alt="Career Roadmap" width="85%">
</p>

---

## 🚀 Technology Stack

### Backend
- FastAPI  
- SQLAlchemy  
- Sentence-BERT  
- SpaCy  
- NLTK  
- Scikit-learn  
- TensorFlow  

### Frontend
- React 18  
- Tailwind CSS  
- Axios  
- React Icons  

### Database
- PostgreSQL (Production)  
- SQLite (Development)  

### Others
- PyPDF2, pdfplumber (PDF parsing)  
- Node.js (Frontend server)  
- Uvicorn (ASGI server)

---

## ✨ Key Features

### 👔 For HR Teams & Recruiters
- Bulk resume upload (PDF/DOCX)
- AI-powered resume screening (up to 98% accuracy)
- Intelligent candidate ranking system
- ATS compatibility score (0–100)
- Resume–job semantic matching
- Skill gap identification
- Visual analytics dashboard
- Resume preview & PDF download

### 🎓 For Students & Job Seekers
- Resume evaluation with ATS feedback
- Career fit & role recommendations
- Skill gap analysis with learning paths
- Personalized 5–15 year career roadmap
- Salary growth estimation
- Curated learning resources
- Actionable short-term & long-term goals

---

## 🧠 Resume Matching Algorithm

```text
Final Score =
(Core Skills × 45%) +
(Experience × 25%) +
(Keywords × 20%) +
(Projects × 10%)
---
## 📁 Project Structure
resume-screening-bot/
├── backend/
│   ├── app/
│   │   ├── models/        # Database models
│   │   ├── routes/        # API endpoints
│   │   ├── services/      # NLP, ATS & matching logic
│   │   ├── utils/         # Career & scoring utilities
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── main.py        # FastAPI entry point
│   │   └── database.py
│   ├── requirements.txt
│   └── uploads/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.js
│   ├── server.js
│   └── package.json
│
├── assets/               # Images & screenshots
├── README.md
└── .gitignore
---
##⚡ Installation & Quick Start
Prerequisites
Python 3.9+
Node.js 14+
Git
PostgreSQL (optional)
---
## 🔧 Backend Setup
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
uvicorn app.main:app --reload
Backend URL: http://localhost:8000
API Docs: http://localhost:8000/docs
---
## 🎨 Frontend Setup
cd frontend
npm install
npm run build
node server.js
node server.js
Frontend URL: http://localhost:3001
---
## 📡 API Endpoints
Resume Management

POST /api/resumes/upload

GET /api/resumes/{id}

DELETE /api/resumes/{id}

Job Management

POST /api/jobs/create

GET /api/jobs/{id}

PUT /api/jobs/{id}

Analysis

POST /api/analysis/screen-resumes

POST /api/analysis/compare

POST /api/analysis/calculate-ats-score

Student Tools

POST /api/students/evaluate-resume

POST /api/students/career-fit

POST /api/students/skill-gap-analysis

POST /api/students/career-path
---

## 📊 Performance Metrics

Resume analysis time: 2–5 seconds

Matching accuracy: 98%

Bulk processing: 100+ resumes

API response time: <200ms
---
## 🔐 Environment Variables
Backend (.env)
DATABASE_URL=postgresql://user:password@localhost/resume_db
SECRET_KEY=your-secret-key
Frontend (.env)
REACT_APP_API_URL=http://localhost:8000
---
## 🛠 Future Enhancements

Multi-language resume support

Video interview analysis

Advanced BERT-based models

Job portal integrations (LinkedIn, Indeed)

Mobile applications (Android / iOS)

Real-time analytics dashboard
---

## 🤝 Contributing

Fork the repository

Create a feature branch

Commit your changes

Push to the branch

Open a Pull Request
---

## 📜 License

MIT License
---
## 👨‍💻 Author

Priyanshu
GitHub: @Priyanshu-2005-18

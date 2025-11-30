# Resume Screening Bot - Setup & Installation Guide

## Quick Start

### Prerequisites
- Python 3.9 or higher
- Node.js 14 or higher
- pip (Python package manager)
- npm (Node package manager)

## Backend Setup (FastAPI)

### Step 1: Navigate to Backend
```bash
cd backend
```

### Step 2: Create Virtual Environment
```bash
# On Windows
python -m venv venv
venv\Scripts\activate

# On macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Download SpaCy Model
```bash
python -m spacy download en_core_web_sm
```

### Step 5: Setup Environment Variables
```bash
# Copy example file
cp .env.example .env

# Edit .env with your settings
# Important: Change SECRET_KEY to a random string
```

### Step 6: Initialize Database
```bash
# Create uploads directory
mkdir uploads

# Database will auto-initialize on first run with SQLite
```

### Step 7: Run Backend Server
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: `http://localhost:8000`
API Documentation: `http://localhost:8000/docs`

## Frontend Setup (React)

### Step 1: Navigate to Frontend
```bash
cd frontend
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Start Development Server
```bash
npm start
```

Frontend will be available at: `http://localhost:3000`

## Verify Installation

### Backend Health Check
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{"status": "healthy"}
```

### Test API Endpoints
- Visit `http://localhost:8000/docs` for interactive API documentation
- Try the test endpoints

## Advanced Configuration

### Using PostgreSQL Instead of SQLite

1. Install PostgreSQL
2. Create database:
```bash
createdb resume_bot
```

3. Update `.env`:
```
DATABASE_URL=postgresql://user:password@localhost/resume_bot
```

4. Install PostgreSQL driver:
```bash
pip install psycopg2-binary
```

### Using MongoDB

1. Install MongoDB or use MongoDB Atlas
2. Update `.env`:
```
MONGODB_URL=mongodb+srv://user:password@cluster.mongodb.net/database
```

### Enable Google Cloud Voice Services

1. Create Google Cloud project
2. Enable Speech-to-Text and Text-to-Speech APIs
3. Create service account and download JSON key
4. Set environment variable:
```bash
export GOOGLE_APPLICATION_CREDENTIALS="path/to/key.json"
```

5. Update `.env`:
```
GOOGLE_SPEECH_API_ENABLED=true
```

## Troubleshooting

### Issue: ModuleNotFoundError for spacy
**Solution:**
```bash
python -m spacy download en_core_web_sm
```

### Issue: Port 8000 already in use
**Solution:**
```bash
# Use different port
uvicorn app.main:app --reload --port 8001
```

### Issue: npm install fails
**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Install again
npm install
```

### Issue: CORS errors in frontend
**Solution:**
Ensure backend CORS origins include frontend URL in `app/main.py`:
```python
origins = [
    "http://localhost:3000",
    # Add other origins as needed
]
```

### Issue: Database errors
**Solution:**
```bash
# Reset SQLite database
rm test.db

# The database will be recreated on next run
```

## Production Deployment

### Backend (using Gunicorn)

```bash
pip install gunicorn
gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Frontend (build for production)

```bash
npm run build
# This creates an optimized build in the 'build' folder
```

### Using Docker

Create a `Dockerfile` for backend:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:
```bash
docker build -t resume-bot-backend .
docker run -p 8000:8000 resume-bot-backend
```

## Testing

### Backend Tests
```bash
# Install pytest
pip install pytest pytest-asyncio

# Run tests
pytest
```

### Frontend Tests
```bash
npm test
```

## Performance Tips

1. **Use production dependencies**: Remove dev dependencies for smaller bundles
2. **Enable caching**: Configure Redis for session/query caching
3. **Database indexing**: Add indexes on frequently queried fields
4. **CDN**: Serve static assets from CDN
5. **API optimization**: Use pagination for large result sets

## Security Checklist

- [ ] Change SECRET_KEY in production
- [ ] Use HTTPS in production
- [ ] Set DEBUG=false in production
- [ ] Use strong database passwords
- [ ] Enable CORS only for allowed origins
- [ ] Use environment variables for sensitive data
- [ ] Implement rate limiting
- [ ] Add authentication middleware

## Getting Help

### Resources
- FastAPI Documentation: https://fastapi.tiangolo.com/
- React Documentation: https://react.dev/
- SpaCy Documentation: https://spacy.io/
- SQLAlchemy Documentation: https://www.sqlalchemy.org/

### Common Issues Forum
Check GitHub issues or create a new one with:
- Error message
- Steps to reproduce
- System information (OS, Python version, etc.)

## Next Steps

1. Test the application with sample resumes
2. Customize the skills database in `career_recommender.py`
3. Add authentication (JWT implementation ready)
4. Connect to production database
5. Deploy to cloud (AWS, GCP, Azure, etc.)

---

**Need more help?** Check the README.md for architecture details and feature documentation.

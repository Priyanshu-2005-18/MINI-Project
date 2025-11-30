import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # Database
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")
    MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    
    # API Keys
    GOOGLE_CLOUD_API_KEY = os.getenv("GOOGLE_CLOUD_API_KEY", "")
    
    # File Upload
    UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "uploads/")
    MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10MB
    ALLOWED_EXTENSIONS = {"pdf", "docx", "doc", "txt"}
    
    # NLP Models
    SPACY_MODEL = "en_core_web_sm"
    SENTENCE_BERT_MODEL = "all-MiniLM-L6-v2"
    
    # Voice
    VOICE_ENABLED = os.getenv("VOICE_ENABLED", "true").lower() == "true"
    GOOGLE_SPEECH_API_ENABLED = os.getenv("GOOGLE_SPEECH_API_ENABLED", "false").lower() == "true"
    
    # Security
    SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 30
    
    # App
    DEBUG = os.getenv("DEBUG", "false").lower() == "true"
    APP_NAME = "Resume Screening Bot"

settings = Settings()

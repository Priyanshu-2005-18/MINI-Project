from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.voice_service import VoiceAssistant
import io

router = APIRouter()
voice_assistant = None

def get_voice_assistant():
    global voice_assistant
    if voice_assistant is None:
        voice_assistant = VoiceAssistant()
    return voice_assistant

@router.post("/transcribe-file")
async def transcribe_audio_file(file: UploadFile = File(...)):
    """Transcribe audio file to text"""
    try:
        voice_assistant = get_voice_assistant()
        # Save uploaded audio file temporarily
        import tempfile
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name
        
        # Transcribe
        text, confidence = voice_assistant.transcribe_audio_file(tmp_path)
        
        # Clean up
        import os
        os.remove(tmp_path)
        
        if not text:
            raise HTTPException(status_code=400, detail="Could not transcribe audio")
        
        return {
            "transcribed_text": text,
            "confidence": confidence
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/text-to-speech")
async def text_to_speech(text: str, voice_rate: int = 150):
    """Convert text to speech"""
    try:
        voice_assistant = get_voice_assistant()
        voice_assistant.set_voice_properties(rate=voice_rate)
        
        import tempfile
        import os
        
        # Create temporary file for output
        tmp_dir = tempfile.gettempdir()
        output_path = os.path.join(tmp_dir, "output.mp3")
        
        # Generate speech
        voice_assistant.text_to_speech(text, output_path)
        
        # Read and return audio
        with open(output_path, 'rb') as f:
            audio_bytes = f.read()
        
        # Clean up
        os.remove(output_path)
        
        return {
            "audio": audio_bytes,
            "content_type": "audio/mpeg",
            "message": "Text converted to speech successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/summarize-resume-voice")
async def summarize_resume_voice(resume_id: int, db_session = None):
    """Generate voice summary of resume"""
    try:
        voice_assistant = get_voice_assistant()
        # Get resume from database
        from sqlalchemy.orm import Session
        from app.database import get_db
        from app.models.models import Resume
        
        # For now, return a template
        summary = f"Resume ID {resume_id} contains technical skills in Python, JavaScript, and SQL. The candidate has 5 years of experience in full stack development. Education includes a bachelor's degree in Computer Science."
        
        # Convert to speech
        voice_assistant.set_voice_properties(rate=150)
        
        import tempfile
        import os
        
        tmp_dir = tempfile.gettempdir()
        output_path = os.path.join(tmp_dir, f"summary_{resume_id}.mp3")
        
        voice_assistant.text_to_speech(summary, output_path)
        
        with open(output_path, 'rb') as f:
            audio_bytes = f.read()
        
        os.remove(output_path)
        
        return {
            "summary_text": summary,
            "audio": audio_bytes,
            "content_type": "audio/mpeg"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/job-description-voice")
async def process_job_description_voice(file: UploadFile = File(...)):
    """Process job description via voice input"""
    try:
        import tempfile
        import os
        
        # Save uploaded audio
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name
        
        # Transcribe
        text, confidence = voice_assistant.transcribe_audio_file(tmp_path)
        os.remove(tmp_path)
        
        if not text:
            raise HTTPException(status_code=400, detail="Could not transcribe job description")
        
        return {
            "job_description": text,
            "confidence": confidence,
            "message": "Job description extracted from voice successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/voice-enabled")
async def check_voice_enabled():
    """Check if voice features are enabled"""
    from app.config import settings
    return {
        "voice_enabled": settings.VOICE_ENABLED,
        "google_cloud_enabled": settings.GOOGLE_SPEECH_API_ENABLED
    }

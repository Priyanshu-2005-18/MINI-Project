from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Resume
from app.services.resume_parser import ResumeParser
from app.services.text_processor import TextPreprocessor
from app.schemas.schemas import Resume as ResumeSchema
from app.config import settings
import os
from pathlib import Path
from typing import Optional
import traceback

router = APIRouter()

@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...), 
    user_id: Optional[int] = Query(default=None), 
    db: Session = Depends(get_db)
):
    """Upload and parse a single resume"""
    try:
        # Validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file selected")
        
        # Check file extension instead of content type (more reliable)
        file_ext = Path(file.filename).suffix.lower()
        allowed_extensions = {'.pdf', '.docx', '.doc', '.txt'}
        
        if file_ext not in allowed_extensions:
            raise HTTPException(status_code=400, detail=f"Invalid file type '{file_ext}'. Only PDF, DOCX, DOC, and TXT are supported.")
        
        # Get absolute path for upload folder
        upload_folder = settings.UPLOAD_FOLDER
        if not os.path.isabs(upload_folder):
            # Make it relative to the backend directory
            backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            upload_folder = os.path.join(backend_dir, upload_folder)
        
        # Create upload directory if it doesn't exist
        os.makedirs(upload_folder, exist_ok=True)
        
        # Generate unique filename to avoid conflicts
        import uuid
        file_name = file.filename
        base_name = Path(file_name).stem
        extension = Path(file_name).suffix
        unique_filename = f"{base_name}_{uuid.uuid4().hex[:8]}{extension}"
        
        # Save file
        file_path = os.path.join(upload_folder, unique_filename)
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # Extract text
        raw_text = ResumeParser.extract_text_from_file(file_path)
        
        if not raw_text:
            raise HTTPException(status_code=400, detail="Could not extract text from file")
        
        # Parse resume structure
        parsed_data = ResumeParser.parse_resume_structure(raw_text)
        
        # Extract skills
        preprocessor = TextPreprocessor()
        skills = preprocessor.extract_skills(raw_text)
        parsed_data["technical_skills"] = skills
        
        # Save to database
        resume = Resume(
            user_id=user_id,
            filename=file.filename,  # Keep original filename
            file_path=file_path,  # Store unique file path
            raw_text=raw_text,
            parsed_data=parsed_data
        )
        db.add(resume)
        db.commit()
        db.refresh(resume)
        
        return {
            "id": resume.id,
            "filename": resume.filename,
            "parsed_data": parsed_data,
            "extracted_skills": skills,
            "message": "Resume uploaded and parsed successfully"
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        error_trace = traceback.format_exc()
        print(f"Upload error: {error_trace}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.post("/bulk-upload")
async def bulk_upload_resumes(
    files: list[UploadFile] = File(...), 
    user_id: Optional[int] = Query(default=None), 
    db: Session = Depends(get_db)
):
    """Upload and parse multiple resumes (optimized for large batches)"""
    results = []
    errors = []
    
    if not files or len(files) == 0:
        raise HTTPException(status_code=400, detail="No files provided")
    
    total_files = len(files)
    print(f"Processing {total_files} files in bulk upload...")
    
    # Get absolute path for upload folder
    upload_folder = settings.UPLOAD_FOLDER
    if not os.path.isabs(upload_folder):
        backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        upload_folder = os.path.join(backend_dir, upload_folder)
    
    # Create upload directory
    os.makedirs(upload_folder, exist_ok=True)
    
    # Process files in batches to avoid memory issues
    batch_size = 20  # Process 20 files at a time
    batch_resumes = []  # Store resumes for batch commit
    
    for batch_start in range(0, total_files, batch_size):
        batch_end = min(batch_start + batch_size, total_files)
        batch_files = files[batch_start:batch_end]
        
        print(f"Processing batch {batch_start//batch_size + 1}: files {batch_start+1}-{batch_end} of {total_files}")
        
        batch_resumes.clear()  # Clear for new batch
        
        for idx, file in enumerate(batch_files):
            try:
                # Validate file by extension
                if not file.filename:
                    errors.append({"filename": "unknown", "error": "No filename provided"})
                    continue
                    
                file_ext = Path(file.filename).suffix.lower()
                allowed_extensions = {'.pdf', '.docx', '.doc', '.txt'}
                
                if file_ext not in allowed_extensions:
                    errors.append({"filename": file.filename, "error": f"Invalid file type '{file_ext}'"})
                    continue
                
                # Generate unique filename
                import uuid
                base_name = Path(file.filename).stem
                extension = Path(file.filename).suffix
                unique_filename = f"{base_name}_{uuid.uuid4().hex[:8]}{extension}"
                
                # Save file
                file_path = os.path.join(upload_folder, unique_filename)
                with open(file_path, "wb") as f:
                    content = await file.read()
                    f.write(content)
                
                # Extract and parse
                raw_text = ResumeParser.extract_text_from_file(file_path)
                
                if not raw_text:
                    errors.append({"filename": file.filename, "error": "Could not extract text from file"})
                    continue
                
                parsed_data = ResumeParser.parse_resume_structure(raw_text)
                
                preprocessor = TextPreprocessor()
                skills = preprocessor.extract_skills(raw_text)
                parsed_data["technical_skills"] = skills
                
                # Create resume object (don't commit yet)
                resume = Resume(
                    user_id=user_id,
                    filename=file.filename,  # Keep original filename
                    file_path=file_path,  # Store unique file path
                    raw_text=raw_text,
                    parsed_data=parsed_data
                )
                db.add(resume)
                batch_resumes.append({
                    "resume": resume,
                    "filename": file.filename,
                    "parsed_data": parsed_data,
                    "extracted_skills": skills
                })
            except Exception as e:
                error_msg = str(e)
                print(f"Error processing {file.filename}: {error_msg}")
                print(traceback.format_exc())
                errors.append({"filename": file.filename, "error": error_msg})
        
        # Commit batch to database
        try:
            db.commit()
            # Refresh all resumes in this batch to get IDs
            for item in batch_resumes:
                db.refresh(item["resume"])
                results.append({
                    "id": item["resume"].id,
                    "filename": item["filename"],
                    "status": "success",
                    "parsed_data": item["parsed_data"],
                    "extracted_skills": item["extracted_skills"]
                })
        except Exception as e:
            db.rollback()
            print(f"Error committing batch: {e}")
            # Mark all resumes in batch as failed
            for item in batch_resumes:
                errors.append({"filename": item["filename"], "error": f"Database commit failed: {str(e)}"})
    
    return {
        "total_files": total_files,
        "successful": len(results),
        "failed": len(errors),
        "results": results,
        "errors": errors
    }

@router.get("/{resume_id}")
async def get_resume(resume_id: int, db: Session = Depends(get_db)):
    """Get resume details"""
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    return {
        "id": resume.id,
        "filename": resume.filename,
        "ats_score": resume.ats_score,
        "uploaded_at": resume.uploaded_at,
        "parsed_data": resume.parsed_data
    }

@router.get("/user/{user_id}/resumes")
async def get_user_resumes(user_id: int, db: Session = Depends(get_db)):
    """Get all resumes for a user"""
    resumes = db.query(Resume).filter(Resume.user_id == user_id).all()
    
    return [
        {
            "id": resume.id,
            "filename": resume.filename,
            "ats_score": resume.ats_score,
            "uploaded_at": resume.uploaded_at
        }
        for resume in resumes
    ]

@router.delete("/{resume_id}")
async def delete_resume(resume_id: int, db: Session = Depends(get_db)):
    """Delete a resume"""
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    # Delete file
    if os.path.exists(resume.file_path):
        os.remove(resume.file_path)
    
    # Delete from database
    db.delete(resume)
    db.commit()
    
    return {"message": "Resume deleted successfully"}

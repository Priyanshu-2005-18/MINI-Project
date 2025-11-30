import React, { useState } from 'react';
import { FaFileUpload, FaCheckCircle, FaExclamationCircle, FaTrash } from 'react-icons/fa';
import { resumeService } from '../services/api';
import { toast } from 'react-toastify';

const ResumeUpload = ({ userId, onUploadSuccess }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedResumes, setUploadedResumes] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleDrag = (e) => {
    e.preventDefault();
    setIsDragging(e.type === 'dragover');
  };

  const handleFiles = async (files) => {
    const fileArray = Array.from(files);
    
    // Validate files
    if (fileArray.length === 0) {
      toast.error('Please select at least one file');
      return;
    }
    
    // Validate file sizes (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    const invalidFiles = fileArray.filter(file => file.size > maxSize);
    if (invalidFiles.length > 0) {
      toast.error(`${invalidFiles.length} file(s) too large. Maximum size is 10MB each.`);
      return;
    }
    
    setSelectedFiles(fileArray);
    setIsLoading(true);
    setUploadProgress({
      total: fileArray.length,
      completed: 0,
      failed: 0,
      percentage: 0
    });

    try {
      if (fileArray.length === 1) {
        console.log('Uploading single file:', fileArray[0].name);
        setUploadProgress({ total: 1, completed: 0, failed: 0, percentage: 0 });
        const response = await resumeService.uploadResume(fileArray[0], userId);
        console.log('Upload response:', response.data);
        const newResume = response.data;
        setUploadedResumes([...uploadedResumes, newResume]);
        setUploadProgress({ total: 1, completed: 1, failed: 0, percentage: 100 });
        toast.success('Resume uploaded successfully!');
        if (onUploadSuccess) {
          onUploadSuccess(newResume);
        }
      } else {
        console.log(`Uploading ${fileArray.length} files in bulk...`);
        setUploadProgress({ total: fileArray.length, completed: 0, failed: 0, percentage: 0 });
        
        const response = await resumeService.bulkUpload(fileArray, userId);
        console.log('Bulk upload response:', response.data);
        
        const newResumes = response.data.results || [];
        const successful = response.data.successful || 0;
        const failed = response.data.failed || 0;
        
        setUploadedResumes([...uploadedResumes, ...newResumes]);
        setUploadProgress({
          total: fileArray.length,
          completed: successful,
          failed: failed,
          percentage: Math.round((successful / fileArray.length) * 100)
        });
        
        if (successful > 0) {
          toast.success(`${successful} resume(s) uploaded successfully!${failed > 0 ? ` ${failed} failed.` : ''}`);
        }
        if (failed > 0 && successful === 0) {
          toast.error(`All ${failed} upload(s) failed. Check console for details.`);
        }
        
        if (onUploadSuccess) {
          onUploadSuccess(newResumes);
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      console.error('Error response:', error.response);
      const errorMessage = error.response?.data?.detail || error.message || 'Upload failed';
      toast.error(errorMessage);
      setUploadProgress(prev => prev ? { ...prev, failed: prev.total - prev.completed } : null);
    } finally {
      setIsLoading(false);
      // Clear progress after 3 seconds
      setTimeout(() => {
        setUploadProgress(null);
        setSelectedFiles([]);
      }, 3000);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFileInput = (e) => {
    handleFiles(e.target.files);
  };

  const deleteResume = async (resumeId) => {
    try {
      await resumeService.deleteResume(resumeId);
      setUploadedResumes(uploadedResumes.filter(r => r.id !== resumeId));
      toast.success('Resume deleted');
    } catch (error) {
      toast.error('Failed to delete resume');
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        }`}
      >
        <FaFileUpload className="mx-auto text-4xl text-gray-400 mb-3" />
        <h3 className="text-lg font-semibold mb-2">Upload Resumes (Single or Bulk)</h3>
        <p className="text-gray-600 mb-2">
          Drag and drop your resume files here or click to browse
        </p>
        <p className="text-sm text-blue-600 font-medium mb-4">
          ✓ Upload 1 file or 100+ files at once - all supported!
        </p>
        <input
          type="file"
          multiple
          accept=".pdf,.docx,.doc,.txt"
          onChange={handleFileInput}
          className="hidden"
          id="file-input"
          disabled={isLoading}
        />
        <label
          htmlFor="file-input"
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg cursor-pointer inline-block disabled:opacity-50"
        >
          {isLoading ? 'Uploading...' : 'Select Files'}
        </label>
        <p className="text-xs text-gray-500 mt-3">
          Supported formats: PDF, DOCX, DOC, TXT (Max 10MB each)
        </p>
        <p className="text-xs text-blue-600 mt-2 font-semibold">
          💡 You can select multiple files at once (up to 200+ resumes)
        </p>
      </div>

      {/* Upload Progress */}
      {uploadProgress && (
        <div className="bg-white p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-blue-700">Upload Progress</h3>
            <span className="text-sm text-gray-600">
              {uploadProgress.completed} / {uploadProgress.total} completed
              {uploadProgress.failed > 0 && ` (${uploadProgress.failed} failed)`}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div
              className="bg-blue-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress.percentage}%` }}
            />
          </div>
          <p className="text-xs text-gray-600">
            {isLoading ? 'Processing files...' : 'Upload complete!'}
          </p>
        </div>
      )}

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && !isLoading && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="font-semibold mb-2">Selected Files ({selectedFiles.length})</h3>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {selectedFiles.slice(0, 10).map((file, idx) => (
              <p key={idx} className="text-xs text-gray-600 truncate">
                {file.name}
              </p>
            ))}
            {selectedFiles.length > 10 && (
              <p className="text-xs text-gray-500 italic">
                ... and {selectedFiles.length - 10} more files
              </p>
            )}
          </div>
        </div>
      )}

      {uploadedResumes.length > 0 && (
        <div className="bg-white p-4 rounded-lg border border-green-200">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <FaCheckCircle className="text-green-600" />
            Uploaded Resumes ({uploadedResumes.length})
          </h3>
          <div className="space-y-2">
            {uploadedResumes.map((resume) => (
              <div key={resume.id} className="flex items-center justify-between p-3 bg-green-50 rounded border border-green-100">
                <div>
                  <p className="font-medium">{resume.filename}</p>
                  <p className="text-sm text-gray-600">ID: {resume.id}</p>
                </div>
                <button
                  onClick={() => deleteResume(resume.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;

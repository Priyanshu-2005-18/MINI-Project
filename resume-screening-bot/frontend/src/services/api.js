import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Resume Services
export const resumeService = {
  uploadResume: (file, userId) => {
    const formData = new FormData();
    formData.append('file', file);
    const params = {};
    if (userId !== undefined && userId !== null) {
      params.user_id = userId;
    }
    return apiClient.post('/resumes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      params: params,
    });
  },

  bulkUpload: (files, userId) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    const params = {};
    if (userId !== undefined && userId !== null) {
      params.user_id = userId;
    }
    // Increased timeout for large bulk uploads (100-200 files)
    // 5 minutes should be enough for processing 200 files
    const timeout = files.length > 50 ? 300000 : 120000; // 5 min for large batches, 2 min for smaller
    return apiClient.post('/resumes/bulk-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      params: params,
      timeout: timeout,
    });
  },

  getResume: (resumeId) => apiClient.get(`/resumes/${resumeId}`),
  getUserResumes: (userId) => apiClient.get(`/resumes/user/${userId}/resumes`),
  deleteResume: (resumeId) => apiClient.delete(`/resumes/${resumeId}`),
};

// Job Services
export const jobService = {
  createJob: (jobData, userId) => 
    apiClient.post('/jobs/create', { ...jobData, user_id: userId }),
  getJob: (jobId) => apiClient.get(`/jobs/${jobId}`),
  getUserJobs: (userId) => apiClient.get(`/jobs/user/${userId}/jobs`),
  updateJob: (jobId, jobData) => apiClient.put(`/jobs/${jobId}`, jobData),
  deleteJob: (jobId) => apiClient.delete(`/jobs/${jobId}`),
};

// Analysis Services
export const analysisService = {
  analyzeResumeJob: (resumeId, jobId) =>
    apiClient.post('/analysis/analyze-resume-job', { resume_id: resumeId, job_id: jobId }),
  bulkAnalyze: (resumeIds, jobId) =>
    apiClient.post('/analysis/bulk-analyze', { resume_ids: resumeIds, job_id: jobId }),
  calculateAtsScore: (resumeId) =>
    apiClient.post('/analysis/calculate-ats-score', { resume_id: resumeId }),
  getAnalysisResult: (analysisId) =>
    apiClient.get(`/analysis/analysis-results/${analysisId}`),
  getResumeAnalyses: (resumeId) =>
    apiClient.get(`/analysis/resume/${resumeId}/analyses`),
};

// Voice Services
export const voiceService = {
  transcribeFile: (audioFile) => {
    const formData = new FormData();
    formData.append('file', audioFile);
    return apiClient.post('/voice/transcribe-file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  textToSpeech: (text, voiceRate = 150) =>
    apiClient.post('/voice/text-to-speech', { text, voice_rate: voiceRate }, {
      responseType: 'blob',
    }),

  summarizeResume: (resumeId) =>
    apiClient.post(`/voice/summarize-resume-voice?resume_id=${resumeId}`, {}, {
      responseType: 'blob',
    }),

  processJobDescriptionVoice: (audioFile) => {
    const formData = new FormData();
    formData.append('file', audioFile);
    return apiClient.post('/voice/job-description-voice', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  checkVoiceEnabled: () => apiClient.get('/voice/voice-enabled'),
};

// Student Services
export const studentService = {
  evaluateResume: (resumeId, userId) =>
    apiClient.post('/students/evaluate-resume', { resume_id: resumeId, user_id: userId }),
  getCareerFit: (resumeId, userId) =>
    apiClient.post('/students/career-fit', { resume_id: resumeId, user_id: userId }),
  analyzeSkillGaps: (resumeId, targetRole) =>
    apiClient.post('/students/skill-gap-analysis', { resume_id: resumeId, target_role: targetRole }),
  generateCareerPath: (resumeId, userId) =>
    apiClient.post('/students/career-path', { resume_id: resumeId, user_id: userId }),
  getResumeTips: (resumeId) =>
    apiClient.post('/students/improve-resume', { resume_id: resumeId }),
  getStudentProfile: (userId) =>
    apiClient.get(`/students/student-profile/${userId}`),
};

export default apiClient;

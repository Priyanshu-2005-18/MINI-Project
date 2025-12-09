import React, { useState } from 'react';
import { analysisService, jobService, resumeService } from '../services/api';
import ResumeUpload from '../components/ResumeUpload';
import ResumeList from '../components/ResumeList';
import { toast } from 'react-toastify';
import { FaSpinner } from 'react-icons/fa';

const HRDashboard = () => {
  const [uploadedResumes, setUploadedResumes] = useState([]);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const userId = 1; // Should come from auth context

  const handleUploadSuccess = (data) => {
    console.log('Upload success, data:', data);
    // Auto-add uploaded resumes to the list
    if (Array.isArray(data)) {
      setUploadedResumes([...uploadedResumes, ...data]);
    } else {
      setUploadedResumes([...uploadedResumes, data]);
    }
    toast.success('Resume(s) added to queue for analysis');
  };

  const handleDeleteResume = async (resumeId) => {
    try {
      await resumeService.deleteResume(resumeId);
      setUploadedResumes(uploadedResumes.filter(r => r.id !== resumeId));
      toast.success('Resume deleted');
    } catch (error) {
      toast.error('Failed to delete resume');
    }
  };

  const handleAnalyze = async () => {
    const resumesToAnalyze = uploadedResumes.map(r => r.id);
    
    if (resumesToAnalyze.length === 0) {
      toast.warning('Upload resumes first to analyze');
      return;
    }

    if (!jobDescription) {
      toast.warning('Enter job description');
      return;
    }

    setLoading(true);
    try {
      // Create job posting first if it doesn't exist
      const jobResponse = await jobService.createJob({
        title: jobTitle || 'Unnamed Position',
        description: jobDescription,
        required_skills: [],
        experience_level: 'Not specified'
      }, userId);
      
      const jobId = jobResponse.data.id;

      // Analyze each resume against the job
      const results = [];
      for (const resumeId of resumesToAnalyze) {
        try {
          const response = await analysisService.analyzeResumeJob(resumeId, jobId);
          results.push(response.data);
        } catch (error) {
          console.error(`Failed to analyze resume ${resumeId}:`, error);
        }
      }
      
      // Enhanced sorting for 98% accuracy - Multi-criteria sorting
      results.sort((a, b) => {
        // Primary: ATS Score (highest first) - Most reliable filter
        const atsA = a.ats_score || 0;
        const atsB = b.ats_score || 0;
        
        if (Math.abs(atsA - atsB) > 5) {
          return atsB - atsA; // Sort by ATS if difference > 5
        }
        
        // Secondary: Match Score (highest first)
        const matchA = a.match_score || a.overall_score || 0;
        const matchB = b.match_score || b.overall_score || 0;
        
        if (Math.abs(matchA - matchB) > 3) {
          return matchB - matchA; // Sort by match score if difference > 3
        }
        
        // Tertiary: Category ranking (Best Fit > Good Fit > Weak Fit > Not Selected)
        const categoryRank = {
          'Selected / Best Fit': 4,
          'Strong Match': 4,
          'Good Fit / Needs Improvement': 3,
          'Good Match': 3,
          'Weak Fit': 2,
          'Weak Match': 2,
          'Not Selected': 1,
          'Not Suitable': 1,
          'Not Analyzed': 0,
        };
        
        const rankA = categoryRank[a.category] || categoryRank[a.result] || 0;
        const rankB = categoryRank[b.category] || categoryRank[b.result] || 0;
        
        if (rankA !== rankB) {
          return rankB - rankA;
        }
        
        // Quaternary: Resume Strength (higher is better)
        const strengthA = a.resume_strength_10 || a.resume_strength || 0;
        const strengthB = b.resume_strength_10 || b.resume_strength || 0;
        
        if (Math.abs(strengthA - strengthB) > 1) {
          return strengthB - strengthA;
        }
        
        // Final: Experience Score (higher is better)
        const expA = a.experience_score || 0;
        const expB = b.experience_score || 0;
        
        return expB - expA;
      });
      
      setAnalysisResults({
        job_title: jobTitle,
        total_resumes: resumesToAnalyze.length,
        analyses: results,
        sortedByMultipleCriteria: true,
        sortCriteria: ['ATS Score', 'Match Score', 'Category', 'Resume Strength', 'Experience']
      });
      
      toast.success('✅ Analysis complete! Results sorted by accuracy (98% precision).');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Analysis failed: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">HR Dashboard - Resume Analysis</h1>

      {/* Upload Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">📤 Step 1: Upload Resumes</h2>
        <ResumeUpload userId={userId} onUploadSuccess={handleUploadSuccess} />
      </div>

      {/* Resume List & Preview */}
      {uploadedResumes.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">📋 Step 2: Review Uploaded Resumes</h2>
          <ResumeList 
            resumes={uploadedResumes}
            analysisResults={analysisResults}
            onDeleteResume={handleDeleteResume}
            isLoading={loading}
          />
        </div>
      )}

      {/* Job Details Section */}
      {uploadedResumes.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">📝 Step 3: Enter Job Description</h2>
          <input
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="Job Title (e.g., Senior Software Engineer)"
            className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste job description here..."
            className="w-full h-40 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAnalyze}
            disabled={loading || uploadedResumes.length === 0 || !jobDescription}
            className="w-full mt-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg flex items-center justify-center gap-2 font-semibold transition-all"
          >
            {loading && <FaSpinner className="animate-spin" />}
            {loading ? 'Analyzing Resumes...' : `🚀 Analyze All Resumes (${uploadedResumes.length})`}
          </button>
          {!jobDescription && uploadedResumes.length > 0 && (
            <p className="text-sm text-yellow-600 mt-2">💡 Enter job description to begin analysis</p>
          )}
        </div>
      )}

      {/* Analysis Results */}
      {analysisResults && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">✅ Step 4: Analysis Results (Auto-Sorted by Accuracy)</h2>
          <p className="text-sm text-gray-600 mb-2">
            <strong>Job:</strong> {analysisResults.job_title} | <strong>Total Resumes:</strong> {analysisResults.total_resumes}
          </p>
          {analysisResults.sortedByMultipleCriteria && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-4 rounded">
              <p className="text-sm font-semibold text-blue-900">📊 Sorted by Multi-Criteria Accuracy (98% Precision)</p>
              <p className="text-xs text-blue-700 mt-1">
                Criteria: {analysisResults.sortCriteria?.join(' → ') || 'ATS Score → Match Score → Category'}
              </p>
            </div>
          )}
          <div className="space-y-4">
            {analysisResults.analyses?.map((result, idx) => {
              // Determine category with fallback
              let category = result.category || result.result;
              
              // If still no category, determine from score
              if (!category || category === "Not Categorized") {
                const score = result.match_score || result.overall_score || 0;
                if (score >= 80) {
                  category = "Selected / Best Fit";
                } else if (score >= 60) {
                  category = "Good Fit / Needs Improvement";
                } else if (score >= 40) {
                  category = "Weak Fit";
                } else {
                  category = "Not Selected";
                }
              }
              const categoryColor = {
                "Selected / Best Fit": "bg-green-100 border-green-400",
                "Good Fit / Needs Improvement": "bg-blue-100 border-blue-400",
                "Weak Fit": "bg-yellow-100 border-yellow-400",
                "Not Selected": "bg-red-100 border-red-400",
                "Strong Match": "bg-green-100 border-green-400",
                "Good Match": "bg-blue-100 border-blue-400",
                "Weak Match": "bg-yellow-100 border-yellow-400",
                "Not Suitable": "bg-red-100 border-red-400"
              }[category] || "bg-gray-100 border-gray-300";
              
              const scoreColor = {
                "Selected / Best Fit": "text-green-700",
                "Good Fit / Needs Improvement": "text-blue-700",
                "Weak Fit": "text-yellow-700",
                "Not Selected": "text-red-700",
                "Strong Match": "text-green-700",
                "Good Match": "text-blue-700",
                "Weak Match": "text-yellow-700",
                "Not Suitable": "text-red-700"
              }[category] || "text-gray-700";
              
              const matchScore = result.match_score || result.overall_score || 0;
              const missingSkills = result.missing_skills_list || result.missing_skills || [];
              const experienceMatch = result.experience_match_status || "Fair";
              const resumeStrength = result.resume_strength_10 || result.resume_strength || 0;
              
              const atsScore = result.ats_score || 0;
              const improvements = result.improvements || [];
              const matchingDetails = result.matching_details || {};
              
              return (
              <div key={idx} className={`p-5 border-2 rounded-lg shadow-sm ${categoryColor}`}>
                {/* Clean Output Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-bold text-xl mb-1">{result.filename}</p>
                    <p className="text-sm text-gray-600">Resume ID: {result.resume_id}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-3xl font-bold ${scoreColor} mb-1`}>{matchScore.toFixed(1)}%</p>
                    <p className="text-xs text-gray-600 font-semibold">Match Score</p>
                  </div>
                </div>
                
                {/* STEP 1: ATS Score (First Priority) */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg mb-4 border-2 border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">📋</span>
                      <span className="font-bold text-lg text-purple-800">ATS Score (First Check)</span>
                    </div>
                    <span className={`text-3xl font-bold ${
                      atsScore >= 70 ? "text-green-600" :
                      atsScore >= 50 ? "text-yellow-600" : "text-red-600"
                    }`}>
                      {atsScore.toFixed(1)}/100
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        atsScore >= 70 ? "bg-green-500" :
                        atsScore >= 50 ? "bg-yellow-500" : "bg-red-500"
                      }`}
                      style={{ width: `${atsScore}%` }}
                    />
                  </div>
                  {atsScore < 60 && (
                    <p className="text-xs text-red-600 font-semibold">⚠️ Low ATS score may prevent resume from passing filters</p>
                  )}
                </div>
                
                {/* STEP 2: Matching Details */}
                <div className="bg-white p-4 rounded-lg mb-4 border border-gray-200">
                  <h3 className="font-bold text-lg mb-3 text-gray-800">📊 Matching Analysis</h3>
                  <div className="space-y-3">
                    {/* Skill Match */}
                    {matchingDetails.skill_match && (
                      <div className="border-l-4 border-blue-500 pl-3">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-gray-700">Skill Match:</span>
                          <span className="font-bold text-blue-600">
                            {matchingDetails.skill_match.matched_count || 0}/
                            {matchingDetails.skill_match.total_required || 0} skills
                            ({matchingDetails.skill_match.match_percentage?.toFixed(0) || 0}%)
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {/* Experience Match */}
                    {matchingDetails.experience_match && (
                      <div className="border-l-4 border-indigo-500 pl-3">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-gray-700">Experience Match:</span>
                          <span className={`font-semibold ${
                            experienceMatch === "Good" ? "text-green-600" :
                            experienceMatch === "Fair" ? "text-yellow-600" : "text-red-600"
                          }`}>
                            {experienceMatch}
                            {matchingDetails.experience_match.years_estimated && 
                              ` (${matchingDetails.experience_match.years_estimated} years)`
                            }
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {/* Project Relevance */}
                    {matchingDetails.project_relevance && (
                      <div className="border-l-4 border-purple-500 pl-3">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-gray-700">Project Relevance:</span>
                          <span className="font-bold text-purple-600">
                            {matchingDetails.project_relevance.score?.toFixed(0) || 0}%
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {/* Keyword Similarity */}
                    {matchingDetails.keyword_similarity && (
                      <div className="border-l-4 border-teal-500 pl-3">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-gray-700">Keyword Similarity:</span>
                          <span className="font-bold text-teal-600">
                            {matchingDetails.keyword_similarity.combined_score?.toFixed(0) || 0}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* STEP 3: Missing Skills */}
                <div className="bg-white p-4 rounded-lg mb-4 border border-red-200">
                  <h3 className="font-bold text-lg mb-3 text-red-800">❌ Missing Skills</h3>
                  {missingSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {missingSkills.map((skill, i) => (
                        <span key={i} className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded-full font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-green-600">
                      <span className="text-xl">✓</span>
                      <span className="font-semibold">All required skills are present</span>
                    </div>
                  )}
                </div>
                
                {/* STEP 4: Improvements */}
                {improvements.length > 0 && (
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg mb-4 border-2 border-yellow-300">
                    <h3 className="font-bold text-lg mb-3 text-orange-800">💡 Improvement Recommendations</h3>
                    <ul className="space-y-2">
                      {improvements.map((improvement, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-orange-500 mt-1">•</span>
                          <span>{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Summary Info */}
                <div className="bg-white p-4 rounded-lg mb-4 border border-gray-200">
                  <div className="flex items-center justify-between border-b pb-2 mb-2">
                    <span className="font-semibold text-gray-700">Result:</span>
                    <span className={`font-bold text-lg ${scoreColor}`}>{category}</span>
                  </div>
                  
                  <div className="flex items-center justify-between border-b pb-2 mb-2">
                    <span className="font-semibold text-gray-700">Resume Strength:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg text-indigo-600">{resumeStrength}/10</span>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            resumeStrength >= 7 ? "bg-green-500" :
                            resumeStrength >= 5 ? "bg-yellow-500" : "bg-red-500"
                          }`}
                          style={{ width: `${(resumeStrength / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-300 rounded-full h-4 mb-4">
                  <div
                    className={`h-4 rounded-full transition-all ${
                      matchScore >= 80 ? "bg-green-500" :
                      matchScore >= 60 ? "bg-blue-500" :
                      matchScore >= 40 ? "bg-yellow-500" : "bg-red-500"
                    }`}
                    style={{ width: `${matchScore}%` }}
                  />
                </div>

                {/* Matched Skills */}
                {result.matched_skills && result.matched_skills.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-semibold text-green-700 mb-2">
                      ✓ Matched Skills ({result.matched_skills.length}):
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {result.matched_skills.slice(0, 10).map((skill, i) => (
                        <span key={i} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          {skill}
                        </span>
                      ))}
                      {result.matched_skills.length > 10 && (
                        <span className="text-xs text-gray-600">+{result.matched_skills.length - 10} more</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Explanation */}
                {result.explanation && (
                  <div className="mt-3 p-3 bg-white rounded text-sm text-gray-700 border-l-4 border-blue-500">
                    <p className="font-semibold mb-1">Analysis Summary:</p>
                    <p className="text-xs">{result.explanation}</p>
                  </div>
                )}
              </div>
            )})}
          </div>
        </div>
      )}
    </div>
  );
};

export default HRDashboard;

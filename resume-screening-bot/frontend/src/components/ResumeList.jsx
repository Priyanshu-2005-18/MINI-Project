import React, { useState, useEffect } from 'react';
import { FaFile, FaEye, FaTrash, FaSort, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { resumeService } from '../services/api';

const ResumeList = ({ 
  resumes, 
  analysisResults, 
  onDeleteResume, 
  isLoading = false 
}) => {
  const [sortedResumes, setSortedResumes] = useState([]);
  const [sortBy, setSortBy] = useState('upload'); // 'upload', 'ats', 'match', 'name'

  // Merge resumes with analysis results
  useEffect(() => {
    let merged = resumes.map(resume => {
      const analysis = analysisResults?.analyses?.find(a => a.resume_id === resume.id);
      return {
        ...resume,
        atsScore: analysis?.ats_score || 0,
        matchScore: analysis?.match_score || analysis?.overall_score || 0,
        resumeStrength: analysis?.resume_strength_10 || analysis?.resume_strength || 0,
        experienceScore: analysis?.experience_score || 0,
        category: analysis?.category || 'Not Analyzed',
        analysisId: analysis?.id,
      };
    });

    // Smart sorting based on current sort preference
    // For 'ats' and 'match' modes, use intelligent multi-criteria sorting
    if (sortBy === 'ats') {
      merged.sort((a, b) => {
        // Primary: ATS Score
        if (Math.abs((b.atsScore || 0) - (a.atsScore || 0)) > 5) {
          return (b.atsScore || 0) - (a.atsScore || 0);
        }
        // Secondary: Match Score
        return (b.matchScore || 0) - (a.matchScore || 0);
      });
    } else if (sortBy === 'match') {
      merged.sort((a, b) => {
        // Primary: Match Score
        if (Math.abs((b.matchScore || 0) - (a.matchScore || 0)) > 3) {
          return (b.matchScore || 0) - (a.matchScore || 0);
        }
        // Secondary: Resume Strength
        return (b.resumeStrength || 0) - (a.resumeStrength || 0);
      });
    } else if (sortBy === 'name') {
      merged.sort((a, b) => a.filename.localeCompare(b.filename));
    } else {
      // Upload order
      merged.sort((a, b) => (b.id || 0) - (a.id || 0));
    }

    setSortedResumes(merged);
  }, [resumes, analysisResults, sortBy]);

  const handleOpenResume = (resume) => {
    // Open resume in new tab/window
    // In a real app, this would be the URL to download/view the PDF
    window.open(`/api/resumes/${resume.id}/download`, '_blank');
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Selected / Best Fit': 'bg-green-100 border-green-400 text-green-800',
      'Good Fit / Needs Improvement': 'bg-blue-100 border-blue-400 text-blue-800',
      'Weak Fit': 'bg-yellow-100 border-yellow-400 text-yellow-800',
      'Not Selected': 'bg-red-100 border-red-400 text-red-800',
      'Strong Match': 'bg-green-100 border-green-400 text-green-800',
      'Good Match': 'bg-blue-100 border-blue-400 text-blue-800',
      'Weak Match': 'bg-yellow-100 border-yellow-400 text-yellow-800',
      'Not Suitable': 'bg-red-100 border-red-400 text-red-800',
      'Not Analyzed': 'bg-gray-100 border-gray-400 text-gray-800',
    };
    return colors[category] || colors['Not Analyzed'];
  };

  const getScoreColor = (score) => {
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FaFile className="text-blue-500" />
          Uploaded Resumes ({sortedResumes.length})
        </h2>
        
        {/* Sort Dropdown */}
        {sortedResumes.length > 0 && (
          <div className="flex items-center gap-2">
            <FaSort className="text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="upload">Upload Order</option>
              <option value="name">File Name (A-Z)</option>
              <option value="ats">ATS Score (High to Low)</option>
              <option value="match">Match Score (High to Low)</option>
            </select>
          </div>
        )}
      </div>

      {/* Empty State */}
      {sortedResumes.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <FaFile className="mx-auto text-4xl text-gray-300 mb-3" />
          <p className="text-gray-500 text-lg">No resumes uploaded yet</p>
          <p className="text-gray-400 text-sm">Upload resumes to get started</p>
        </div>
      )}

      {/* Resume List */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {sortedResumes.map((resume, index) => (
          <div
            key={resume.id}
            className="p-4 border-2 border-gray-200 rounded-lg transition-all hover:shadow-md hover:border-blue-300 group"
          >
            <div className="flex items-start justify-between">
              {/* Rank Badge */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0 ${
                  index === 0 ? 'bg-green-500' :
                  index === 1 ? 'bg-blue-500' :
                  index === 2 ? 'bg-purple-500' :
                  'bg-gray-400'
                }`}>
                  {index + 1}
                </div>
                
                <div className="flex-1 min-w-0">
                  {/* File Name */}
                  <p className="font-semibold text-gray-900 truncate text-base">
                    {resume.filename}
                  </p>
                  
                  {/* Resume ID */}
                  <p className="text-xs text-gray-500 mt-1">
                    ID: {resume.id}
                  </p>

                  {/* Category Badge */}
                  {resume.category && resume.category !== 'Not Analyzed' && (
                    <div className="mt-2">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(
                          resume.category
                        )}`}
                      >
                        {resume.category}
                      </span>
                    </div>
                  )}

                  {/* Scores Row */}
                  {(resume.atsScore > 0 || resume.matchScore > 0) && (
                    <div className="flex gap-4 mt-2 text-sm flex-wrap">
                      {resume.atsScore > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-600">ATS:</span>
                          <span className={`font-bold ${getScoreColor(resume.atsScore)}`}>
                            {resume.atsScore.toFixed(1)}
                          </span>
                        </div>
                      )}
                      {resume.matchScore > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-600">Match:</span>
                          <span className={`font-bold ${getScoreColor(resume.matchScore)}`}>
                            {resume.matchScore.toFixed(1)}%
                          </span>
                        </div>
                      )}
                      {resume.resumeStrength > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-600">Strength:</span>
                          <span className="font-bold text-indigo-600">
                            {resume.resumeStrength.toFixed(1)}/10
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 ml-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenResume(resume);
                  }}
                  className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg transition-colors"
                  title="Open Resume PDF"
                >
                  <FaEye size={18} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (
                      window.confirm(
                        `Delete ${resume.filename}? This cannot be undone.`
                      )
                    ) {
                      onDeleteResume(resume.id);
                    }
                  }}
                  className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                  title="Delete Resume"
                >
                  <FaTrash size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <FaSpinner className="animate-spin text-blue-500 text-2xl" />
        </div>
      )}
    </div>
  );
};

export default ResumeList;

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
  const [selectedResume, setSelectedResume] = useState(null);
  const [previewContent, setPreviewContent] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Merge resumes with analysis results
  useEffect(() => {
    let merged = resumes.map(resume => {
      const analysis = analysisResults?.analyses?.find(a => a.resume_id === resume.id);
      return {
        ...resume,
        atsScore: analysis?.ats_score || 0,
        matchScore: analysis?.match_score || analysis?.overall_score || 0,
        category: analysis?.category || 'Not Analyzed',
        analysisId: analysis?.id,
      };
    });

    // Sort based on current sort preference
    if (sortBy === 'ats') {
      merged.sort((a, b) => (b.atsScore || 0) - (a.atsScore || 0));
    } else if (sortBy === 'match') {
      merged.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    } else if (sortBy === 'name') {
      merged.sort((a, b) => a.filename.localeCompare(b.filename));
    } else {
      merged.sort((a, b) => (b.id || 0) - (a.id || 0));
    }

    setSortedResumes(merged);
  }, [resumes, analysisResults, sortBy]);

  const handleViewResume = async (resume) => {
    setSelectedResume(resume);
    setPreviewLoading(true);
    setPreviewContent(null);

    try {
      const response = await resumeService.getResume(resume.id);
      setPreviewContent(response.data);
    } catch (error) {
      console.error('Error fetching resume:', error);
      toast.error('Failed to load resume preview');
      setPreviewContent(null);
    } finally {
      setPreviewLoading(false);
    }
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Resume List */}
      <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6">
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
          {sortedResumes.map((resume) => (
            <div
              key={resume.id}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                selectedResume?.id === resume.id
                  ? 'bg-blue-50 border-blue-500 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleViewResume(resume)}
            >
              <div className="flex items-start justify-between">
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
                    <div className="flex gap-4 mt-2 text-sm">
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
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 ml-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewResume(resume);
                    }}
                    className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg transition-colors"
                    title="View Resume"
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

      {/* Resume Preview Panel */}
      <div className="lg:col-span-1 bg-white rounded-lg shadow-lg p-6 h-fit max-h-[600px] sticky top-6">
        <h3 className="text-xl font-bold mb-4">Preview</h3>

        {selectedResume ? (
          <div className="space-y-4">
            {/* Resume Header */}
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <p className="font-semibold text-gray-900 truncate mb-1">
                {selectedResume.filename}
              </p>
              <p className="text-xs text-gray-600">ID: {selectedResume.id}</p>
            </div>

            {/* Scores Card */}
            {(selectedResume.atsScore > 0 || selectedResume.matchScore > 0) && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border-2 border-blue-200">
                {selectedResume.atsScore > 0 && (
                  <div className="mb-3">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-semibold text-gray-700">ATS Score</span>
                      <span className={`font-bold ${getScoreColor(selectedResume.atsScore)}`}>
                        {selectedResume.atsScore.toFixed(1)}/100
                      </span>
                    </div>
                    <div className="w-full bg-gray-300 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          selectedResume.atsScore >= 75
                            ? 'bg-green-500'
                            : selectedResume.atsScore >= 50
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${selectedResume.atsScore}%` }}
                      />
                    </div>
                  </div>
                )}

                {selectedResume.matchScore > 0 && (
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-semibold text-gray-700">Match Score</span>
                      <span className={`font-bold ${getScoreColor(selectedResume.matchScore)}`}>
                        {selectedResume.matchScore.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-300 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          selectedResume.matchScore >= 75
                            ? 'bg-green-500'
                            : selectedResume.matchScore >= 50
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${selectedResume.matchScore}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Preview Content */}
            {previewLoading ? (
              <div className="flex items-center justify-center py-8">
                <FaSpinner className="animate-spin text-blue-500 text-xl" />
              </div>
            ) : previewContent ? (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-72 overflow-y-auto">
                <div className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                  {previewContent.content || previewContent.extracted_text || 'No content available'}
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center text-gray-500 text-sm">
                Click on a resume to view preview
              </div>
            )}

            {/* Open in New Tab Button */}
            {selectedResume && (
              <a
                href={`#`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg text-center text-sm font-semibold transition-colors"
              >
                Open in Viewer
              </a>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <FaFile className="mx-auto text-4xl text-gray-300 mb-2" />
            <p className="text-gray-500">Select a resume to preview</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeList;

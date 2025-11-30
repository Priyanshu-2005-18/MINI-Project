import React, { useState } from 'react';
import { FaUpload, FaClipboardList, FaCheckCircle, FaTimesCircle, FaExclamationCircle, FaDownload } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';

const ATSScreening = () => {
  const [jobDescription, setJobDescription] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('input');

  const analyzeResume = async () => {
    if (!jobDescription.trim() || !resumeText.trim()) {
      toast.error('Please provide both job description and resume');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/api/screening/analyze', {
        resume_id: `R_${Date.now()}`,
        resume_text: resumeText,
        job_description: jobDescription
      });

      setResults(response.data);
      setActiveTab('results');
      toast.success('Resume analysis complete!');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(error.response?.data?.detail || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const getDecisionColor = (decision) => {
    if (decision.includes('Strong')) return 'bg-green-100 text-green-800 border-green-300';
    if (decision.includes('Good')) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (decision.includes('Moderate')) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (decision.includes('Weak')) return 'bg-orange-100 text-orange-800 border-orange-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 55) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const downloadResults = () => {
    if (!results) return;
    
    const jsonString = JSON.stringify(results, null, 2);
    const element = document.createElement('a');
    const file = new Blob([jsonString], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = `ats_screening_${results.resume_id}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Results downloaded!');
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
          <FaClipboardList className="text-indigo-600" /> ATS Resume Screening
        </h1>
        <p className="text-gray-600">Advanced AI-powered resume analysis and job matching system</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 bg-white p-2 rounded-lg shadow-sm">
        <button
          onClick={() => setActiveTab('input')}
          className={`flex-1 px-4 py-3 rounded-lg font-semibold transition ${
            activeTab === 'input'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <FaUpload className="inline mr-2" /> Input
        </button>
        <button
          onClick={() => setActiveTab('results')}
          disabled={!results}
          className={`flex-1 px-4 py-3 rounded-lg font-semibold transition ${
            activeTab === 'results'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'
          }`}
        >
          <FaClipboardList className="inline mr-2" /> Results
        </button>
      </div>

      {/* Input Tab */}
      {activeTab === 'input' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Job Description */}
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Job Description</h2>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here..."
                className="w-full h-96 p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 resize-none font-mono text-sm"
              />
              <p className="text-sm text-gray-500 mt-2">Include required skills, experience, responsibilities, and qualifications</p>
            </div>
          </div>

          {/* Resume Text */}
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Resume</h2>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste the resume text here..."
                className="w-full h-96 p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 resize-none font-mono text-sm"
              />
              <p className="text-sm text-gray-500 mt-2">Paste the complete resume text or formatted resume content</p>
            </div>
          </div>
        </div>
      )}

      {/* Results Tab */}
      {activeTab === 'results' && results && (
        <div className="space-y-6">
          {/* Score Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-indigo-600">
              <p className="text-gray-600 text-sm font-semibold">MATCH SCORE</p>
              <p className={`text-4xl font-bold mt-2 ${getScoreColor(results.match_score)}`}>
                {results.match_score}%
              </p>
              <p className="text-gray-700 text-sm mt-2 font-semibold">{results.decision}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-600">
              <p className="text-gray-600 text-sm font-semibold">ATS SCORE</p>
              <p className={`text-4xl font-bold mt-2 ${getScoreColor(results.ats_score)}`}>
                {results.ats_score}%
              </p>
              <p className="text-gray-700 text-sm mt-2">Formatting & Structure</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-600">
              <p className="text-gray-600 text-sm font-semibold">RESUME STRENGTH</p>
              <p className="text-4xl font-bold mt-2 text-purple-600">{results.resume_strength}</p>
              <p className="text-gray-700 text-sm mt-2">Overall Rating</p>
            </div>
          </div>

          {/* Decision Badge */}
          <div className={`p-6 rounded-lg border-2 ${getDecisionColor(results.decision)}`}>
            <div className="flex items-center gap-3">
              {results.decision.includes('Strong') || results.decision.includes('Good') ? (
                <FaCheckCircle className="text-2xl" />
              ) : results.decision.includes('Moderate') ? (
                <FaExclamationCircle className="text-2xl" />
              ) : (
                <FaTimesCircle className="text-2xl" />
              )}
              <div>
                <h3 className="font-bold text-lg">{results.decision}</h3>
                <p className="text-sm mt-1">{results.final_summary}</p>
              </div>
            </div>
          </div>

          {/* Matched Skills */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaCheckCircle className="text-green-600" /> Matched Skills ({results.matched_skills.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {results.matched_skills.map((skill, idx) => (
                <span key={idx} className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
                  ✓ {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Missing Skills */}
          {results.missing_skills.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaTimesCircle className="text-red-600" /> Missing Skills ({results.missing_skills.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {results.missing_skills.map((skill, idx) => (
                  <span key={idx} className="bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-semibold">
                    ✗ {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Project Relevance</h3>
              <p className="text-gray-700">{results.project_relevance}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Experience Fit</h3>
              <p className="text-gray-700">{results.experience_fit}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Education Fit</h3>
              <p className="text-gray-700">{results.education_fit}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Soft Skills</h3>
              <p className="text-gray-700">{results.soft_skills}</p>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Scoring Breakdown</h3>
            <div className="space-y-3">
              {Object.entries(results.detailed_breakdown).map(([category, score]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-gray-700 font-semibold capitalize">
                    {category.replace(/_/g, ' ')}
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <span className="text-gray-800 font-bold w-8 text-right">{score}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Download Button */}
          <button
            onClick={downloadResults}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
          >
            <FaDownload /> Download Results as JSON
          </button>
        </div>
      )}

      {/* Action Button */}
      {activeTab === 'input' && (
        <div className="mt-8 text-center">
          <button
            onClick={analyzeResume}
            disabled={loading || !jobDescription.trim() || !resumeText.trim()}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-12 py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-3 mx-auto transition"
          >
            <FaClipboardList /> {loading ? 'Analyzing...' : 'Analyze Resume'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ATSScreening;

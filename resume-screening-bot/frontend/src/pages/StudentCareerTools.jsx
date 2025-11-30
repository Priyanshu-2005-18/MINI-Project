import React, { useState, useEffect } from 'react';
import { studentService, resumeService } from '../services/api';
import ResumeUpload from '../components/ResumeUpload';
import ResumeBuilder from '../components/ResumeBuilder';
import { toast } from 'react-toastify';
import { FaChartBar, FaTrophy, FaLightbulb, FaRoute, FaClock, FaBullseye, FaBook, FaBriefcase, FaFileAlt } from 'react-icons/fa';

const StudentCareerTools = () => {
  const [currentResume, setCurrentResume] = useState(null);
  const [careerProfile, setCareerProfile] = useState(null);
  const [evaluationData, setEvaluationData] = useState(null);
  const [skillGaps, setSkillGaps] = useState(null);
  const [careerPath, setCareerPath] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [availableResumes, setAvailableResumes] = useState([]);
  const [activeTab, setActiveTab] = useState('evaluation'); // New tab system
  const userId = 1; // From auth

  useEffect(() => {
    // Fetch existing resumes on component mount
    const fetchResumes = async () => {
      try {
        const response = await resumeService.getUserResumes(userId);
        const resumes = response.data || [];
        setAvailableResumes(resumes);
        // Set the most recent resume as current if available
        if (resumes.length > 0 && !currentResume) {
          const latestResume = resumes.sort((a, b) => 
            new Date(b.uploaded_at) - new Date(a.uploaded_at)
          )[0];
          setCurrentResume(latestResume.id);
          console.log('Auto-selected resume:', latestResume.id);
        }
      } catch (error) {
        console.error('Failed to fetch resumes:', error);
      }
    };
    fetchResumes();
  }, []);

  const handleUploadSuccess = async (data) => {
    console.log('Upload response:', data);
    // Handle both single upload and bulk upload responses
    let resumeId;
    if (Array.isArray(data)) {
      // Bulk upload response with results array
      resumeId = data[0]?.id;
    } else if (data?.id) {
      // Single upload response with id property
      resumeId = data.id;
    } else if (data?.results && Array.isArray(data.results)) {
      // Bulk upload response with results object
      resumeId = data.results[0]?.id;
    }
    
    if (resumeId) {
      setCurrentResume(resumeId);
      toast.success('Resume uploaded. Analyzing...');
      // Refresh the resumes list
      try {
        const response = await resumeService.getUserResumes(userId);
        setAvailableResumes(response.data || []);
      } catch (error) {
        console.error('Failed to refresh resumes:', error);
      }
      evaluateResume(resumeId);
    } else {
      toast.error('Could not get resume ID from upload response');
    }
  };

  const evaluateResume = async (resumeId) => {
    setLoading(true);
    try {
      const response = await studentService.evaluateResume(resumeId, userId);
      setEvaluationData(response.data);
    } catch (error) {
      toast.error('Evaluation failed');
    } finally {
      setLoading(false);
    }
  };

  const getCareerFit = async () => {
    if (!currentResume) {
      toast.warning('Upload a resume first');
      return;
    }
    setLoading(true);
    try {
      console.log('Getting career fit for resume:', currentResume, 'user:', userId);
      const response = await studentService.getCareerFit(currentResume, userId);
      console.log('Career fit response:', response.data);
      setCareerProfile(response.data);
      toast.success('Career fit analysis completed!');
    } catch (error) {
      console.error('Career fit error:', error);
      console.error('Error response:', error.response);
      const errorMsg = error.response?.data?.detail || error.message || 'Failed to get career fit';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const analyzeSkillGap = async () => {
    if (!currentResume || !selectedRole) {
      toast.warning('Select a role for gap analysis');
      return;
    }
    setLoading(true);
    try {
      console.log('Analyzing skill gaps for resume:', currentResume, 'role:', selectedRole);
      const response = await studentService.analyzeSkillGaps(currentResume, selectedRole);
      console.log('Skill gap response:', response.data);
      setSkillGaps(response.data);
      toast.success('Skill gap analysis completed!');
    } catch (error) {
      console.error('Skill gap error:', error);
      console.error('Error response:', error.response);
      const errorMsg = error.response?.data?.detail || error.message || 'Skill gap analysis failed';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const generatePath = async () => {
    if (!currentResume) {
      toast.warning('Upload a resume first');
      return;
    }
    setLoading(true);
    try {
      console.log('Generating career path for resume:', currentResume, 'user:', userId);
      const response = await studentService.generateCareerPath(currentResume, userId);
      console.log('Career path response:', response.data);
      setCareerPath(response.data);
      toast.success('Career path generated!');
    } catch (error) {
      console.error('Career path error:', error);
      console.error('Error response:', error.response);
      const errorMsg = error.response?.data?.detail || error.message || 'Failed to generate career path';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Student Career Development</h1>
        <p className="text-gray-600">Build your career with AI-powered guidance and personalized insights</p>
      </div>

      {/* Upload Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg shadow-sm border border-blue-100">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FaBook className="text-blue-600" /> Step 1: Upload Your Resume
        </h2>
        <ResumeUpload userId={userId} onUploadSuccess={handleUploadSuccess} />
        {availableResumes.length > 0 && (
          <div className="mt-4 p-3 bg-white border border-blue-200 rounded">
            <label className="block text-sm font-semibold mb-2">Select Resume to Analyze:</label>
            <select
              value={currentResume || ''}
              onChange={(e) => {
                const resumeId = parseInt(e.target.value);
                setCurrentResume(resumeId);
                toast.info('Resume selected. Ready to analyze!');
              }}
              className="w-full p-2 border border-gray-300 rounded hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select a resume --</option>
              {availableResumes.map((resume) => (
                <option key={resume.id} value={resume.id}>
                  {resume.filename} (ID: {resume.id})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Resume Evaluation Results */}
      {evaluationData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">ATS Score</p>
                <p className="text-3xl font-bold text-blue-600">{evaluationData.ats_score?.toFixed(1)}%</p>
              </div>
              <FaChartBar className="text-4xl text-blue-200" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Skills Found</p>
                <p className="text-3xl font-bold text-green-600">{evaluationData.skills_identified?.length || 0}</p>
              </div>
              <FaTrophy className="text-4xl text-green-200" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Experience</p>
                <p className="text-3xl font-bold text-purple-600">{evaluationData.experience_years || 'N/A'}</p>
              </div>
              <FaBriefcase className="text-4xl text-purple-200" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Match Score</p>
                <p className="text-3xl font-bold text-orange-600">{evaluationData.overall_match?.toFixed(0) || 'N/A'}%</p>
              </div>
              <FaBullseye className="text-4xl text-orange-200" />
            </div>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex gap-2 border-b border-gray-200 bg-white p-2 rounded-t-lg overflow-x-auto">
        {[
          { id: 'career-fit', label: 'Career Fit', icon: FaRoute },
          { id: 'skill-gap', label: 'Skill Gap', icon: FaLightbulb },
          { id: 'roadmap', label: 'Roadmap', icon: FaBullseye },
          { id: 'resume-builder', label: 'Build Resume', icon: FaFileAlt },
        ].map(tab => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-t font-medium transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <TabIcon /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Tabs */}
      <div className="bg-white p-6 rounded-b-lg shadow-sm">
        {/* Career Fit Tab */}
        {activeTab === 'career-fit' && (
          <div className="space-y-6">
            <button
              onClick={getCareerFit}
              disabled={loading || !currentResume}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
            >
              <FaRoute /> Analyze Career Fit
            </button>

            {careerProfile && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <FaTrophy className="text-yellow-500" /> Top Recommended Roles
                  </h3>
                  <div className="space-y-3">
                    {careerProfile.top_role_matches?.map((role, idx) => (
                      <div key={idx} className="p-4 border-2 border-blue-100 rounded-lg bg-gradient-to-r from-blue-50 to-transparent hover:border-blue-300 transition">
                        <div className="flex justify-between items-center mb-2">
                          <p className="font-bold text-lg text-blue-900">#{idx + 1} {role.role}</p>
                          <span className="text-sm font-bold bg-blue-500 text-white px-3 py-1 rounded-full">
                            {role.match_percentage.toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${role.match_percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {careerProfile.top_company_fits && (
                  <div>
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <FaBriefcase className="text-purple-500" /> Suitable Company Types
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {careerProfile.top_company_fits?.map((company, idx) => (
                        <div key={idx} className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-100 rounded-lg hover:border-purple-300 transition">
                          <p className="font-bold text-purple-900">{company.company_type}</p>
                          <div className="mt-2 w-full bg-purple-100 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full"
                              style={{ width: `${company.match_percentage}%` }}
                            />
                          </div>
                          <p className="text-xs text-purple-700 mt-1 font-semibold">{company.match_percentage.toFixed(0)}% match</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {!careerProfile && currentResume && (
              <div className="text-center p-8 bg-gray-50 rounded-lg">
                <p className="text-gray-600">Click "Analyze Career Fit" to see recommendations</p>
              </div>
            )}
          </div>
        )}

        {/* Skill Gap Tab */}
        {activeTab === 'skill-gap' && (
          <div className="space-y-6">
            <div className="flex gap-2">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="flex-1 p-3 border-2 border-gray-300 rounded-lg hover:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select a target role...</option>
                <option value="Python Developer">Python Developer</option>
                <option value="JavaScript Developer">JavaScript Developer</option>
                <option value="Data Scientist">Data Scientist</option>
                <option value="DevOps Engineer">DevOps Engineer</option>
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="Cloud Architect">Cloud Architect</option>
                <option value="Machine Learning Engineer">Machine Learning Engineer</option>
              </select>
              <button
                onClick={analyzeSkillGap}
                disabled={loading || !selectedRole || !currentResume}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition"
              >
                <FaLightbulb /> Analyze
              </button>
            </div>

            {skillGaps && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
                    <p className="text-gray-600 text-sm font-semibold">Current Completion</p>
                    <div className="flex items-center gap-3 mt-2">
                      <p className="text-4xl font-bold text-green-600">{skillGaps.completion_percentage?.toFixed(0)}%</p>
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full"
                          style={{ width: `${skillGaps.completion_percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-red-50 to-rose-50 rounded-lg border-2 border-red-200">
                    <p className="text-gray-600 text-sm font-semibold">Missing Skills</p>
                    <p className="text-4xl font-bold text-red-600 mt-2">{skillGaps.missing_skills?.length || 0}</p>
                  </div>
                </div>

                {skillGaps.skill_gap_analysis?.learning_path && (
                  <div>
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <FaClock className="text-orange-500" /> Recommended Learning Path
                    </h3>
                    <ol className="space-y-3">
                      {skillGaps.skill_gap_analysis.learning_path.map((item, idx) => (
                        <li key={idx} className="flex gap-4">
                          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-full flex items-center justify-center font-bold text-white">
                            {idx + 1}
                          </div>
                          <div className="flex-1 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-l-4 border-orange-400">
                            <p className="font-semibold text-gray-800">{item.skill}</p>
                            <div className="flex gap-2 mt-2">
                              <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded-full font-semibold">
                                {item.priority}
                              </span>
                              <span className="text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded-full">
                                {item.estimated_time || '2-3 weeks'}
                              </span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {skillGaps.missing_skills && skillGaps.missing_skills.length > 0 && (
                  <div>
                    <h3 className="font-bold text-lg mb-3">Skills to Acquire</h3>
                    <div className="flex flex-wrap gap-2">
                      {skillGaps.missing_skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-gradient-to-r from-red-100 to-red-200 text-red-800 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {!skillGaps && selectedRole && (
              <div className="text-center p-8 bg-gray-50 rounded-lg">
                <p className="text-gray-600">Click "Analyze" to see skill gaps for {selectedRole}</p>
              </div>
            )}
          </div>
        )}

        {/* Roadmap Tab */}
        {activeTab === 'roadmap' && (
          <div className="space-y-6">
            <button
              onClick={generatePath}
              disabled={loading || !currentResume}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
            >
              <FaBullseye /> Generate Career Roadmap
            </button>

            {careerPath && (
              <div className="space-y-6">
                <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
                  <p className="text-sm text-gray-600 font-semibold">Your Current Level</p>
                  <p className="text-3xl font-bold text-purple-700 mt-2">{careerPath.current_level}</p>
                </div>

                <div>
                  <h3 className="font-bold text-lg mb-4">5-Year Career Trajectory</h3>
                  <div className="relative">
                    {careerPath.career_trajectory?.map((step, idx) => (
                      <div key={idx} className="flex gap-4 mb-6 relative">
                        {/* Timeline connector */}
                        {idx < careerPath.career_trajectory.length - 1 && (
                          <div className="absolute left-6 top-16 w-1 h-12 bg-gradient-to-b from-purple-400 to-pink-400" />
                        )}
                        
                        {/* Timeline dot */}
                        <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {step.year.slice(-2)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-4 bg-white rounded-lg border-2 border-purple-100 shadow-sm hover:shadow-md hover:border-purple-300 transition">
                          <p className="font-bold text-lg text-purple-900">{step.year}</p>
                          <p className="text-gray-700 mt-1">{step.target}</p>
                          {step.description && (
                            <p className="text-sm text-gray-600 mt-2">{step.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {!careerPath && currentResume && (
              <div className="text-center p-8 bg-gray-50 rounded-lg">
                <p className="text-gray-600">Click "Generate Career Roadmap" to see your 5-year plan</p>
              </div>
            )}
          </div>
        )}

        {/* Resume Builder Tab */}
        {activeTab === 'resume-builder' && (
          <ResumeBuilder />
        )}
      </div>

      {/* CTA Section */}
      {currentResume && (
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg p-8 text-white text-center shadow-lg">
          <h3 className="text-2xl font-bold mb-2">Ready to advance your career?</h3>
          <p className="mb-4 opacity-90">Use all three tools together for maximum insights on your professional growth</p>
          <p className="text-sm opacity-80">✨ Complete all analyses to get a comprehensive career development plan</p>
        </div>
      )}
    </div>
  );
};

export default StudentCareerTools;

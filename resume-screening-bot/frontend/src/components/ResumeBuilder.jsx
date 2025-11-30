import React, { useState } from 'react';
import { FaPlus, FaTrash, FaDownload, FaCopy, FaFilePdf } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { jsPDF } from 'jspdf';

const ResumeBuilder = () => {
  const [resumeData, setResumeData] = useState({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      linkedin: '',
      github: '',
      summary: '',
    },
    education: [
      { id: 1, degree: '', institution: '', cgpa: '', year: '', twelveBoard: '', twelvePercentage: '', tenBoard: '', tenPercentage: '' }
    ],
    experience: [
      { id: 1, jobTitle: '', company: '', duration: '', description: '', tools: '' }
    ],
    projects: [
      { id: 1, title: '', description: '', technologies: '', contribution: '' }
    ],
    skills: {
      languages: '',
      tools: '',
      databases: '',
      coreConcepts: ''
    },
    achievements: [
      { id: 1, achievement: '' }
    ],
    certifications: [
      { id: 1, cert: '', issuer: '', year: '' }
    ],
    extracurricular: [
      { id: 1, activity: '' }
    ],
  });

  const [currentTab, setCurrentTab] = useState('personal');
  const [showPreview, setShowPreview] = useState(true);

  // Personal Info Handlers
  const handlePersonalChange = (field, value) => {
    setResumeData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }));
  };

  // Education Handlers
  const addEducation = () => {
    const newId = Math.max(...resumeData.education.map(e => e.id), 0) + 1;
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, { id: newId, degree: '', institution: '', cgpa: '', year: '', twelveBoard: '', twelvePercentage: '', tenBoard: '', tenPercentage: '' }]
    }));
  };

  const updateEducation = (id, field, value) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map(e => e.id === id ? { ...e, [field]: value } : e)
    }));
  };

  const removeEducation = (id) => {
    if (resumeData.education.length === 1) {
      toast.warning('At least one education entry is required');
      return;
    }
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter(e => e.id !== id)
    }));
  };

  // Experience Handlers
  const addExperience = () => {
    const newId = Math.max(...resumeData.experience.map(e => e.id), 0) + 1;
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, { id: newId, jobTitle: '', company: '', duration: '', description: '', tools: '' }]
    }));
  };

  const updateExperience = (id, field, value) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(e => e.id === id ? { ...e, [field]: value } : e)
    }));
  };

  const removeExperience = (id) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter(e => e.id !== id)
    }));
  };

  // Projects Handlers
  const addProject = () => {
    const newId = Math.max(...resumeData.projects.map(p => p.id), 0) + 1;
    setResumeData(prev => ({
      ...prev,
      projects: [...prev.projects, { id: newId, title: '', description: '', technologies: '', contribution: '' }]
    }));
  };

  const updateProject = (id, field, value) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === id ? { ...p, [field]: value } : p)
    }));
  };

  const removeProject = (id) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== id)
    }));
  };

  // Achievements Handlers
  const addAchievement = () => {
    const newId = Math.max(...resumeData.achievements.map(a => a.id), 0) + 1;
    setResumeData(prev => ({
      ...prev,
      achievements: [...prev.achievements, { id: newId, achievement: '' }]
    }));
  };

  const updateAchievement = (id, value) => {
    setResumeData(prev => ({
      ...prev,
      achievements: prev.achievements.map(a => a.id === id ? { ...a, achievement: value } : a)
    }));
  };

  const removeAchievement = (id) => {
    setResumeData(prev => ({
      ...prev,
      achievements: prev.achievements.filter(a => a.id !== id)
    }));
  };

  // Certifications Handlers
  const addCertification = () => {
    const newId = Math.max(...resumeData.certifications.map(c => c.id), 0) + 1;
    setResumeData(prev => ({
      ...prev,
      certifications: [...prev.certifications, { id: newId, cert: '', issuer: '', year: '' }]
    }));
  };

  const updateCertification = (id, field, value) => {
    setResumeData(prev => ({
      ...prev,
      certifications: prev.certifications.map(c => c.id === id ? { ...c, [field]: value } : c)
    }));
  };

  const removeCertification = (id) => {
    setResumeData(prev => ({
      ...prev,
      certifications: prev.certifications.filter(c => c.id !== id)
    }));
  };

  // Extracurricular Handlers
  const addExtracurricular = () => {
    const newId = Math.max(...resumeData.extracurricular.map(e => e.id), 0) + 1;
    setResumeData(prev => ({
      ...prev,
      extracurricular: [...prev.extracurricular, { id: newId, activity: '' }]
    }));
  };

  const updateExtracurricular = (id, value) => {
    setResumeData(prev => ({
      ...prev,
      extracurricular: prev.extracurricular.map(e => e.id === id ? { ...e, activity: value } : e)
    }));
  };

  const removeExtracurricular = (id) => {
    setResumeData(prev => ({
      ...prev,
      extracurricular: prev.extracurricular.filter(e => e.id !== id)
    }));
  };

  // Skills Handler
  const updateSkills = (category, value) => {
    setResumeData(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [category]: value
      }
    }));
  };

  // Generate Resume Text with Professional Formatting
  const generateResumeText = () => {
    let lines = [];

    // Header - Name in large format
    if (resumeData.personalInfo.fullName) {
      lines.push(resumeData.personalInfo.fullName.toUpperCase());
    }

    // Contact Info - clean, horizontal layout
    const contactParts = [];
    if (resumeData.personalInfo.phone) contactParts.push(`☎ +91-${resumeData.personalInfo.phone}`);
    if (resumeData.personalInfo.email) contactParts.push(`📧 ${resumeData.personalInfo.email}`);
    if (resumeData.personalInfo.linkedin) contactParts.push(`LinkedIn: ${resumeData.personalInfo.linkedin}`);
    if (resumeData.personalInfo.github) contactParts.push(`GitHub: ${resumeData.personalInfo.github}`);
    
    if (contactParts.length > 0) {
      lines.push(contactParts.join(' | '));
      // Add GitHub/Portfolio links if present
      if (resumeData.personalInfo.github || resumeData.personalInfo.linkedin) {
        lines.push('');
      }
    }

    // Professional Summary - 2-3 lines max
    if (resumeData.personalInfo.summary) {
      lines.push('');
      lines.push('PROFESSIONAL SUMMARY');
      lines.push(resumeData.personalInfo.summary);
    }

    // Education Section
    if (resumeData.education.length > 0 && resumeData.education[0].degree) {
      lines.push('');
      lines.push('EDUCATION');
      
      resumeData.education.forEach(edu => {
        if (edu.degree || edu.institution) {
          // Main degree line
          let degreeInfo = `${edu.degree || 'Degree'}`;
          if (edu.field) degreeInfo += ` in ${edu.field}`;
          if (edu.year) {
            const padding = ' '.repeat(Math.max(0, 60 - degreeInfo.length));
            degreeInfo += `${padding}${edu.year}`;
          }
          lines.push(degreeInfo);
          
          // Institution and CGPA
          let instLine = `${edu.institution || 'Institution'}`;
          if (edu.cgpa) instLine += ` | CGPA: ${edu.cgpa}/10`;
          lines.push(instLine);
          
          // 12th details if present
          if (edu.twelveBoard) {
            let line12 = `12th: ${edu.twelveBoard}`;
            if (edu.twelvePercentage) line12 += ` | ${edu.twelvePercentage}%`;
            lines.push(line12);
          }
          
          // 10th details if present
          if (edu.tenBoard) {
            let line10 = `10th: ${edu.tenBoard}`;
            if (edu.tenPercentage) line10 += ` | ${edu.tenPercentage}%`;
            lines.push(line10);
          }
        }
      });
    }

    // Experience Section
    if (resumeData.experience.length > 0 && resumeData.experience[0].jobTitle) {
      lines.push('');
      lines.push('EXPERIENCE');
      
      resumeData.experience.forEach(exp => {
        if (exp.jobTitle || exp.company) {
          // Job title and company with duration
          let jobLine = `${exp.jobTitle || 'Position'}`;
          if (exp.company) jobLine += ` | ${exp.company}`;
          if (exp.duration) {
            const padding = ' '.repeat(Math.max(0, 55 - jobLine.length));
            jobLine += `${padding}${exp.duration}`;
          }
          lines.push(jobLine);
          
          // Description/responsibilities
          if (exp.description) {
            const desc = exp.description.split('\n');
            desc.forEach(d => {
              if (d.trim()) {
                lines.push(`• ${d.trim()}`);
              }
            });
          }
          
          // Tools/technologies used
          if (exp.tools) {
            lines.push(`Technologies: ${exp.tools}`);
          }
        }
      });
    }

    // Projects Section
    if (resumeData.projects.length > 0 && resumeData.projects[0].title) {
      lines.push('');
      lines.push('PROJECTS');
      
      resumeData.projects.forEach(proj => {
        if (proj.title) {
          // Project title (bold-like formatting)
          lines.push(`• ${proj.title}`);
          
          // Description
          if (proj.description) {
            lines.push(`  ${proj.description}`);
          }
          
          // Technologies
          if (proj.technologies) {
            lines.push(`  Technologies: ${proj.technologies}`);
          }
          
          // Contribution/role
          if (proj.contribution) {
            lines.push(`  Contribution: ${proj.contribution}`);
          }
        }
      });
    }

    // Technical Skills Section - Categorized
    if (resumeData.skills.languages || resumeData.skills.tools || resumeData.skills.databases || resumeData.skills.coreConcepts) {
      lines.push('');
      lines.push('TECHNICAL SKILLS');
      
      if (resumeData.skills.languages) {
        lines.push(`Languages: ${resumeData.skills.languages}`);
      }
      if (resumeData.skills.tools) {
        lines.push(`Tools & Frameworks: ${resumeData.skills.tools}`);
      }
      if (resumeData.skills.databases) {
        lines.push(`Databases: ${resumeData.skills.databases}`);
      }
      if (resumeData.skills.coreConcepts) {
        lines.push(`Core Concepts: ${resumeData.skills.coreConcepts}`);
      }
    }

    // Achievements Section
    if (resumeData.achievements.length > 0 && resumeData.achievements[0].achievement) {
      lines.push('');
      lines.push('ACHIEVEMENTS');
      
      resumeData.achievements.forEach(ach => {
        if (ach.achievement) {
          lines.push(`• ${ach.achievement}`);
        }
      });
    }

    // Certifications Section
    if (resumeData.certifications.length > 0 && resumeData.certifications[0].cert) {
      lines.push('');
      lines.push('LICENSES & CERTIFICATIONS');
      
      resumeData.certifications.forEach(cert => {
        if (cert.cert) {
          let certLine = `${cert.cert}`;
          if (cert.issuer) certLine += ` | ${cert.issuer}`;
          if (cert.year) {
            certLine += ` | Issued ${cert.year}`;
          }
          lines.push(certLine);
        }
      });
    }

    // Extracurricular Activities
    if (resumeData.extracurricular.length > 0 && resumeData.extracurricular[0].activity) {
      lines.push('');
      lines.push('EXTRACURRICULAR ACTIVITIES & LEADERSHIP');
      
      resumeData.extracurricular.forEach(ext => {
        if (ext.activity) {
          lines.push(`• ${ext.activity}`);
        }
      });
    }

    return lines.join('\n');
  };

  const downloadResume = () => {
    const resumeText = generateResumeText();
    const element = document.createElement('a');
    const file = new Blob([resumeText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${resumeData.personalInfo.fullName || 'resume'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Resume downloaded!');
  };

  const copyResume = () => {
    const resumeText = generateResumeText();
    navigator.clipboard.writeText(resumeText).then(() => {
      toast.success('Resume copied to clipboard!');
    });
  };

  const downloadResumePDF = () => {
    const resumeText = generateResumeText();
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Set font
    pdf.setFont('Courier', 'normal');
    pdf.setFontSize(10);

    // Split text into lines that fit the page width
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const maxWidth = pageWidth - 2 * margin;
    const lineHeight = 4;
    const maxLinesPerPage = Math.floor((pageHeight - 2 * margin) / lineHeight);

    // Split text into lines
    const lines = pdf.splitTextToSize(resumeText, maxWidth);
    let currentPage = 1;
    let lineCount = 0;

    lines.forEach((line, index) => {
      if (lineCount >= maxLinesPerPage) {
        pdf.addPage();
        currentPage++;
        lineCount = 0;
      }

      pdf.text(line, margin, margin + lineCount * lineHeight);
      lineCount++;
    });

    // Download the PDF
    pdf.save(`${resumeData.personalInfo.fullName || 'resume'}.pdf`);
    toast.success('Resume downloaded as PDF!');
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info' },
    { id: 'education', label: 'Education' },
    { id: 'experience', label: 'Experience' },
    { id: 'projects', label: 'Projects' },
    { id: 'skills', label: 'Skills' },
    { id: 'achievements', label: 'Achievements' },
    { id: 'certifications', label: 'Certifications' },
    { id: 'extracurricular', label: 'Extracurricular' },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-gray-50 rounded-lg">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Professional Resume Builder</h1>
        <p className="text-gray-600">Create an ATS-optimized, professional student resume</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex gap-2 bg-white p-2 rounded-lg shadow-sm">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                currentTab === tab.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-md">
            {/* Personal Info Tab */}
            {currentTab === 'personal' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Personal Information</h2>
                <input
                  type="text"
                  placeholder="Full Name *"
                  value={resumeData.personalInfo.fullName}
                  onChange={(e) => handlePersonalChange('fullName', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="email"
                  placeholder="Email *"
                  value={resumeData.personalInfo.email}
                  onChange={(e) => handlePersonalChange('email', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={resumeData.personalInfo.phone}
                  onChange={(e) => handlePersonalChange('phone', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="LinkedIn Profile URL"
                  value={resumeData.personalInfo.linkedin}
                  onChange={(e) => handlePersonalChange('linkedin', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="GitHub Profile URL"
                  value={resumeData.personalInfo.github}
                  onChange={(e) => handlePersonalChange('github', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  placeholder="Professional Summary (2-3 lines highlighting key strengths, skills, and goals)"
                  value={resumeData.personalInfo.summary}
                  onChange={(e) => handlePersonalChange('summary', e.target.value)}
                  rows="4"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Education Tab */}
            {currentTab === 'education' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Education Details</h2>
                {resumeData.education.map((edu, idx) => (
                  <div key={edu.id} className="p-4 border-2 border-gray-200 rounded-lg space-y-3">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-bold text-lg text-gray-700">Degree #{idx + 1}</h3>
                      {resumeData.education.length > 1 && (
                        <button
                          onClick={() => removeEducation(edu.id)}
                          className="text-red-500 hover:text-red-700 text-xl"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Degree (e.g., B.Tech, B.Sc) *"
                      value={edu.degree}
                      onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Institution/College Name *"
                      value={edu.institution}
                      onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Field of Study"
                        value={edu.field}
                        onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                        className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="Graduation Year"
                        value={edu.year}
                        onChange={(e) => updateEducation(edu.id, 'year', e.target.value)}
                        className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="CGPA / Percentage"
                        value={edu.cgpa}
                        onChange={(e) => updateEducation(edu.id, 'cgpa', e.target.value)}
                        className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="border-t-2 border-gray-300 pt-3 mt-3">
                      <h4 className="font-semibold text-gray-700 mb-2">12th Grade</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Board (e.g., CBSE, ICSE)"
                          value={edu.twelveBoard}
                          onChange={(e) => updateEducation(edu.id, 'twelveBoard', e.target.value)}
                          className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          placeholder="Percentage"
                          value={edu.twelvePercentage}
                          onChange={(e) => updateEducation(edu.id, 'twelvePercentage', e.target.value)}
                          className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="border-t-2 border-gray-300 pt-3 mt-3">
                      <h4 className="font-semibold text-gray-700 mb-2">10th Grade</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Board (e.g., CBSE, ICSE)"
                          value={edu.tenBoard}
                          onChange={(e) => updateEducation(edu.id, 'tenBoard', e.target.value)}
                          className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          placeholder="Percentage"
                          value={edu.tenPercentage}
                          onChange={(e) => updateEducation(edu.id, 'tenPercentage', e.target.value)}
                          className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addEducation}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
                >
                  <FaPlus /> Add Another Degree
                </button>
              </div>
            )}

            {/* Experience Tab */}
            {currentTab === 'experience' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Work Experience & Internships</h2>
                {resumeData.experience.map((exp, idx) => (
                  <div key={exp.id} className="p-4 border-2 border-gray-200 rounded-lg space-y-3">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-bold text-lg text-gray-700">Experience #{idx + 1}</h3>
                      <button
                        onClick={() => removeExperience(exp.id)}
                        className="text-red-500 hover:text-red-700 text-xl"
                      >
                        <FaTrash />
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Job Title / Position *"
                      value={exp.jobTitle}
                      onChange={(e) => updateExperience(exp.id, 'jobTitle', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Company Name *"
                      value={exp.company}
                      onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Duration (e.g., Jun 2023 - Aug 2023)"
                      value={exp.duration}
                      onChange={(e) => updateExperience(exp.id, 'duration', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <textarea
                      placeholder="Responsibilities & Achievements (bullet points)"
                      value={exp.description}
                      onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                      rows="3"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Tools & Technologies Used"
                      value={exp.tools}
                      onChange={(e) => updateExperience(exp.id, 'tools', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
                <button
                  onClick={addExperience}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
                >
                  <FaPlus /> Add Experience
                </button>
              </div>
            )}

            {/* Projects Tab */}
            {currentTab === 'projects' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Projects (2-3 recommended)</h2>
                {resumeData.projects.map((proj, idx) => (
                  <div key={proj.id} className="p-4 border-2 border-gray-200 rounded-lg space-y-3">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-bold text-lg text-gray-700">Project #{idx + 1}</h3>
                      <button
                        onClick={() => removeProject(proj.id)}
                        className="text-red-500 hover:text-red-700 text-xl"
                      >
                        <FaTrash />
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Project Title *"
                      value={proj.title}
                      onChange={(e) => updateProject(proj.id, 'title', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <textarea
                      placeholder="Project Description"
                      value={proj.description}
                      onChange={(e) => updateProject(proj.id, 'description', e.target.value)}
                      rows="2"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Technologies Used"
                      value={proj.technologies}
                      onChange={(e) => updateProject(proj.id, 'technologies', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Your Specific Contribution"
                      value={proj.contribution}
                      onChange={(e) => updateProject(proj.id, 'contribution', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
                <button
                  onClick={addProject}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
                >
                  <FaPlus /> Add Project
                </button>
              </div>
            )}

            {/* Skills Tab */}
            {currentTab === 'skills' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Skills (Categorized)</h2>
                <div className="space-y-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">Programming Languages</label>
                    <textarea
                      placeholder="e.g., Python, Java, C++, JavaScript (comma-separated)"
                      value={resumeData.skills.languages}
                      onChange={(e) => updateSkills('languages', e.target.value)}
                      rows="2"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">Tools & Frameworks</label>
                    <textarea
                      placeholder="e.g., React, Django, Spring Boot, Git (comma-separated)"
                      value={resumeData.skills.tools}
                      onChange={(e) => updateSkills('tools', e.target.value)}
                      rows="2"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">Databases</label>
                    <textarea
                      placeholder="e.g., MySQL, MongoDB, PostgreSQL (comma-separated)"
                      value={resumeData.skills.databases}
                      onChange={(e) => updateSkills('databases', e.target.value)}
                      rows="2"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">Core Concepts</label>
                    <textarea
                      placeholder="e.g., DSA, OOP, DBMS, Networking (comma-separated)"
                      value={resumeData.skills.coreConcepts}
                      onChange={(e) => updateSkills('coreConcepts', e.target.value)}
                      rows="2"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Achievements Tab */}
            {currentTab === 'achievements' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Achievements & Awards</h2>
                {resumeData.achievements.map((ach, idx) => (
                  <div key={ach.id} className="flex gap-2 items-start">
                    <textarea
                      placeholder="Achievement/Award"
                      value={ach.achievement}
                      onChange={(e) => updateAchievement(ach.id, e.target.value)}
                      rows="2"
                      className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => removeAchievement(ach.id)}
                      className="text-red-500 hover:text-red-700 text-xl mt-2"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addAchievement}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
                >
                  <FaPlus /> Add Achievement
                </button>
              </div>
            )}

            {/* Certifications Tab */}
            {currentTab === 'certifications' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Certifications</h2>
                {resumeData.certifications.map((cert, idx) => (
                  <div key={cert.id} className="p-4 border-2 border-gray-200 rounded-lg space-y-3">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-bold text-lg text-gray-700">Certification #{idx + 1}</h3>
                      <button
                        onClick={() => removeCertification(cert.id)}
                        className="text-red-500 hover:text-red-700 text-xl"
                      >
                        <FaTrash />
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Certification Name"
                      value={cert.cert}
                      onChange={(e) => updateCertification(cert.id, 'cert', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Issuing Organization"
                      value={cert.issuer}
                      onChange={(e) => updateCertification(cert.id, 'issuer', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Year"
                      value={cert.year}
                      onChange={(e) => updateCertification(cert.id, 'year', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
                <button
                  onClick={addCertification}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
                >
                  <FaPlus /> Add Certification
                </button>
              </div>
            )}

            {/* Extracurricular Tab */}
            {currentTab === 'extracurricular' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Extracurricular Activities & Leadership</h2>
                {resumeData.extracurricular.map((ext, idx) => (
                  <div key={ext.id} className="flex gap-2 items-start">
                    <textarea
                      placeholder="Activity/Leadership Role"
                      value={ext.activity}
                      onChange={(e) => updateExtracurricular(ext.id, e.target.value)}
                      rows="2"
                      className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => removeExtracurricular(ext.id)}
                      className="text-red-500 hover:text-red-700 text-xl mt-2"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addExtracurricular}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
                >
                  <FaPlus /> Add Activity
                </button>
              </div>
            )}
          </div>

          {/* Export Buttons */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <button
              onClick={downloadResume}
              className="bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
            >
              <FaDownload /> TXT
            </button>
            <button
              onClick={downloadResumePDF}
              className="bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
            >
              <FaFilePdf /> PDF
            </button>
            <button
              onClick={copyResume}
              className="bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
            >
              <FaCopy /> Copy
            </button>
          </div>
        </div>

        {/* Preview Section */}
        {showPreview && (
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-md sticky top-6 max-h-[85vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Preview</h2>
              <div className="text-sm whitespace-pre-wrap font-mono text-gray-800 leading-relaxed">
                {generateResumeText() || 'Your resume preview will appear here as you fill in the details.'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeBuilder;

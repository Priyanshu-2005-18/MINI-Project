import React, { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import { FaCheckCircle, FaTimesCircle, FaInfoCircle } from 'react-icons/fa';

const AnalysisResults = ({ analysisData }) => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    if (analysisData) {
      const skillsData = {
        labels: ['Matched', 'Missing', 'Extra'],
        datasets: [
          {
            label: 'Skills Analysis',
            data: [
              analysisData.skills_matched?.length || 0,
              analysisData.skills_missing?.length || 0,
              analysisData.extra_skills?.length || 0,
            ],
            backgroundColor: [
              '#10b981',
              '#ef4444',
              '#3b82f6',
            ],
          },
        ],
      };
      setChartData(skillsData);
    }
  }, [analysisData]);

  if (!analysisData) return null;

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
        <h3 className="text-2xl font-bold mb-2">Overall Match: {analysisData.overall_score?.toFixed(1)}%</h3>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-500 h-3 rounded-full transition-all"
            style={{ width: `${analysisData.overall_score}%` }}
          />
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div>
            <p className="text-sm text-gray-600">Semantic Match</p>
            <p className="text-lg font-semibold text-blue-600">
              {analysisData.semantic_match?.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Keyword Match</p>
            <p className="text-lg font-semibold text-blue-600">
              {analysisData.keyword_match?.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Skill Match</p>
            <p className="text-lg font-semibold text-blue-600">
              {analysisData.skill_match_percentage?.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Skills Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {chartData && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h4 className="text-lg font-semibold mb-4">Skills Overview</h4>
            <Pie data={chartData} />
          </div>
        )}

        <div className="space-y-4">
          {/* Matched Skills */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <FaCheckCircle className="text-green-500" />
              <h5 className="font-semibold text-green-900">
                Matched Skills ({analysisData.matched_skills?.length || 0})
              </h5>
            </div>
            <div className="flex flex-wrap gap-2">
              {analysisData.matched_skills?.map((skill, idx) => (
                <span
                  key={idx}
                  className="bg-green-200 text-green-800 px-3 py-1 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Missing Skills */}
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <FaTimesCircle className="text-red-500" />
              <h5 className="font-semibold text-red-900">
                Missing Skills ({analysisData.missing_skills?.length || 0})
              </h5>
            </div>
            <div className="flex flex-wrap gap-2">
              {analysisData.missing_skills?.map((skill, idx) => (
                <span
                  key={idx}
                  className="bg-red-200 text-red-800 px-3 py-1 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {analysisData.recommendations?.length > 0 && (
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <FaInfoCircle className="text-blue-500" />
            <h4 className="text-lg font-semibold text-blue-900">Recommendations</h4>
          </div>
          <ul className="space-y-2">
            {analysisData.recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span className="text-blue-800">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Extra Skills */}
      {analysisData.extra_skills?.length > 0 && (
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <h5 className="font-semibold text-purple-900 mb-2">
            Extra Skills (Bonus)
          </h5>
          <div className="flex flex-wrap gap-2">
            {analysisData.extra_skills.map((skill, idx) => (
              <span
                key={idx}
                className="bg-purple-200 text-purple-800 px-3 py-1 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisResults;

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBriefcase, FaGraduationCap, FaMicrophone, FaRobot, FaCheckCircle, FaArrowRight, FaLightbulb, FaChartLine, FaHeadset, FaShieldAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Home = () => {

  const features = [
    {
      icon: <FaBriefcase className="text-4xl" />,
      title: 'HR Resume Screening',
      description: 'Efficiently screen and rank resumes using advanced NLP',
      link: '/hr-dashboard',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: <FaGraduationCap className="text-4xl" />,
      title: 'Student Career Tools',
      description: 'Evaluate your resume and discover career opportunities',
      link: '/student-tools',
      color: 'from-green-500 to-green-600'
    }
  ];

  const hrFeatures = [
    'Bulk resume upload and management',
    'AI-powered candidate ranking',
    'Automated ATS scoring',
    'Real-time skill analysis'
  ];

  const studentFeatures = [
    'Resume quality evaluation',
    'Career path recommendations',
    'Skill gap identification',
    'Job market insights'
  ];

  const stats = [
    { number: '10,000+', label: 'Resumes Processed', icon: <FaChartLine /> },
    { number: '500+', label: 'Active Users', icon: <FaHeadset /> },
    { number: '95%', label: 'Accuracy Rate', icon: <FaCheckCircle /> },
    { number: '24/7', label: 'Support Available', icon: <FaShieldAlt /> }
  ];

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white py-20 px-4"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute -bottom-8 -right-8 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-8">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-6xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent"
            >
              Resume Screening Bot
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl text-blue-100 max-w-2xl mx-auto mb-8"
            >
              Transform recruitment with AI-powered resume screening. Advanced NLP analysis meets intuitive design for smarter hiring.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex gap-4 justify-center flex-wrap"
          >
            <Link
              to="/hr-dashboard"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all transform hover:scale-105 flex items-center gap-2"
            >
              For HR Teams <FaArrowRight />
            </Link>
            <Link
              to="/student-tools"
              className="bg-blue-700 border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-all transform hover:scale-105 flex items-center gap-2"
            >
              For Students <FaArrowRight />
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
          <p className="text-gray-600">Cutting-edge AI technology for modern recruitment</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -10 }}
              className={`bg-gradient-to-br ${feature.color} p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all cursor-pointer text-white`}
            >
              <div className="mb-4 text-4xl">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-white/90 text-sm mb-4">{feature.description}</p>
              {feature.link !== '#' && (
                <Link to={feature.link} className="inline-flex items-center gap-2 hover:gap-3 transition-all">
                  <span>Learn more</span>
                  <FaArrowRight className="text-sm" />
                </Link>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl mb-3 flex justify-center">{stat.icon}</div>
                <p className="text-4xl font-bold mb-2">{stat.number}</p>
                <p className="text-blue-100">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-600">Simple, efficient, and powerful</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: 1, title: 'Upload Resumes', desc: 'Upload single or bulk resumes in PDF, DOCX, or TXT format' },
              { num: 2, title: 'AI Analysis', desc: 'Advanced NLP engine analyzes and scores resumes instantly' },
              { num: 3, title: 'Get Insights', desc: 'Receive ranked candidates with detailed recommendations' }
            ].map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="relative"
              >
                <div className={`bg-gradient-to-br ${['from-blue-500 to-blue-600', 'from-purple-500 to-purple-600', 'from-pink-500 to-pink-600'][idx]} text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-4 mx-auto shadow-lg`}>
                  {step.num}
                </div>
                <h3 className="text-xl font-bold mb-2 text-center">{step.title}</h3>
                <p className="text-gray-600 text-center">{step.desc}</p>
                {idx < 2 && <div className="hidden md:block absolute top-1/4 -right-4 w-8 h-1 bg-gradient-to-r from-gray-300 to-transparent"></div>}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 px-4"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Process?</h2>
          <p className="text-xl mb-8 text-blue-100">Join thousands of recruiters and job seekers using Resume Screening Bot</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <motion.div whileHover={{ scale: 1.05 }}>
              <Link to="/hr-dashboard" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 inline-flex items-center gap-2">
                Start Screening <FaArrowRight />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }}>
              <Link to="/student-tools" className="bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-800 inline-flex items-center gap-2 border-2 border-white">
                Optimize Resume <FaArrowRight />
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;

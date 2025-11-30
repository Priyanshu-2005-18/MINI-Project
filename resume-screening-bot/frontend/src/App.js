import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navigation from './Navigation';
import Home from './pages/Home';
import HRDashboard from './pages/HRDashboard';
import StudentCareerTools from './pages/StudentCareerTools';
import VoiceAssistant from './pages/VoiceAssistant';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/hr-dashboard" element={<HRDashboard />} />
            <Route path="/student-tools" element={<StudentCareerTools />} />
            <Route path="/voice-assistant" element={<VoiceAssistant />} />
          </Routes>
        </main>
      </div>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </BrowserRouter>
  );
}

export default App;

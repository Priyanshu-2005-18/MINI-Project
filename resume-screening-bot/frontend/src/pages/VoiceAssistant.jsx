import React, { useRef, useState, useEffect } from 'react';
import { FaMicrophone, FaStop, FaVolumeUp, FaCheckCircle, FaTimesCircle, FaSpinner, FaCopy, FaTrash, FaDownload } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { resumeService } from '../services/api';

const VoiceAssistant = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingHistory, setRecordingHistory] = useState([]);
  const [selectedMode, setSelectedMode] = useState('resume'); // resume, cover-letter, interview-prep
  const [showPreview, setShowPreview] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const streamRef = useRef(null);

  const modes = [
    { id: 'resume', label: '📄 Resume Builder', description: 'Create resume content by speaking' },
    { id: 'cover-letter', label: '📝 Cover Letter', description: 'Draft a cover letter verbally' },
    { id: 'interview-prep', label: '🎤 Interview Prep', description: 'Practice interview responses' },
  ];

  // Timer for recording duration
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingTime(0);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        setIsTranscribing(true);
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await handleTranscribe(blob);
        setIsTranscribing(false);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.info('🎤 Recording started...');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Unable to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleTranscribe = async (blob) => {
    try {
      const formData = new FormData();
      formData.append('file', blob, 'audio.webm');
      
      // Mock transcription for now - in production, use actual speech-to-text API
      // For demo, we'll simulate with a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockTranscription = "Sample transcribed text from voice. This would be replaced with actual transcription from Google Cloud Speech-to-Text API.";
      setTranscribedText(mockTranscription);
      
      // Add to history
      const newEntry = {
        id: Date.now(),
        mode: selectedMode,
        text: mockTranscription,
        timestamp: new Date(),
        duration: recordingTime,
      };
      setRecordingHistory([newEntry, ...recordingHistory]);
      
      toast.success('✅ Transcription completed!');
    } catch (error) {
      console.error('Transcription error:', error);
      toast.error('Failed to transcribe audio');
    }
  };

  const clearTranscription = () => {
    setTranscribedText('');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(transcribedText);
    toast.success('✅ Copied to clipboard!');
  };

  const downloadAsFile = () => {
    const element = document.createElement('a');
    const file = new Blob([transcribedText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${selectedMode}-${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const deleteHistoryItem = (id) => {
    setRecordingHistory(recordingHistory.filter(item => item.id !== id));
    toast.info('Item removed from history');
  };

  const restoreFromHistory = (text) => {
    setTranscribedText(text);
    toast.info('Content restored from history');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">🎙️ Voice Assistant</h1>
        <p className="text-gray-600">Convert your voice into resume, cover letters, and interview responses</p>
      </div>

      {/* Mode Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {modes.map(mode => (
          <button
            key={mode.id}
            onClick={() => {
              setSelectedMode(mode.id);
              setTranscribedText('');
            }}
            className={`p-6 rounded-lg border-2 transition text-left ${
              selectedMode === mode.id
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <p className="text-2xl mb-2">{mode.label.split(' ')[0]}</p>
            <p className="font-semibold text-gray-800">{mode.label.split(' ').slice(1).join(' ')}</p>
            <p className="text-sm text-gray-600 mt-2">{mode.description}</p>
          </button>
        ))}
      </div>

      {/* Recording Interface */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-lg border-2 border-blue-200">
        <div className="flex flex-col items-center gap-6">
          {/* Recording Indicator */}
          {isRecording && (
            <div className="flex items-center gap-3">
              <div className="animate-pulse">
                <div className="w-4 h-4 bg-red-500 rounded-full" />
              </div>
              <span className="text-lg font-bold text-red-600">Recording...</span>
              <span className="text-2xl font-mono text-gray-700">{formatTime(recordingTime)}</span>
            </div>
          )}

          {/* Microphone Button */}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isTranscribing}
            className={`
              w-32 h-32 rounded-full flex items-center justify-center text-white font-bold text-3xl
              transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed
              ${isRecording
                ? 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg'
                : 'bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg'
              }
            `}
            title={isRecording ? 'Stop Recording' : 'Start Recording'}
          >
            {isTranscribing ? (
              <FaSpinner className="animate-spin" />
            ) : isRecording ? (
              <FaStop />
            ) : (
              <FaMicrophone />
            )}
          </button>

          {/* Status Message */}
          {!isRecording && !isTranscribing && (
            <p className="text-center text-gray-600">
              Click the microphone to start recording your {modes.find(m => m.id === selectedMode)?.label || 'content'}
            </p>
          )}
          
          {isTranscribing && (
            <p className="text-center text-blue-600 font-semibold flex items-center gap-2">
              <FaSpinner className="animate-spin" /> Processing your voice...
            </p>
          )}
        </div>
      </div>

      {/* Transcription Display */}
      {transcribedText && (
        <div className="bg-white rounded-lg border-2 border-green-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2 text-green-700">
              <FaCheckCircle /> Transcribed Content
            </h3>
            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
              >
                <FaCopy /> Copy
              </button>
              <button
                onClick={downloadAsFile}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
              >
                <FaDownload /> Download
              </button>
              <button
                onClick={clearTranscription}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
              >
                <FaTrash /> Clear
              </button>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 min-h-24 max-h-64 overflow-y-auto">
            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{transcribedText}</p>
          </div>

          {/* Word Count */}
          <p className="text-sm text-gray-600 mt-3">
            📊 Words: <strong>{transcribedText.split(/\s+/).length}</strong> | 
            Characters: <strong>{transcribedText.length}</strong>
          </p>
        </div>
      )}

      {/* Recording History */}
      {recordingHistory.length > 0 && (
        <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
          <h3 className="text-xl font-bold mb-4">📋 Recording History</h3>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {recordingHistory.map((item, idx) => (
              <div key={item.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-800">
                        {modes.find(m => m.id === item.mode)?.label}
                      </span>
                      <span className="text-xs bg-gray-300 text-gray-800 px-2 py-1 rounded">
                        {item.duration}s
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2">{item.text}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.timestamp.toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => restoreFromHistory(item.text)}
                      className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition"
                      title="Restore"
                    >
                      <FaVolumeUp size={16} />
                    </button>
                    <button
                      onClick={() => deleteHistoryItem(item.id)}
                      className="p-2 bg-red-500 hover:bg-red-600 text-white rounded transition"
                      title="Delete"
                    >
                      <FaTrash size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips Section */}
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          💡 Tips for Best Results
        </h3>
        <ul className="space-y-2 text-gray-700">
          <li>🔊 Speak clearly and at a moderate pace</li>
          <li>🤫 Use a quiet environment for better accuracy</li>
          <li>⏸️ Pause between sentences for better punctuation</li>
          <li>🎯 Use complete sentences rather than fragments</li>
          <li>📝 Review and edit the transcribed text before using it</li>
        </ul>
      </div>
    </div>
  );
};

export default VoiceAssistant;

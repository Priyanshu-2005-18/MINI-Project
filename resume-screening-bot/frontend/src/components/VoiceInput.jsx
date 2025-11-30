import React, { useRef, useState, useEffect } from 'react';
import { FaMicrophone, FaStop, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';

const VoiceInput = ({ onTranscribe, label = "Click to record", onRecordingStateChange }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const streamRef = useRef(null);

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
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
        setIsProcessing(true);
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onTranscribe?.(blob);
        setIsProcessing(false);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      onRecordingStateChange?.(true);
      toast.info('🎤 Recording started');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Unable to access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      onRecordingStateChange?.(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
        className={`
          p-4 rounded-full text-white font-bold transition-all transform hover:scale-110
          disabled:opacity-50 disabled:cursor-not-allowed
          ${isRecording
            ? 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg'
            : 'bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg'
          }
        `}
        title={label}
      >
        {isProcessing ? (
          <FaSpinner className="animate-spin" size={20} />
        ) : isRecording ? (
          <FaStop size={20} />
        ) : (
          <FaMicrophone size={20} />
        )}
      </button>
      
      <div className="flex-1">
        {isRecording && (
          <div className="flex items-center gap-2">
            <div className="animate-pulse">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
            </div>
            <span className="text-sm font-bold text-red-600">Recording {formatTime(recordingTime)}</span>
          </div>
        )}
        
        {isProcessing && (
          <span className="text-sm font-semibold text-blue-600 flex items-center gap-2">
            <FaSpinner className="animate-spin" size={14} /> Processing...
          </span>
        )}
        
        {!isRecording && !isProcessing && (
          <span className="text-sm text-gray-600">{label}</span>
        )}
      </div>
    </div>
  );
};

export default VoiceInput;

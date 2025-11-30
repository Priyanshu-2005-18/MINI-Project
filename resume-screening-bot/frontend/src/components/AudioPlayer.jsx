import React, { useRef } from 'react';
import { FaPlay, FaDownload } from 'react-icons/fa';
import { voiceService } from '../services/api';
import { toast } from 'react-toastify';

const AudioPlayer = ({ audioBlob, filename }) => {
  const audioRef = useRef(null);

  const downloadAudio = () => {
    const url = URL.createObjectURL(audioBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'audio.mp3';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center gap-3 bg-gray-100 p-4 rounded-lg">
      <audio
        ref={audioRef}
        src={URL.createObjectURL(audioBlob)}
        controls
        className="flex-1"
      />
      <button
        onClick={downloadAudio}
        className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
        title="Download audio"
      >
        <FaDownload />
      </button>
    </div>
  );
};

export default AudioPlayer;

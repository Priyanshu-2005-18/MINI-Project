import speech_recognition as sr
import pyttsx3
from typing import Tuple
import io

class VoiceAssistant:
    """Handle voice input and output"""
    
    def __init__(self):
        self.recognizer = sr.Recognizer()
        try:
            self.engine = pyttsx3.init()
            self.engine.setProperty('rate', 150)  # Speech rate
        except Exception as e:
            print(f"Warning: Could not initialize voice engine: {e}")
            self.engine = None
    
    def transcribe_audio_file(self, audio_path: str) -> Tuple[str, float]:
        """
        Transcribe audio file to text
        Returns: (transcribed_text, confidence_score)
        """
        try:
            with sr.AudioFile(audio_path) as source:
                audio = self.recognizer.record(source)
            
            text = self.recognizer.recognize_google(audio)
            confidence = 0.95  # Google API doesn't return confidence, assume high
            
            return text, confidence
        except sr.UnknownValueError:
            return "", 0.0
        except sr.RequestError as e:
            print(f"Speech recognition error: {e}")
            return "", 0.0
    
    def transcribe_from_microphone(self, timeout: int = 10) -> Tuple[str, float]:
        """
        Transcribe from microphone
        Returns: (transcribed_text, confidence_score)
        """
        try:
            with sr.Microphone() as source:
                self.recognizer.adjust_for_ambient_noise(source)
                print("Listening...")
                audio = self.recognizer.listen(source, timeout=timeout)
            
            text = self.recognizer.recognize_google(audio)
            confidence = 0.95
            
            return text, confidence
        except sr.UnknownValueError:
            return "", 0.0
        except sr.RequestError as e:
            print(f"Speech recognition error: {e}")
            return "", 0.0
    
    def text_to_speech(self, text: str, output_path: str = None) -> bytes:
        """
        Convert text to speech
        If output_path is provided, saves to file
        Returns: audio bytes
        """
        try:
            self.engine.save_to_file(text, output_path or 'output.mp3')
            self.engine.runAndWait()
            
            if output_path:
                with open(output_path, 'rb') as f:
                    return f.read()
            
            return b""
        except Exception as e:
            print(f"Text-to-speech error: {e}")
            return b""
    
    def speak(self, text: str):
        """Speak text directly without saving"""
        try:
            self.engine.say(text)
            self.engine.runAndWait()
        except Exception as e:
            print(f"Speech error: {e}")
    
    def set_voice_properties(self, rate: int = 150, volume: float = 1.0):
        """Set voice properties (rate and volume)"""
        self.engine.setProperty('rate', rate)
        self.engine.setProperty('volume', volume)

class GoogleCloudVoiceService:
    """Google Cloud Speech-to-Text and Text-to-Speech service"""
    
    def __init__(self, credentials_path: str = None):
        self.credentials_path = credentials_path
        try:
            from google.cloud import speech_v1, texttospeech_v1
            self.speech_client = speech_v1.SpeechClient()
            self.tts_client = texttospeech_v1.TextToSpeechClient()
        except ImportError:
            print("Google Cloud libraries not installed. Install with: pip install google-cloud-speech google-cloud-texttospeech")
            self.speech_client = None
            self.tts_client = None
    
    def transcribe_audio(self, audio_path: str, language_code: str = 'en-US') -> Tuple[str, float]:
        """Transcribe audio using Google Cloud Speech-to-Text"""
        if not self.speech_client:
            return "", 0.0
        
        try:
            from google.cloud import speech_v1
            
            with open(audio_path, 'rb') as audio_file:
                content = audio_file.read()
            
            audio = speech_v1.RecognitionAudio(content=content)
            config = speech_v1.RecognitionConfig(
                encoding=speech_v1.RecognitionConfig.AudioEncoding.LINEAR16,
                sample_rate_hertz=16000,
                language_code=language_code,
            )
            
            response = self.speech_client.recognize(config=config, audio=audio)
            
            if response.results:
                result = response.results[0]
                if result.alternatives:
                    transcript = result.alternatives[0].transcript
                    confidence = result.alternatives[0].confidence
                    return transcript, confidence
            
            return "", 0.0
        except Exception as e:
            print(f"Google Cloud transcription error: {e}")
            return "", 0.0
    
    def synthesize_speech(self, text: str, language_code: str = 'en-US', voice_name: str = 'en-US-Neural2-A') -> bytes:
        """Synthesize speech using Google Cloud Text-to-Speech"""
        if not self.tts_client:
            return b""
        
        try:
            from google.cloud import texttospeech_v1
            
            synthesis_input = texttospeech_v1.SynthesisInput(text=text)
            
            voice = texttospeech_v1.VoiceSelectionParams(
                language_code=language_code,
                name=voice_name
            )
            
            audio_config = texttospeech_v1.AudioConfig(
                audio_encoding=texttospeech_v1.AudioEncoding.MP3
            )
            
            response = self.tts_client.synthesize_speech(
                input=synthesis_input,
                voice=voice,
                audio_config=audio_config
            )
            
            return response.audio_content
        except Exception as e:
            print(f"Google Cloud synthesis error: {e}")
            return b""

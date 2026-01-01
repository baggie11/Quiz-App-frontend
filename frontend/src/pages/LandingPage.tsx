import React, { useState, useRef, useEffect, type ChangeEvent, type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mic, 
  Headphones, 
  CheckCircle,
  Globe,
  Shield,
  Accessibility,
  Users,
  Brain,
  Hash,
  Volume2,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  VolumeX
} from 'lucide-react';
import { API } from '../api/config';

// === TTS Functions (Coqui + Browser Fallback) ===

const speakWithCoqui = async (text: string, callback?: () => void): Promise<void> => {
  try {
    console.log('Coqui TTS: Requesting speech for:', text);
    
    const formData = new FormData();
    formData.append('text', text);
    
    const response = await fetch(`${API.python}/tts`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    
    const audioBlob = await response.blob();
    if (audioBlob.size === 0) throw new Error('Empty audio');

    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    
    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
      callback?.();
    };
    
    audio.onerror = () => {
      URL.revokeObjectURL(audioUrl);
      fallbackSpeak(text, callback);
    };
    
    await audio.play();
  } catch (error) {
    console.error('Coqui TTS Error:', error);
    fallbackSpeak(text, callback);
  }
};

const fallbackSpeak = (text: string, callback?: () => void): void => {
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
    
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.lang = 'en-US';
      
      if (callback) {
        utterance.onend = () => callback();
      }
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        callback?.();
      };
      
      speechSynthesis.speak(utterance);
    }, 150);
  } else {
    callback?.();
  }
};

const speak = (text: string, callback?: () => void): void => {
  speakWithCoqui(text, callback);
};

// === Navbar & Footer (keep the same) ===
const Navbar: React.FC = () => {
  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#2563eb] to-[#3b82f6] rounded-xl flex items-center justify-center shadow-md">
              <Brain className="text-white" size={24} />
            </div>
            <span className="text-2xl font-bold text-gray-900">QuizVision</span>
          </div>
          <div className="flex items-center space-x-6">
            <button className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-[#2563eb] transition-colors">
              <Accessibility size={20} />
              <span className="text-sm font-medium">Accessibility</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-16">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Brain className="text-[#2563eb]" size={24} />
              <span className="font-bold text-gray-900">QuizVision</span>
            </div>
            <p className="text-sm text-gray-600">Making assessments accessible for everyone.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Globe size={16} className="mr-2 text-[#2563eb]" />
              Features
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Voice Input</li>
              <li>Text-to-Speech</li>
              <li>High Contrast Mode</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Shield size={16} className="mr-2 text-[#2563eb]" />
              Accessibility
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>WCAG 2.1 Compliant</li>
              <li>Screen Reader Support</li>
              <li>Keyboard Navigation</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Users size={16} className="mr-2 text-[#2563eb]" />
              Support
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Documentation</li>
              <li>Help Center</li>
              <li>Contact Us</li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-600">© 2025 QuizVision. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-sm text-gray-600 hover:text-[#2563eb]">Privacy Policy</a>
            <a href="#" className="text-sm text-gray-600 hover:text-[#2563eb]">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

// === Main Component ===

const QuizVision: React.FC = () => {
  // State
  const [joinCode, setJoinCode] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechError, setSpeechError] = useState<string>('');
  const [recognizedText, setRecognizedText] = useState<string>('');
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState<'welcome' | 'listenCode' | 'confirm' | 'joining'>('welcome');
  const [confirmationText, setConfirmationText] = useState<string>('');
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [micPermission, setMicPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [hasStartedVoiceFlow, setHasStartedVoiceFlow] = useState<boolean>(false);
  const [isTTSActive, setIsTTSActive] = useState<boolean>(false);
  const [hasPlayedIntro, setHasPlayedIntro] = useState<boolean>(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState<boolean>(false);
  const [audioStats, setAudioStats] = useState<{size: number; type: string} | null>(null);

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const joinCodeRef = useRef<string>('');
  const isSpeakingRef = useRef<boolean>(false);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const navigate = useNavigate();

  const setJoinCodeWithRef = (code: string): void => {
    setJoinCode(code);
    joinCodeRef.current = code;
  };

  // Cleanup
  const cleanup = (): void => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    // Stop all media tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    speechSynthesis.cancel();
  };

  // Audio visualizer
  const startAudioMonitoring = async (stream: MediaStream): Promise<void> => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContextClass();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      const updateLevel = (): void => {
        if (!analyserRef.current) return;
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(Math.min(average / 128, 1));
        animationFrameRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();
    } catch (err) {
      console.error('Audio monitoring error:', err);
    }
  };

  // === Custom ASR Integration ===
  const startRecording = async (mode: 'code' | 'confirm' = 'code'): Promise<void> => {
    setSpeechError('');
    setRecognizedText('');
    setAudioStats(null);
    if (mode === 'code') setConfirmationText('');
    recordedChunksRef.current = [];

    try {
      // Get microphone permission first
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
          channelCount: 1
        }
      });
      
      streamRef.current = stream;
      setMicPermission('granted');

      // Start audio monitoring for visualization
      startAudioMonitoring(stream);

      // Get supported MIME types
      let mimeType = '';
      const options = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
        'audio/wav'
      ];

      for (const option of options) {
        if (MediaRecorder.isTypeSupported(option)) {
          mimeType = option;
          console.log('Selected MIME type:', mimeType);
          break;
        }
      }

      if (!mimeType) {
        throw new Error('No supported MIME type for MediaRecorder');
      }

      const mediaRecorder = new MediaRecorder(stream, { 
        mimeType,
        audioBitsPerSecond: 128000 // Better quality
      });
      
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
          console.log('Chunk received:', e.data.size, 'bytes');
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('Recording stopped, chunks:', recordedChunksRef.current.length);
        
        if (recordedChunksRef.current.length === 0) {
          setSpeechError('No audio captured.');
          return;
        }
        
        const audioBlob = new Blob(recordedChunksRef.current, { 
          type: mimeType || 'audio/webm'
        });
        
        // Debug: Log audio details
        console.log('Audio Blob:', {
          size: audioBlob.size,
          type: audioBlob.type,
          chunks: recordedChunksRef.current.length
        });
        
        setAudioStats({
          size: audioBlob.size,
          type: audioBlob.type
        });
        
        await sendAudioToASR(audioBlob, mode);
        
        // Stop the stream after processing
        stream.getTracks().forEach(track => {
          track.stop();
          console.log('Track stopped:', track.kind);
        });
        
        streamRef.current = null;
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setSpeechError('Recording error occurred.');
        setIsListening(false);
      };

      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms
      setIsListening(true);
      console.log('Recording started with MIME type:', mimeType);

      // Auto-stop after 8 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          console.log('Auto-stopping recording after timeout');
          mediaRecorderRef.current.stop();
        }
      }, 8000);

    } catch (err: any) {
      console.error('Recording error:', err);
      setIsListening(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setMicPermission('denied');
        setSpeechError('Microphone access denied. Please allow permission.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setSpeechError('No microphone found. Please check your audio device.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setSpeechError('Microphone is already in use by another application.');
      } else {
        setSpeechError(`Failed to start recording: ${err.message}`);
      }
    }
  };

  const sendAudioToASR = async (audioBlob: Blob, mode: 'code' | 'confirm'): Promise<void> => {
    console.log('Sending audio to ASR:', {
      size: audioBlob.size,
      type: audioBlob.type,
      mode
    });

    const formData = new FormData();
    
    // Convert to WAV format if needed (Whisper prefers WAV)
    let fileToSend = audioBlob;
    let filename = 'speech.webm';
    
    // If not audio/wav, try to convert
    if (!audioBlob.type.includes('wav')) {
      try {
        // Try to convert to WAV using Web Audio API
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const arrayBuffer = await audioBlob.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        // Create WAV blob
        const wavBlob = audioBufferToWav(audioBuffer);
        fileToSend = wavBlob;
        filename = 'speech.wav';
        console.log('Converted to WAV format');
      } catch (conversionError) {
        console.warn('Could not convert to WAV, sending original:', conversionError);
      }
    }
    
    formData.append('audio', fileToSend, filename);

    try {
      setIsListening(false);
      
      // Add timeout for the request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      console.log('Sending POST request to ASR endpoint...');
      
      const response = await fetch(`${API.python}/asr`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        }
      });
      
      clearTimeout(timeoutId);
      
      console.log('ASR Response status:', response.status);
      
      if (!response.ok) {
        let errorText = '';
        try {
          errorText = await response.text();
          console.error('ASR error response:', errorText);
        } catch (e) {
          errorText = 'Could not read error response';
        }
        throw new Error(`ASR error: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('ASR result:', result);
      
      if (result.error) {
        throw new Error(`ASR server error: ${result.error}`);
      }
      
      const transcript = (result.text || '').trim().toLowerCase();
      
      if (!transcript) {
        console.warn('Empty transcript received');
        retryWithMessage('No speech detected. Please try again.', mode);
        return;
      }
      
      processTranscript(transcript, mode);
      
    } catch (err: any) {
      console.error('ASR fetch failed:', err);
      if (err.name === 'AbortError') {
        retryWithMessage('Request timeout. Please try again.', mode);
      } else {
        retryWithMessage('Speech recognition failed. Please try again.', mode);
      }
    }
  };

  // Helper function to convert AudioBuffer to WAV Blob
  const audioBufferToWav = (buffer: AudioBuffer): Blob => {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    
    // Get audio data
    const length = buffer.length * numChannels * bytesPerSample;
    const wav = new ArrayBuffer(44 + length);
    const view = new DataView(wav);
    
    // Write WAV header
    // RIFF identifier
    writeString(view, 0, 'RIFF');
    // File length
    view.setUint32(4, 36 + length, true);
    // RIFF type
    writeString(view, 8, 'WAVE');
    // Format chunk identifier
    writeString(view, 12, 'fmt ');
    // Format chunk length
    view.setUint32(16, 16, true);
    // Sample format (raw)
    view.setUint16(20, format, true);
    // Channel count
    view.setUint16(22, numChannels, true);
    // Sample rate
    view.setUint32(24, sampleRate, true);
    // Byte rate (sample rate * block align)
    view.setUint32(28, sampleRate * blockAlign, true);
    // Block align (channel count * bytes per sample)
    view.setUint16(32, blockAlign, true);
    // Bits per sample
    view.setUint16(34, bitDepth, true);
    // Data chunk identifier
    writeString(view, 36, 'data');
    // Data chunk length
    view.setUint32(40, length, true);
    
    // Write audio data
    const channels = [];
    for (let i = 0; i < numChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }
    
    let offset = 44;
    for (let i = 0; i < buffer.length; i++) {
      for (let channel = 0; channel < numChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, channels[channel][i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }
    }
    
    return new Blob([wav], { type: 'audio/wav' });
  };

  const writeString = (view: DataView, offset: number, string: string): void => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  const processTranscript = (transcript: string, mode: 'code' | 'confirm'): void => {
    console.log('Processing transcript:', transcript, 'mode:', mode);
    
    if (mode === 'code') {
      let processed = transcript.toUpperCase().replace(/\s+/g, '').replace(/[^A-Z0-9]/g, '');
      const match = processed.match(/[A-Z]{4}\d{4}|[A-Z0-9]{8}|[A-Z]{3,}\d{3,}/);
      if (match) processed = match[0];
      else if (processed.length >= 4) processed = processed.substring(0, 12);

      setRecognizedText(transcript);
      setJoinCodeWithRef(processed);

      if (processed) {
        isSpeakingRef.current = true;
        setIsTTSActive(true);
        setIsLoadingAudio(true);
        speak(`Code recognized: ${processed.split('').join(' ')}.`, () => {
          setTimeout(() => {
            setCurrentStep('confirm');
            speak(`Is this code correct? Say "yes" to proceed or "no" to try again.`, () => {
              isSpeakingRef.current = false;
              setIsTTSActive(false);
              setIsLoadingAudio(false);
              setIsConfirming(true);
              setTimeout(() => startRecording('confirm'), 500);
            });
          }, 500);
        });
      } else {
        retryWithMessage("I couldn't recognize a valid quiz code. Please try again.", 'code');
      }
    } else if (mode === 'confirm') {
      setIsConfirming(false);
      setConfirmationText(transcript);

      if (transcript.includes('yes') || transcript.includes('correct') || transcript.includes('proceed')) {
        const code = joinCodeRef.current;
        if (code) {
          speak(`Great! Joining quiz ${code.split('').join(' ')} now...`, () => {
            setCurrentStep('joining');
            setTimeout(handleJoinQuiz, 800);
          });
        } else {
          retryWithMessage("No code found. Let's start over.", 'code');
        }
      } else if (transcript.includes('no') || transcript.includes('wrong') || transcript.includes('try again')) {
        retryWithMessage("Okay, let's try again. Please speak your quiz code.", 'code');
      } else {
        retryWithMessage("I didn't understand. Say 'yes' or 'no'.", 'confirm');
      }
    }
  };

  const retryWithMessage = (msg: string, mode: 'code' | 'confirm') => {
    isSpeakingRef.current = true;
    setIsTTSActive(true);
    setIsLoadingAudio(true);
    speak(msg, () => {
      isSpeakingRef.current = false;
      setIsTTSActive(false);
      setIsLoadingAudio(false);
      if (mode === 'code') {
        setJoinCodeWithRef('');
        setRecognizedText('');
        setCurrentStep('listenCode');
      }
      setTimeout(() => startRecording(mode), 1000);
    });
  };

  const stopRecording = (): void => {
    if (mediaRecorderRef.current?.state === 'recording') {
      console.log('Manually stopping recording');
      mediaRecorderRef.current.stop();
    }
    setIsListening(false);
    setIsConfirming(false);
    speechSynthesis.cancel();
    isSpeakingRef.current = false;
    setIsTTSActive(false);
    setIsLoadingAudio(false);
    
    // Clean up stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // === Handlers ===
  const handleJoinCodeChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value.toUpperCase();
    setJoinCodeWithRef(value);
    setSpeechError('');
  };

  const handleTapToStartTTS = (): void => {
    if (isSpeakingRef.current || isLoadingAudio) {
      speechSynthesis.cancel();
      setIsTTSActive(false);
      isSpeakingRef.current = false;
      setIsLoadingAudio(false);
      return;
    }

    setIsTTSActive(true);
    setIsLoadingAudio(true);

    if (!hasPlayedIntro) {
      isSpeakingRef.current = true;
      speak("Welcome to Quiz Vision. Please speak your quiz code when ready. Or type it in the box. Say the code like Q-U-I-Z-1-2-3-4.", () => {
        isSpeakingRef.current = false;
        setIsTTSActive(false);
        setIsLoadingAudio(false);
        setHasPlayedIntro(true);
      });
    } else {
      const message = joinCode
        ? `Current code is ${joinCode.split('').join(' ')}. ${currentStep === 'confirm' ? 'Say yes to confirm or no to change it.' : 'Click speak to start voice input or type to edit.'}`
        : 'Ready for your quiz code. Speak or type it now.';
           isSpeakingRef.current = true;
      speak(message, () => {
        isSpeakingRef.current = false;
        setIsTTSActive(false);
        setIsLoadingAudio(false);
      });
    }
  };

  const playWelcomeMessage = (): void => {
    if (hasPlayedIntro) return;
    setIsLoadingAudio(true);
    setIsTTSActive(true);
    speak("Welcome to Quiz Vision. Speak out your session code.", () => {
      setIsTTSActive(false);
      setIsLoadingAudio(false);
      setHasPlayedIntro(true);
      setHasStartedVoiceFlow(true);
      setCurrentStep('listenCode');
      setTimeout(() => startRecording('code'), 500);
    });
  };

  const handleStartVoiceFlow = (): void => {
    setHasStartedVoiceFlow(true);
    setCurrentStep('listenCode');
    startRecording('code');
  };

  const handleVoiceInputCode = (): void => {
    if (isListening) {
      stopRecording();
    } else {
      if (currentStep === 'listenCode') startRecording('code');
      else if (currentStep === 'confirm') {
        setIsConfirming(true);
        startRecording('confirm');
      } else handleStartVoiceFlow();
    }
  };

  const handleReadCode = (): void => {
    if (joinCode) {
      speak(`Your code is ${joinCode.split('').join(' ')}.`);
    }
  };

  const handleJoinQuiz = async (): Promise<void> => {
    const code = joinCodeRef.current || joinCode;
    if (!code || !/^[A-Z0-9]{4,12}$/.test(code)) {
      speak("Invalid or missing code.");
      return;
    }

    setIsLoadingAudio(true);
    try {
      const res = await fetch(`${API.node}/api/session/check-exists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ joinCode: code }),
      });
      const data = await res.json();
      if (data?.status === 'ok' && data?.data?.exists) {
        navigate(`/enter-name?code=${code}`);
      } else {
        speak("No quiz found with this code. Please try again.");
      }
    } catch {
      speak("Unable to verify quiz. Please try again.");
    } finally {
      setIsLoadingAudio(false);
    }
  };

  // UI Helpers
  const getStepMessage = (): string => {
    switch (currentStep) {
      case 'welcome': return isLoadingAudio ? 'Playing welcome...' : 'Welcome ready';
      case 'listenCode': return isListening ? 'Listening for code...' : 'Ready for code';
      case 'confirm': return isConfirming ? 'Listening for confirmation...' : 'Awaiting confirmation';
      case 'joining': return 'Joining quiz...';
      default: return 'Ready';
    }
  };

  const getStepIcon = (): JSX.Element => {
    switch (currentStep) {
      case 'welcome': return <Volume2 size={16} className={isLoadingAudio ? "text-blue-500 animate-pulse" : "text-blue-500"} />;
      case 'listenCode': return <Mic size={16} className={isListening ? "text-red-500 animate-pulse" : "text-red-500"} />;
      case 'confirm': return isConfirming ? <Mic size={16} className="text-amber-500 animate-pulse" /> : <Volume2 size={16} className="text-amber-500" />;
      case 'joining': return <CheckCircle size={16} className="text-emerald-500" />;
      default: return <Brain size={16} />;
    }
  };

  // Auto-play welcome
  useEffect(() => {
    const timer = setTimeout(playWelcomeMessage, 1000);
    return () => {
      clearTimeout(timer);
      cleanup();
    };
  }, []);

  // Handle tap anywhere for instructions
  const handleMainClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    const target = e.target as HTMLElement;
    if (!['INPUT', 'BUTTON'].includes(target.tagName) && !target.closest('button') && !target.closest('input')) {
      handleTapToStartTTS();
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main ref={mainContentRef} className="max-w-6xl mx-auto px-6 py-8 cursor-pointer" onClick={handleMainClick}>
        {/* Microphone Permission Alert */}
        {micPermission === 'denied' && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-3">
            <AlertCircle className="text-amber-600 mt-0.5" size={20} />
            <div>
              <h3 className="font-semibold text-amber-900 mb-1">Microphone Access Required</h3>
              <p className="text-sm text-amber-700">Please allow microphone access to use voice input.</p>
            </div>
          </div>
        )}

        {/* TTS Status */}
        {(isTTSActive || isLoadingAudio) && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center">
            {isLoadingAudio ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm font-medium text-blue-700 ml-2">Loading Coqui TTS...</span>
              </>
            ) : (
              <>
                <Volume2 className="text-blue-600 animate-pulse" size={20} />
                <span className="text-sm font-medium text-blue-700 ml-2">Speaking...</span>
              </>
            )}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl mb-4">
                <Brain className="text-[#2563eb]" size={32} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Join Interactive Quiz</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                {hasStartedVoiceFlow ? "Speak your quiz code now" : "Welcome! Listening will start after the greeting..."}
              </p>
              <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-gray-500">
                <VolumeX size={16} />
                <span>Tap anywhere to hear instructions</span>
              </div>
            </div>

            {/* Step Progress */}
            <div className="max-w-xl mx-auto mb-6">
              <div className="flex items-center justify-between mb-4 px-4">
                {['welcome', 'listenCode', 'confirm', 'joining'].map((step, i) => (
                  <div key={step} className={`flex flex-col items-center ${currentStep === step ? 'text-[#2563eb]' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === step ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      {i + 1}
                    </div>
                    <span className="text-xs mt-1 capitalize">{step === 'listenCode' ? 'Enter Code' : step}</span>
                  </div>
                ))}
                <div className="flex-1 h-0.5 bg-gray-200 mx-2" />
              </div>
            </div>

            {/* Status Indicator */}
            <div className="max-w-xl mx-auto mb-6">
              <div className="flex items-center justify-center space-x-3 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                {getStepIcon()}
                <span className="text-sm font-medium text-gray-700">{getStepMessage()}</span>
                {isListening && (
                  <div className="flex space-x-1 ml-2">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-[#2563eb] rounded-full transition-all duration-100"
                        style={{ height: `${8 + audioLevel * 16 * (1 + Math.sin(Date.now() / 200 + i))}px` }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {recognizedText && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100 text-sm text-blue-700">
                  <Mic size={12} className="inline mr-2" /> Recognized: {recognizedText}
                </div>
              )}

              {confirmationText && (
                <div className={`mt-3 p-3 rounded-lg border flex items-center space-x-3 ${confirmationText.includes('yes') ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  {confirmationText.includes('yes') ? <ThumbsUp size={16} className="text-emerald-600" /> : <ThumbsDown size={16} className="text-red-600" />}
                  <p className={`text-sm ${confirmationText.includes('yes') ? 'text-emerald-700' : 'text-red-700'}`}>
                    Confirmation: {confirmationText}
                  </p>
                </div>
              )}

              {/* Debug: Audio Stats */}
              {audioStats && (
                <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                  Audio: {audioStats.size} bytes, {audioStats.type}
                </div>
              )}
            </div>

            {/* Input */}
            <div className="max-w-xl mx-auto mb-8">
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="joinCode" className="text-sm font-medium text-gray-900">Quiz Code</label>
              </div>
              <div className="relative">
                <Hash size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  id="joinCode"
                  value={joinCode}
                  onChange={handleJoinCodeChange}
                  placeholder="Type code or use voice (e.g., QUIZ1234)"
                  className="w-full pl-12 pr-4 py-3 text-base bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all"
                />
                {joinCode && <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600" size={20} />}
              </div>

              <div className="flex justify-between mt-4">
                <div className="flex space-x-2">
                  <button 
                    onClick={handleVoiceInputCode} 
                    className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${isListening ? 'bg-red-50 border border-red-200 text-red-600' : 'bg-blue-50 border border-blue-200 text-[#2563eb]'}`}
                    disabled={micPermission === 'denied'}
                  >
                    <Mic size={14} />
                    <span>{isListening ? 'Stop' : 'Speak'}</span>
                  </button>
                  <button onClick={handleReadCode} disabled={!joinCode} className="px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 text-[#2563eb] disabled:opacity-50">
                    <Headphones size={14} />
                    <span>Hear</span>
                  </button>
                  <button onClick={handleTapToStartTTS} className="px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 text-[#2563eb]">
                    <VolumeX size={14} />
                    <span>Instructions</span>
                  </button>
                </div>
              </div>

              {speechError && (
                <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-100 text-sm text-red-700">
                  Error: {speechError}
                </div>
              )}
            </div>

            {/* Join Button */}
            <div className="max-w-xl mx-auto">
              <button
                onClick={handleJoinQuiz}
                disabled={!joinCode || currentStep === 'joining' || isLoadingAudio}
                className={`w-full py-4 rounded-xl font-semibold text-base transition-all ${
                  joinCode && currentStep !== 'joining' && !isLoadingAudio
                    ? 'bg-gradient-to-r from-[#2563eb] to-[#3b82f6] hover:from-[#1d4ed8] hover:to-[#2563eb] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {currentStep === 'joining' ? 'Joining Quiz Session...' : 'Join Quiz Session'}
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default QuizVision;
import React, { useState, useRef, useEffect, type ChangeEvent, type JSX, type MouseEvent } from 'react';
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

// Define types for Speech Recognition API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  error?: string;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
    webkitAudioContext: typeof AudioContext;
  }
}

// Speak utility function
const speak = (text: string, callback?: () => void): void => {
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
    
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.lang = 'en-US';
      
      if (callback) {
        utterance.onend = callback;
      }
      
      speechSynthesis.speak(utterance);
    }, 150);
  } else if (callback) {
    callback();
  }
};

// Navbar Component
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

// Footer Component
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
          <p className="text-sm text-gray-600">© 2024 QuizVision. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-sm text-gray-600 hover:text-[#2563eb]">Privacy Policy</a>
            <a href="#" className="text-sm text-gray-600 hover:text-[#2563eb]">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Main Component
const QuizVision: React.FC = () => {
  // State declarations
  const [joinCode, setJoinCode] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechError, setSpeechError] = useState<string>('');
  const [recognizedText, setRecognizedText] = useState<string>('');
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState<'welcome' | 'listenCode' | 'confirm' | 'joining'>('listenCode');
  const [confirmationText, setConfirmationText] = useState<string>('');
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [browserSupported, setBrowserSupported] = useState<boolean>(true);
  const [micPermission, setMicPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [hasStartedVoiceFlow, setHasStartedVoiceFlow] = useState<boolean>(false);
  const [isTTSActive, setIsTTSActive] = useState<boolean>(false);
  const [hasPlayedIntro, setHasPlayedIntro] = useState<boolean>(false);

  // Refs
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const joinCodeRef = useRef<string>('');
  const isSpeakingRef = useRef<boolean>(false);
  const mainContentRef = useRef<HTMLDivElement>(null);

  const setJoinCodeWithRef = (code: string): void => {
    setJoinCode(code);
    joinCodeRef.current = code;
  };

  // Auto-start microphone when component mounts
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setBrowserSupported(false);
      setSpeechError('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari on desktop.');
      return;
    }

    // Check if page is HTTPS or localhost
    const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
    if (!isSecure && SpeechRecognition) {
      setSpeechError('Speech recognition requires HTTPS. This feature may not work on HTTP.');
    }

    // Auto-start the voice flow without TTS
    const startTimer = setTimeout(() => {
      handleStartVoiceFlow();
    }, 500);

    // Add click listener to main content
    const mainContent = mainContentRef.current;
    if (mainContent) {
      const handleMainContentClick = (e: MouseEvent) => {
        // Prevent triggering on input field clicks to avoid interrupting typing
        if ((e.target as HTMLElement).tagName !== 'INPUT' && 
            (e.target as HTMLElement).tagName !== 'BUTTON' &&
            !(e.target as HTMLElement).closest('button') &&
            !(e.target as HTMLElement).closest('input')) {
          handleTapToStartTTS();
        }
      };
      
      mainContent.addEventListener('click', handleMainContentClick as any);
      
      return () => {
        clearTimeout(startTimer);
        cleanup();
        mainContent.removeEventListener('click', handleMainContentClick as any);
      };
    }

    return () => {
      clearTimeout(startTimer);
      cleanup();
    };
  }, []);

  const cleanup = (): void => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error('Error stopping recognition:', e);
      }
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    speechSynthesis.cancel();
  };

  const startAudioMonitoring = async (): Promise<void> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermission('granted');
      
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
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
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setMicPermission('denied');
      setSpeechError('Microphone access denied. Please allow microphone access in your browser settings.');
    }
  };

  const handleJoinCodeChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value.toUpperCase();
    setJoinCodeWithRef(value);
    setSpeechError('');
  };

  const handleTapToStartTTS = (): void => {
    if (isSpeakingRef.current || speechSynthesis.speaking) {
      // If TTS is already speaking, stop it
      speechSynthesis.cancel();
      setIsTTSActive(false);
      isSpeakingRef.current = false;
      return;
    }

    setIsTTSActive(true);
    
    if (!hasPlayedIntro) {
      // Play full intro on first tap
      isSpeakingRef.current = true;
      speak("Welcome to QuizVision. Please speak your quiz code when ready. Or type it in the box. Say the code like Q-U-I-Z-1-2-3-4.", () => {
        isSpeakingRef.current = false;
        setIsTTSActive(false);
        setHasPlayedIntro(true);
      });
    } else {
      // Play context-aware message on subsequent taps
      let message = '';
      
      if (joinCode) {
        message = `Current code is ${joinCode.split('').join(' ')}. ${currentStep === 'confirm' ? 'Say yes to confirm or no to change it.' : 'Click speak to start voice input or type to edit.'}`;
      } else {
        message = 'Ready for your quiz code. Speak or type it now.';
      }
      
      isSpeakingRef.current = true;
      speak(message, () => {
        isSpeakingRef.current = false;
        setIsTTSActive(false);
      });
    }
  };

  const startSpeechRecognition = (mode: 'code' | 'confirm' = 'code'): void => {
    setSpeechError('');
    setRecognizedText('');
    if (mode === 'code') {
      setConfirmationText('');
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setSpeechError('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    // Stop any existing recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error('Error stopping recognition:', e);
      }
    }

    // Wait for speech to finish before starting recognition
    if (isSpeakingRef.current || speechSynthesis.speaking) {
      setTimeout(() => startSpeechRecognition(mode), 200);
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';
    recognitionRef.current.maxAlternatives = 1;

    recognitionRef.current.onstart = () => {
      console.log('Speech recognition started');
      setIsListening(true);
      startAudioMonitoring();
    };

    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript.toLowerCase().trim();
      console.log('Recognized transcript:', transcript);
      
      if (mode === 'code') {
        let processedText = transcript
          .toUpperCase()
          .replace(/\s+/g, '')
          .replace(/[^A-Z0-9]/g, '')
          .trim();
        
        console.log('Processed text:', processedText);
        
        const codeMatch = processedText.match(/[A-Z]{4}\d{4}|[A-Z0-9]{8}|[A-Z]{3,}\d{3,}/);
        
        if (codeMatch) {
          processedText = codeMatch[0];
        } else if (processedText.length >= 4) {
          processedText = processedText.substring(0, 8);
        }
        
        setRecognizedText(transcript);
        setJoinCodeWithRef(processedText);
        
        if (processedText) {
          // Now activate TTS to ask for confirmation
          isSpeakingRef.current = true;
          setIsTTSActive(true);
          speak(`Code recognized: ${processedText.split('').join(' ')}.`, () => {
            setTimeout(() => {
              setCurrentStep('confirm');
              speak(`Is this code correct? Say "yes" to proceed or "no" to try again.`, () => {
                isSpeakingRef.current = false;
                setIsTTSActive(false);
                setIsConfirming(true);
                setTimeout(() => {
                  startSpeechRecognition('confirm');
                }, 300);
              });
            }, 500);
          });
        } else {
          // If no valid code, ask to try again with TTS
          isSpeakingRef.current = true;
          setIsTTSActive(true);
          speak("I couldn't recognize a valid quiz code. Please try again.", () => {
            isSpeakingRef.current = false;
            setIsTTSActive(false);
            setTimeout(() => {
              startSpeechRecognition('code');
            }, 1000);
          });
        }
      } else if (mode === 'confirm') {
        setIsConfirming(false);
        setConfirmationText(transcript);
        console.log('Confirmation transcript:', transcript);
        
        if (transcript.includes('yes') || transcript.includes('correct') || transcript.includes('proceed')) {
          const confirmedCode = joinCodeRef.current;
          console.log('Confirmed code:', confirmedCode);
          
          if (confirmedCode) {
            isSpeakingRef.current = true;
            setIsTTSActive(true);
            speak(`Great! Joining quiz ${confirmedCode.split('').join(' ')} now...`, () => {
              isSpeakingRef.current = false;
              setIsTTSActive(false);
              setCurrentStep('joining');
              setTimeout(() => {
                handleJoinQuiz();
              }, 800);
            });
          } else {
            isSpeakingRef.current = true;
            setIsTTSActive(true);
            speak("I couldn't find a quiz code. Let's try again.", () => {
              isSpeakingRef.current = false;
              setIsTTSActive(false);
              setCurrentStep('listenCode');
              setJoinCodeWithRef('');
              setRecognizedText('');
              setTimeout(() => {
                startSpeechRecognition('code');
              }, 1000);
            });
          }
        } else if (transcript.includes('no') || transcript.includes('wrong') || transcript.includes('try again')) {
          isSpeakingRef.current = true;
          setIsTTSActive(true);
          speak("Okay, let's try again. Please speak your quiz code.", () => {
            isSpeakingRef.current = false;
            setIsTTSActive(false);
            setCurrentStep('listenCode');
            setJoinCodeWithRef('');
            setRecognizedText('');
            setTimeout(() => {
              startSpeechRecognition('code');
            }, 1000);
          });
        } else {
          isSpeakingRef.current = true;
          setIsTTSActive(true);
          speak("I didn't understand. Please say 'yes' to proceed or 'no' to try again.", () => {
            isSpeakingRef.current = false;
            setIsTTSActive(false);
            setIsConfirming(true);
            setTimeout(() => {
              startSpeechRecognition('confirm');
            }, 800);
          });
        }
      }
    };

    recognitionRef.current.onerror = (event: SpeechRecognitionEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      setIsConfirming(false);
      
      let errorMessage = '';
      let shouldRetry = false;
      
      switch(event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected. Please try again.';
          shouldRetry = true;
          break;
        case 'audio-capture':
          errorMessage = 'No microphone found. Please check your microphone connection.';
          setMicPermission('denied');
          break;
        case 'not-allowed':
          errorMessage = 'Microphone access denied. Please allow microphone access in your browser settings.';
          setMicPermission('denied');
          break;
        case 'network':
          errorMessage = 'Network error. Please check your internet connection.';
          break;
        case 'aborted':
          // Don't show error for manual stops
          return;
        default:
          errorMessage = 'Error recognizing speech. Please try again.';
          shouldRetry = true;
      }
      
      setSpeechError(errorMessage);
      
      if (shouldRetry) {
        isSpeakingRef.current = true;
        setIsTTSActive(true);
        speak(errorMessage, () => {
          isSpeakingRef.current = false;
          setIsTTSActive(false);
          if (currentStep === 'confirm') {
            setIsConfirming(true);
            setTimeout(() => {
              startSpeechRecognition('confirm');
            }, 1000);
          } else {
            setTimeout(() => {
              startSpeechRecognition('code');
            }, 1000);
          }
        });
      }
    };

    recognitionRef.current.onend = () => {
      console.log('Speech recognition ended');
      setIsListening(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };

    try {
      recognitionRef.current.start();
      console.log('Attempting to start recognition');
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setSpeechError('Failed to start speech recognition. Please try again.');
      setIsListening(false);
      setIsConfirming(false);
    }
  };

  const stopSpeechRecognition = (): void => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
        setIsConfirming(false);
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    }
    speechSynthesis.cancel();
    isSpeakingRef.current = false;
    setIsTTSActive(false);
  };

  const handleStartVoiceFlow = (): void => {
    if (!browserSupported) {
      alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    setHasStartedVoiceFlow(true);
    setCurrentStep('listenCode');
    // Start listening immediately without TTS welcome message
    setTimeout(() => {
      startSpeechRecognition('code');
    }, 500);
  };

  const handleVoiceInputCode = (): void => {
    if (isListening) {
      stopSpeechRecognition();
    } else {
      if (currentStep === 'listenCode') {
        startSpeechRecognition('code');
      } else if (currentStep === 'confirm') {
        setIsConfirming(true);
        startSpeechRecognition('confirm');
      } else {
        handleStartVoiceFlow();
      }
    }
  };

  const handleReadCode = (): void => {
    if ('speechSynthesis' in window && joinCode) {
      setIsTTSActive(true);
      speak(`Your code is ${joinCode.split('').join(' ')}.`, () => {
        setIsTTSActive(false);
      });
    }
  };

  const handleJoinQuiz = (): void => {
    const codeToJoin = joinCodeRef.current || joinCode;
    
    if (codeToJoin) {
      if (/^[A-Z0-9]{4,12}$/.test(codeToJoin)) {
        alert(`Joining quiz: ${codeToJoin}`);
      } else {
        alert('Invalid code format. Please enter a valid alphanumeric code.');
        isSpeakingRef.current = true;
        setIsTTSActive(true);
        speak("Invalid code format detected. Please try again.", () => {
          isSpeakingRef.current = false;
          setIsTTSActive(false);
          setCurrentStep('listenCode');
          setJoinCodeWithRef('');
          setTimeout(() => {
            startSpeechRecognition('code');
          }, 1000);
        });
      }
    } else {
      alert('Please enter quiz code.');
      isSpeakingRef.current = true;
      setIsTTSActive(true);
      speak("Quiz code is required.", () => {
        isSpeakingRef.current = false;
        setIsTTSActive(false);
        setCurrentStep('listenCode');
        setTimeout(() => {
          startSpeechRecognition('code');
        }, 1000);
      });
    }
  };

  const getStepMessage = (): string => {
    switch(currentStep) {
      case 'welcome':
        return '🎤 Welcome message playing...';
      case 'listenCode':
        return isListening ? '🎤 Listening for quiz code...' : '🎤 Ready to listen for quiz code';
      case 'confirm':
        return isConfirming ? '🤔 Listening for confirmation...' : '🤔 Confirmation requested';
      case 'joining':
        return '🚀 Joining quiz session...';
      default:
        return 'Ready';
    }
  };

  const getStepIcon = (): JSX.Element => {
    switch(currentStep) {
      case 'welcome':
        return <Volume2 size={16} className="text-blue-500 animate-pulse" />;
      case 'listenCode':
        return <Mic size={16} className={isListening ? "text-red-500 animate-pulse" : "text-red-500"} />;
      case 'confirm':
        return isConfirming ? <Mic size={16} className="text-amber-500 animate-pulse" /> : <Volume2 size={16} className="text-amber-500" />;
      case 'joining':
        return <CheckCircle size={16} className="text-emerald-500" />;
      default:
        return <Brain size={16} />;
    }
  };

  return (
    <div className="min-h-screen transition-all duration-300 bg-white">
      <Navbar />
      
      <main 
        ref={mainContentRef}
        className="max-w-6xl mx-auto px-6 py-8 cursor-pointer"
        onClick={(e) => {
          // Handle click for tap-to-start TTS
          if ((e.target as HTMLElement).tagName !== 'INPUT' && 
              (e.target as HTMLElement).tagName !== 'BUTTON' &&
              !(e.target as HTMLElement).closest('button') &&
              !(e.target as HTMLElement).closest('input')) {
            handleTapToStartTTS();
          }
        }}
      >
        {!browserSupported && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Browser Not Supported</h3>
              <p className="text-sm text-red-700">Speech recognition is not available in your browser. Please use Chrome, Edge, or Safari on desktop.</p>
            </div>
          </div>
        )}

        {micPermission === 'denied' && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-3">
            <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-semibold text-amber-900 mb-1">Microphone Access Required</h3>
              <p className="text-sm text-amber-700">Please allow microphone access in your browser settings to use voice input.</p>
            </div>
          </div>
        )}

        {/* TTS Status Indicator */}
        {isTTSActive && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <Volume2 className="text-blue-600 animate-pulse" size={20} />
              <span className="text-sm font-medium text-blue-700">
                🔊 Text-to-Speech is active...
              </span>
            </div>
          </div>
        )}

        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl mb-4">
                <Brain className="text-[#2563eb]" size={32} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Join Interactive Quiz
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                {hasStartedVoiceFlow ? 
                  "Speak your quiz code now" : 
                  "Click 'Speak' button or start speaking your quiz code"}
              </p>
              <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-gray-500">
                <VolumeX size={16} />
                <span>Tap anywhere to hear instructions</span>
              </div>
            </div>

            {/* Step Progress */}
            <div className="max-w-xl mx-auto mb-6">
              <div className="flex items-center justify-between mb-4 px-4">
                <div className={`flex flex-col items-center ${currentStep === 'welcome' ? 'text-[#2563eb]' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'welcome' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    1
                  </div>
                  <span className="text-xs mt-1">Welcome</span>
                </div>
                <div className="flex-1 h-0.5 bg-gray-200 mx-2"></div>
                <div className={`flex flex-col items-center ${currentStep === 'listenCode' ? 'text-[#2563eb]' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'listenCode' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    2
                  </div>
                  <span className="text-xs mt-1">Enter Code</span>
                </div>
                <div className="flex-1 h-0.5 bg-gray-200 mx-2"></div>
                <div className={`flex flex-col items-center ${currentStep === 'confirm' ? 'text-[#2563eb]' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'confirm' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    3
                  </div>
                  <span className="text-xs mt-1">Confirm</span>
                </div>
                <div className="flex-1 h-0.5 bg-gray-200 mx-2"></div>
                <div className={`flex flex-col items-center ${currentStep === 'joining' ? 'text-[#2563eb]' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'joining' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    4
                  </div>
                  <span className="text-xs mt-1">Join</span>
                </div>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="max-w-xl mx-auto mb-6">
              <div className="flex items-center justify-center space-x-3 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                <div className="flex items-center space-x-2">
                  {getStepIcon()}
                  <span className="text-sm font-medium text-gray-700">
                    {getStepMessage()}
                  </span>
                </div>
                {isListening && (
                  <div className="flex space-x-1 ml-2">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-[#2563eb] rounded-full transition-all duration-100"
                        style={{
                          height: `${8 + audioLevel * 16 * (1 + Math.sin(Date.now() / 200 + i))}px`
                        }}
                      ></div>
                    ))}
                  </div>
                )}
              </div>
              
              {recognizedText && !isListening && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-sm text-blue-700 flex items-center">
                    <Mic size={12} className="mr-2" />
                    <span className="font-medium">Recognized:</span> 
                    <span className="ml-2">{recognizedText}</span>
                  </p>
                </div>
              )}
              
              {confirmationText && (
                <div className="mt-3 p-3 rounded-lg border flex items-center space-x-3"
                  style={{
                    backgroundColor: confirmationText.includes('yes') ? '#f0fdf4' : '#fef2f2',
                    borderColor: confirmationText.includes('yes') ? '#d1fae5' : '#fee2e2'
                  }}>
                  {confirmationText.includes('yes') ? (
                    <ThumbsUp size={16} className="text-emerald-600" />
                  ) : (
                    <ThumbsDown size={16} className="text-red-600" />
                  )}
                  <p className="text-sm" style={{
                    color: confirmationText.includes('yes') ? '#059669' : '#dc2626'
                  }}>
                    <span className="font-medium">Confirmation:</span> 
                    <span className="ml-2">{confirmationText}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Input Section */}
            <div className="max-w-xl mx-auto mb-8 space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="joinCode" className="block text-sm font-medium text-gray-900">
                    Quiz Code
                  </label>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      {isListening ? 'Listening...' : hasStartedVoiceFlow ? 'Ready' : 'Loading...'}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : hasStartedVoiceFlow ? 'bg-green-500' : 'bg-blue-500 animate-pulse'}`}></div>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Hash size={20} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="joinCode"
                    value={joinCode}
                    onChange={handleJoinCodeChange}
                    placeholder="Type code or use voice (e.g., QUIZ1234)"
                    className="w-full pl-12 pr-4 py-3 text-base bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all text-gray-900 placeholder-gray-500"
                    aria-label="Quiz join code input"
                  />
                  {joinCode && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <CheckCircle className="text-emerald-600" size={20} />
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between mt-3">
                  <div className="flex space-x-2">
                    <button
                      onClick={handleVoiceInputCode}
                      disabled={!browserSupported}
                      className={`px-4 py-2 text-sm rounded-lg transition-all flex items-center space-x-2 ${
                        !browserSupported ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
                        isListening 
                          ? 'bg-red-50 border border-red-200 text-red-600 hover:bg-red-100' 
                          : 'bg-blue-50 border border-blue-200 text-[#2563eb] hover:bg-blue-100'
                      }`}
                      aria-label={isListening ? "Stop listening" : "Start voice input"}
                      aria-pressed={isListening}
                    >
                      <Mic size={14} />
                      <span className="font-medium">
                        {isListening ? 'Stop' : 'Speak'}
                      </span>
                    </button>
                    <button
                      onClick={handleReadCode}
                      disabled={!joinCode}
                      className={`px-3 py-2 text-sm rounded-lg transition-all flex items-center space-x-1 ${joinCode 
                        ? 'bg-blue-50 border border-blue-200 text-[#2563eb] hover:bg-blue-100' 
                        : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                      }`}
                      aria-label="Read code aloud"
                    >
                      <Headphones size={14} />
                      <span>Hear</span>
                    </button>
                    <button
                      onClick={handleTapToStartTTS}
                      className={`px-3 py-2 text-sm rounded-lg transition-all flex items-center space-x-1 ${
                        isTTSActive 
                          ? 'bg-amber-50 border border-amber-200 text-amber-600 hover:bg-amber-100' 
                          : 'bg-blue-50 border border-blue-200 text-[#2563eb] hover:bg-blue-100'
                      }`}
                      aria-label="Hear instructions"
                    >
                      <VolumeX size={14} />
                      <span>Instructions</span>
                    </button>
                  </div>
                </div>
              </div>

              {speechError && (
                <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                  <p className="text-sm text-red-700">
                    <span className="font-medium">Error:</span> {speechError}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="max-w-xl mx-auto space-y-4">
              <button
                onClick={handleJoinQuiz}
                disabled={!joinCode || currentStep === 'joining'}
                className={`w-full py-4 rounded-xl font-semibold text-base transition-all ${
                  joinCode && currentStep !== 'joining'
                    ? 'bg-gradient-to-r from-[#2563eb] to-[#3b82f6] hover:from-[#1d4ed8] hover:to-[#2563eb] text-white shadow-sm hover:shadow transform hover:-translate-y-0.5' 
                    : currentStep === 'joining'
                    ? 'bg-emerald-500 text-white cursor-wait'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {currentStep === 'joining' ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Joining Quiz Session...
                  </span>
                ) : (
                  'Join Quiz Session'
                )}
              </button>
              
              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 text-center">
                  {isListening ? (
                    isConfirming ? (
                      <span className="text-amber-600 font-medium">
                        🎤 Say "yes" to proceed or "no" to try again...
                      </span>
                    ) : (
                      <span className="text-red-600 font-medium">
                        🎤 Speak your quiz code now...
                      </span>
                    )
                  ) : currentStep === 'confirm' && !isConfirming ? (
                    <span className="text-blue-600 font-medium">
                      🔊 Confirmation question asked. Listening for your response...
                    </span>
                  ) : currentStep === 'listenCode' ? (
                    hasStartedVoiceFlow ? (
                      <span className="font-medium">🎤 Ready to listen for your code • Tap anywhere for instructions</span>
                    ) : (
                      <span className="font-medium">🎤 Click "Speak" to start voice input • Tap anywhere for instructions</span>
                    )
                  ) : (
                    <span className="font-medium">Tap anywhere on the page to hear instructions</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default QuizVision;
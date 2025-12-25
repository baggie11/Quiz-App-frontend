import React, { useState, useRef, useEffect, type ChangeEvent, type JSX } from 'react';
import { 
  Mic, 
  Headphones, 
  CheckCircle,
  Globe,
  Shield,
  Accessibility,
  Users,
  Brain,
  User,
  Volume2,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  VolumeX,
  Hash
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

// Speak utility function using Coqui TTS
const speakWithCoqui = async (text: string, callback?: () => void): Promise<void> => {
  try {
    console.log('Coqui TTS: Requesting speech for:', text);
    
    const formData = new FormData();
    formData.append('text', text);
    
    const response = await fetch('http://127.0.0.1:5000/tts', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }
    
    const audioBlob = await response.blob();
    
    if (audioBlob.size === 0) {
      throw new Error('Received empty audio file');
    }
    
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    
    audio.onplay = () => {
      console.log('Coqui TTS: Audio playback started');
    };
    
    audio.onended = () => {
      console.log('Coqui TTS: Audio playback finished');
      URL.revokeObjectURL(audioUrl);
      if (callback) {
        callback();
      }
    };
    
    audio.onerror = (event) => {
      console.error('Coqui TTS: Audio playback error:', event);
      URL.revokeObjectURL(audioUrl);
      fallbackSpeak(text, callback);
    };
    
    console.log('Coqui TTS: Playing audio...');
    await audio.play();
    
  } catch (error) {
    console.error('Coqui TTS Error:', error);
    fallbackSpeak(text, callback);
  }
};

// Fallback to browser speech synthesis
const fallbackSpeak = (text: string, callback?: () => void): void => {
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

// Speak function that tries Coqui first, then falls back
const speak = (text: string, callback?: () => void): void => {
  speakWithCoqui(text, callback);
};

// Navbar Component
const Navbar: React.FC = () => {
  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#9333ea] to-[#a855f7] rounded-xl flex items-center justify-center shadow-md">
              <Brain className="text-white" size={24} />
            </div>
            <span className="text-2xl font-bold text-gray-900">RollNumberVision</span>
          </div>
          <div className="flex items-center space-x-6">
            <button className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-[#9333ea] transition-colors">
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
              <Brain className="text-[#9333ea]" size={24} />
              <span className="font-bold text-gray-900">RollNumberVision</span>
            </div>
            <p className="text-sm text-gray-600">Making student identification accessible for everyone.</p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Globe size={16} className="mr-2 text-[#9333ea]" />
              Features
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Voice Input</li>
              <li>Text-to-Speech</li>
              <li>Number Recognition</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Shield size={16} className="mr-2 text-[#9333ea]" />
              Privacy
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Secure Data Handling</li>
              <li>Local Processing</li>
              <li>No Data Storage</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Users size={16} className="mr-2 text-[#9333ea]" />
              Support
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Help Guide</li>
              <li>Contact Support</li>
              <li>FAQs</li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-600">© 2024 RollNumberVision. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-sm text-gray-600 hover:text-[#9333ea]">Privacy Policy</a>
            <a href="#" className="text-sm text-gray-600 hover:text-[#9333ea]">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Main Component
const RollNumberVision: React.FC = () => {
  // State declarations
  const [rollNumber, setRollNumber] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechError, setSpeechError] = useState<string>('');
  const [recognizedText, setRecognizedText] = useState<string>('');
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState<'welcome' | 'listenNumber' | 'confirm' | 'verifying'>('welcome');
  const [confirmationText, setConfirmationText] = useState<string>('');
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [browserSupported, setBrowserSupported] = useState<boolean>(true);
  const [micPermission, setMicPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [hasStartedVoiceFlow, setHasStartedVoiceFlow] = useState<boolean>(false);
  const [isTTSActive, setIsTTSActive] = useState<boolean>(false);
  const [hasPlayedIntro, setHasPlayedIntro] = useState<boolean>(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState<boolean>(false);
  const [rollNumberType, setRollNumberType] = useState<'numeric' | 'alphanumeric' | 'unknown'>('unknown');

  // Refs
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const rollNumberRef = useRef<string>('');
  const isSpeakingRef = useRef<boolean>(false);
  const mainContentRef = useRef<HTMLDivElement>(null);

  const setRollNumberWithRef = (number: string): void => {
    setRollNumber(number);
    rollNumberRef.current = number;
    
    // Detect roll number type for better TTS pronunciation
    if (/^\d+$/.test(number)) {
      setRollNumberType('numeric');
    } else if (/^[A-Z0-9]+$/i.test(number)) {
      setRollNumberType('alphanumeric');
    }
  };

  // Auto-start TTS when component mounts
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setBrowserSupported(false);
      setSpeechError('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari on desktop.');
      return;
    }

    const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
    if (!isSecure && SpeechRecognition) {
      setSpeechError('Speech recognition requires HTTPS. This feature may not work on HTTP.');
    }

    // Auto-start TTS welcome message
    const startTimer = setTimeout(() => {
      playWelcomeMessage();
    }, 1000);

    const mainContent = mainContentRef.current;
    const handleMainContentClick = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName !== 'INPUT' && 
          target.tagName !== 'BUTTON' &&
          !target.closest('button') &&
          !target.closest('input')) {
        handleTapToStartTTS();
      }
    };
    
    if (mainContent) {
      mainContent.addEventListener('click', handleMainContentClick);
      
      return () => {
        clearTimeout(startTimer);
        cleanup();
        mainContent.removeEventListener('click', handleMainContentClick);
      };
    }

    return () => {
      clearTimeout(startTimer);
      cleanup();
    };
  }, []);

  const playWelcomeMessage = (): void => {
    if (hasPlayedIntro) return;
    
    setIsLoadingAudio(true);
    setIsTTSActive(true);
    setCurrentStep('welcome');
    
    console.log('Playing welcome message with Coqui TTS...');
    
    speak("Please speak your roll number", () => {
      console.log('Welcome message finished');
      setIsTTSActive(false);
      setIsLoadingAudio(false);
      setHasPlayedIntro(true);
      
      // After welcome message, auto-start listening
      setTimeout(() => {
        handleStartVoiceFlow();
      }, 500);
    });
  };

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

  const handleRollNumberChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value.toUpperCase();
    setRollNumberWithRef(value);
    setSpeechError('');
  };

  const handleTapToStartTTS = (): void => {
    if (isSpeakingRef.current || isLoadingAudio) {
      // If TTS is already speaking, stop it
      speechSynthesis.cancel();
      setIsTTSActive(false);
      isSpeakingRef.current = false;
      setIsLoadingAudio(false);
      return;
    }

    setIsTTSActive(true);
    setIsLoadingAudio(true);
    
    if (!hasPlayedIntro) {
      // Play full intro on first tap
      isSpeakingRef.current = true;
      speak("Welcome to Roll Number Vision. Please speak your roll number when ready. Or type it in the box. For example: 2-0-2-3-0-0-1 or C-S-E-2-0-2-3-0-1.", () => {
        isSpeakingRef.current = false;
        setIsTTSActive(false);
        setIsLoadingAudio(false);
        setHasPlayedIntro(true);
      });
    } else {
      // Play context-aware message on subsequent taps
      let message = '';
      
      if (rollNumber) {
        const formattedNumber = rollNumberType === 'numeric' 
          ? rollNumber.split('').join('-')
          : rollNumber.split('').join(' ');
        
        message = `Current roll number is ${formattedNumber}. ${currentStep === 'confirm' ? 'Say yes to confirm or no to change it.' : 'Click speak to start voice input or type to edit.'}`;
      } else {
        message = 'Ready for your roll number. Speak or type it now. For example: 2-0-2-3-0-0-1 or C-S-E-2-0-2-3-0-1.';
      }
      
      isSpeakingRef.current = true;
      speak(message, () => {
        isSpeakingRef.current = false;
        setIsTTSActive(false);
        setIsLoadingAudio(false);
      });
    }
  };

  const startSpeechRecognition = (mode: 'number' | 'confirm' = 'number'): void => {
    setSpeechError('');
    setRecognizedText('');
    if (mode === 'number') {
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
    if (isSpeakingRef.current || isLoadingAudio) {
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
      
      if (mode === 'number') {
        let processedText = transcript
          .toUpperCase()
          .replace(/\s+/g, '')
          .replace(/[^A-Z0-9-]/g, '')
          .replace(/-+/g, '')
          .trim();
        
        console.log('Processed text:', processedText);
        
        // Extract roll number patterns
        const patterns = [
          /[A-Z]{2,4}\d{6,8}/,  // CS2023001, EE2023001
          /\d{7,10}/,           // 2023001, 20230001
          /[A-Z]{1,2}\d{5,8}/,  // A2023001, AB2023001
        ];
        
        let matchedNumber = processedText;
        for (const pattern of patterns) {
          const match = processedText.match(pattern);
          if (match) {
            matchedNumber = match[0];
            break;
          }
        }
        
        if (matchedNumber.length < 6) {
          // If too short, take as much as we have
          matchedNumber = matchedNumber.substring(0, 10);
        }
        
        setRecognizedText(transcript);
        setRollNumberWithRef(matchedNumber);
        
        if (matchedNumber && matchedNumber.length >= 6) {
          // Now activate TTS to ask for confirmation
          isSpeakingRef.current = true;
          setIsTTSActive(true);
          setIsLoadingAudio(true);
          
          const ttsFormattedNumber = rollNumberType === 'numeric'
            ? matchedNumber.split('').join('-')
            : matchedNumber.split('').join(' ');
          
          speak(`Roll number recognized: ${ttsFormattedNumber}.`, () => {
            setTimeout(() => {
              setCurrentStep('confirm');
              speak(`Is this roll number correct? Say "yes" to proceed or "no" to try again.`, () => {
                isSpeakingRef.current = false;
                setIsTTSActive(false);
                setIsLoadingAudio(false);
                setIsConfirming(true);
                setTimeout(() => {
                  startSpeechRecognition('confirm');
                }, 300);
              });
            }, 500);
          });
        } else {
          // If no valid number, ask to try again with TTS
          isSpeakingRef.current = true;
          setIsTTSActive(true);
          setIsLoadingAudio(true);
          speak("I couldn't recognize a valid roll number. Please try again, speaking clearly.", () => {
            isSpeakingRef.current = false;
            setIsTTSActive(false);
            setIsLoadingAudio(false);
            setTimeout(() => {
              startSpeechRecognition('number');
            }, 1000);
          });
        }
      } else if (mode === 'confirm') {
        setIsConfirming(false);
        setConfirmationText(transcript);
        console.log('Confirmation transcript:', transcript);
        
        if (transcript.includes('yes') || transcript.includes('correct') || transcript.includes('proceed')) {
          const confirmedNumber = rollNumberRef.current;
          console.log('Confirmed roll number:', confirmedNumber);
          
          if (confirmedNumber) {
            isSpeakingRef.current = true;
            setIsTTSActive(true);
            setIsLoadingAudio(true);
            
            const ttsFormattedNumber = rollNumberType === 'numeric'
              ? confirmedNumber.split('').join('-')
              : confirmedNumber.split('').join(' ');
            
            speak(`Great! Verifying roll number ${ttsFormattedNumber} now...`, () => {
              isSpeakingRef.current = false;
              setIsTTSActive(false);
              setIsLoadingAudio(false);
              setCurrentStep('verifying');
              setTimeout(() => {
                handleVerifyRollNumber();
              }, 800);
            });
          } else {
            isSpeakingRef.current = true;
            setIsTTSActive(true);
            setIsLoadingAudio(true);
            speak("I couldn't find a roll number. Let's try again.", () => {
              isSpeakingRef.current = false;
              setIsTTSActive(false);
              setIsLoadingAudio(false);
              setCurrentStep('listenNumber');
              setRollNumberWithRef('');
              setRecognizedText('');
              setTimeout(() => {
                startSpeechRecognition('number');
              }, 1000);
            });
          }
        } else if (transcript.includes('no') || transcript.includes('wrong') || transcript.includes('try again')) {
          isSpeakingRef.current = true;
          setIsTTSActive(true);
          setIsLoadingAudio(true);
          speak("Okay, let's try again. Please speak your roll number clearly.", () => {
            isSpeakingRef.current = false;
            setIsTTSActive(false);
            setIsLoadingAudio(false);
            setCurrentStep('listenNumber');
            setRollNumberWithRef('');
            setRecognizedText('');
            setTimeout(() => {
              startSpeechRecognition('number');
            }, 1000);
          });
        } else {
          isSpeakingRef.current = true;
          setIsTTSActive(true);
          setIsLoadingAudio(true);
          speak("I didn't understand. Please say 'yes' to proceed or 'no' to try again.", () => {
            isSpeakingRef.current = false;
            setIsTTSActive(false);
            setIsLoadingAudio(false);
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
          return;
        default:
          errorMessage = 'Error recognizing speech. Please try again.';
          shouldRetry = true;
      }
      
      setSpeechError(errorMessage);
      
      if (shouldRetry) {
        isSpeakingRef.current = true;
        setIsTTSActive(true);
        setIsLoadingAudio(true);
        speak(errorMessage, () => {
          isSpeakingRef.current = false;
          setIsTTSActive(false);
          setIsLoadingAudio(false);
          if (currentStep === 'confirm') {
            setIsConfirming(true);
            setTimeout(() => {
              startSpeechRecognition('confirm');
            }, 1000);
          } else {
            setTimeout(() => {
              startSpeechRecognition('number');
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
    setIsLoadingAudio(false);
  };

  const handleStartVoiceFlow = (): void => {
    if (!browserSupported) {
      alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    setHasStartedVoiceFlow(true);
    setCurrentStep('listenNumber');
    // Start listening immediately
    setTimeout(() => {
      startSpeechRecognition('number');
    }, 500);
  };

  const handleVoiceInputNumber = (): void => {
    if (isListening) {
      stopSpeechRecognition();
    } else {
      if (currentStep === 'listenNumber') {
        startSpeechRecognition('number');
      } else if (currentStep === 'confirm') {
        setIsConfirming(true);
        startSpeechRecognition('confirm');
      } else {
        handleStartVoiceFlow();
      }
    }
  };

  const handleReadNumber = (): void => {
    if (rollNumber) {
      setIsTTSActive(true);
      setIsLoadingAudio(true);
      
      const ttsFormattedNumber = rollNumberType === 'numeric'
        ? rollNumber.split('').join('-')
        : rollNumber.split('').join(' ');
      
      speak(`Your roll number is ${ttsFormattedNumber}.`, () => {
        setIsTTSActive(false);
        setIsLoadingAudio(false);
      });
    }
  };

  const handleVerifyRollNumber = async (): Promise<void> => {
    const numberToVerify = rollNumberRef.current || rollNumber;

    if (!numberToVerify) {
      alert('Please enter roll number.');
      speak("Roll number is required.");
      return;
    }

    // Format validation
    if (!/^[A-Z0-9]{6,12}$/i.test(numberToVerify)) {
      alert('Invalid roll number format. Must be 6-12 alphanumeric characters.');
      speak("Invalid roll number format detected. Please try again.");
      return;
    }

    try {
      setIsLoadingAudio(true);

      // Simulate API call to verify roll number
      const response = await fetch('http://localhost:3000/api/student/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rollNumber: numberToVerify }),
      });

      if (!response.ok) {
        throw new Error('Server error');
      }

      const result = await response.json();
      console.log('Roll number verification result:', result);

      if (result?.status === 'success') {
        alert(`Roll number verified: ${numberToVerify}`);
        speak(`Roll number ${numberToVerify.split('').join('-')} verified successfully.`);
        
        // Navigate to next page
        // navigate(`/student/${numberToVerify}`);
        
      } else {
        alert('Roll number not found.');
        speak(
          "No student was found with this roll number. Please try again."
        );
        setCurrentStep('listenNumber');
      }

    } catch (error) {
      console.error(error);
      alert('Unable to verify roll number.');
      speak(
        "Unable to verify the roll number at the moment. Please try again later."
      );
      setCurrentStep('listenNumber');
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const getStepMessage = (): string => {
    switch(currentStep) {
      case 'welcome':
        return isLoadingAudio ? '🎵 Welcome message playing...' : '🎵 Welcome message ready';
      case 'listenNumber':
        return isListening ? '🎤 Listening for roll number...' : '🎤 Ready to listen for roll number';
      case 'confirm':
        return isConfirming ? '🤔 Listening for confirmation...' : '🤔 Confirmation requested';
      case 'verifying':
        return '🔍 Verifying roll number...';
      default:
        return 'Ready';
    }
  };

  const getStepIcon = (): JSX.Element => {
    switch(currentStep) {
      case 'welcome':
        return <Volume2 size={16} className={isLoadingAudio ? "text-purple-500 animate-pulse" : "text-purple-500"} />;
      case 'listenNumber':
        return <Mic size={16} className={isListening ? "text-red-500 animate-pulse" : "text-red-500"} />;
      case 'confirm':
        return isConfirming ? <Mic size={16} className="text-amber-500 animate-pulse" /> : <Volume2 size={16} className="text-amber-500" />;
      case 'verifying':
        return <CheckCircle size={16} className="text-emerald-500" />;
      default:
        return <Brain size={16} />;
    }
  };

  const handleMainClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    const target = e.target as HTMLElement;
    if (target.tagName !== 'INPUT' && 
        target.tagName !== 'BUTTON' &&
        !target.closest('button') &&
        !target.closest('input')) {
      handleTapToStartTTS();
    }
  };

  return (
    <div className="min-h-screen transition-all duration-300 bg-white">
      <Navbar />
      
      <main 
        ref={mainContentRef}
        className="max-w-6xl mx-auto px-6 py-8 cursor-pointer"
        onClick={handleMainClick}
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
        {(isTTSActive || isLoadingAudio) && (
          <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-center">
            <div className="flex items-center space-x-2">
              {isLoadingAudio ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                  <span className="text-sm font-medium text-purple-700">
                    🔄 Loading audio from Coqui TTS...
                  </span>
                </>
              ) : (
                <>
                  <Volume2 className="text-purple-600 animate-pulse" size={20} />
                  <span className="text-sm font-medium text-purple-700">
                    🔊 Coqui TTS is active...
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl mb-4">
                <User className="text-[#9333ea]" size={32} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Enter Your Roll Number
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                {hasStartedVoiceFlow ? 
                  "Speak your roll number now" : 
                  "Welcome! Listening will start after the greeting..."}
              </p>
              <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-gray-500">
                <VolumeX size={16} />
                <span>Tap anywhere to hear instructions</span>
              </div>
            </div>

            {/* Step Progress */}
            <div className="max-w-xl mx-auto mb-6">
              <div className="flex items-center justify-between mb-4 px-4">
                <div className={`flex flex-col items-center ${currentStep === 'welcome' ? 'text-[#9333ea]' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'welcome' ? 'bg-purple-100' : 'bg-gray-100'}`}>
                    1
                  </div>
                  <span className="text-xs mt-1">Welcome</span>
                </div>
                <div className="flex-1 h-0.5 bg-gray-200 mx-2"></div>
                <div className={`flex flex-col items-center ${currentStep === 'listenNumber' ? 'text-[#9333ea]' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'listenNumber' ? 'bg-purple-100' : 'bg-gray-100'}`}>
                    2
                  </div>
                  <span className="text-xs mt-1">Enter Number</span>
                </div>
                <div className="flex-1 h-0.5 bg-gray-200 mx-2"></div>
                <div className={`flex flex-col items-center ${currentStep === 'confirm' ? 'text-[#9333ea]' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'confirm' ? 'bg-purple-100' : 'bg-gray-100'}`}>
                    3
                  </div>
                  <span className="text-xs mt-1">Confirm</span>
                </div>
                <div className="flex-1 h-0.5 bg-gray-200 mx-2"></div>
                <div className={`flex flex-col items-center ${currentStep === 'verifying' ? 'text-[#9333ea]' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'verifying' ? 'bg-purple-100' : 'bg-gray-100'}`}>
                    4
                  </div>
                  <span className="text-xs mt-1">Verify</span>
                </div>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="max-w-xl mx-auto mb-6">
              <div className="flex items-center justify-center space-x-3 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100">
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
                        className="w-1 bg-[#9333ea] rounded-full transition-all duration-100"
                        style={{
                          height: `${8 + audioLevel * 16 * (1 + Math.sin(Date.now() / 200 + i))}px`
                        }}
                      ></div>
                    ))}
                  </div>
                )}
              </div>
              
              {recognizedText && !isListening && (
                <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                  <p className="text-sm text-purple-700 flex items-center">
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
                  <label htmlFor="rollNumber" className="block text-sm font-medium text-gray-900">
                    Roll Number / Student ID
                  </label>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      {isListening ? 'Listening...' : hasStartedVoiceFlow ? 'Ready' : isLoadingAudio ? 'Loading TTS...' : 'Initializing...'}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${
                      isListening ? 'bg-red-500 animate-pulse' : 
                      hasStartedVoiceFlow ? 'bg-green-500' : 
                      isLoadingAudio ? 'bg-purple-500 animate-pulse' : 'bg-purple-500'
                    }`}></div>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Hash size={20} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="rollNumber"
                    value={rollNumber}
                    onChange={handleRollNumberChange}
                    placeholder="Type roll number or use voice (e.g., 2023001 or CS2023001)"
                    className="w-full pl-12 pr-4 py-3 text-base bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9333ea] focus:border-transparent transition-all text-gray-900 placeholder-gray-500"
                    aria-label="Roll number input"
                  />
                  {rollNumber && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <CheckCircle className="text-emerald-600" size={20} />
                    </div>
                  )}
                </div>
                
                <div className="mt-2 mb-3">
                  <p className="text-xs text-gray-500">
                    Examples: 2023001 (numeric) or CS2023001 (alphanumeric)
                  </p>
                </div>
                
                <div className="flex justify-between mt-3">
                  <div className="flex space-x-2">
                    <button
                      onClick={handleVoiceInputNumber}
                      disabled={!browserSupported || isLoadingAudio}
                      className={`px-4 py-2 text-sm rounded-lg transition-all flex items-center space-x-2 ${
                        !browserSupported || isLoadingAudio ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
                        isListening 
                          ? 'bg-red-50 border border-red-200 text-red-600 hover:bg-red-100' 
                          : 'bg-purple-50 border border-purple-200 text-[#9333ea] hover:bg-purple-100'
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
                      onClick={handleReadNumber}
                      disabled={!rollNumber || isLoadingAudio}
                      className={`px-3 py-2 text-sm rounded-lg transition-all flex items-center space-x-1 ${
                        !rollNumber || isLoadingAudio ? 'bg-gray-50 text-gray-400 cursor-not-allowed' :
                        'bg-purple-50 border border-purple-200 text-[#9333ea] hover:bg-purple-100'
                      }`}
                      aria-label="Read roll number aloud"
                    >
                      <Headphones size={14} />
                      <span>Hear</span>
                    </button>
                    <button
                      onClick={handleTapToStartTTS}
                      disabled={isLoadingAudio}
                      className={`px-3 py-2 text-sm rounded-lg transition-all flex items-center space-x-1 ${
                        isLoadingAudio ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
                        isTTSActive 
                          ? 'bg-amber-50 border border-amber-200 text-amber-600 hover:bg-amber-100' 
                          : 'bg-purple-50 border border-purple-200 text-[#9333ea] hover:bg-purple-100'
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
                onClick={handleVerifyRollNumber}
                disabled={!rollNumber || currentStep === 'verifying' || isLoadingAudio}
                className={`w-full py-4 rounded-xl font-semibold text-base transition-all ${
                  rollNumber && currentStep !== 'verifying' && !isLoadingAudio
                    ? 'bg-gradient-to-r from-[#9333ea] to-[#a855f7] hover:from-[#7c3aed] hover:to-[#9333ea] text-white shadow-sm hover:shadow transform hover:-translate-y-0.5' 
                    : currentStep === 'verifying'
                    ? 'bg-emerald-500 text-white cursor-wait'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {currentStep === 'verifying' ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying Roll Number...
                  </span>
                ) : (
                  'Join Session'
                )}
              </button>
              
              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 text-center">
                  {isLoadingAudio && currentStep === 'welcome' ? (
                    <span className="text-purple-600 font-medium">
                      🔊 Playing welcome message with Coqui TTS...
                    </span>
                  ) : isListening ? (
                    isConfirming ? (
                      <span className="text-amber-600 font-medium">
                        🎤 Say "yes" to proceed or "no" to try again...
                      </span>
                    ) : (
                      <span className="text-red-600 font-medium">
                        🎤 Speak your roll number now...
                      </span>
                    )
                  ) : currentStep === 'confirm' && !isConfirming ? (
                    <span className="text-purple-600 font-medium">
                      🔊 Confirmation question asked. Listening for your response...
                    </span>
                  ) : currentStep === 'listenNumber' ? (
                    hasStartedVoiceFlow ? (
                      <span className="font-medium">🎤 Ready to listen for your roll number • Tap anywhere for instructions</span>
                    ) : (
                      <span className="font-medium">🎤 Welcome message playing • Tap anywhere for instructions</span>
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

export default RollNumberVision;
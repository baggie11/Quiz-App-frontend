// App.tsx
import React, { useState, useRef } from 'react';
import { speak } from '../services/speech/tts.ts';
import type { ChangeEvent } from 'react';   
import Navbar from '../components/Navbar.tsx';
import Footer from '../components/Footer.tsx';
import { 
  Mic, 
  Headphones, 
  LogIn, 
  Sun, 
  Moon, 
  Contrast,
  Volume2,
  Type,
  CheckCircle,
  ChevronDown,
  Globe,
  Shield,
  Accessibility,
  Users,
  Award,
  Clock,
  Brain,
  User,
  Hash
} from 'lucide-react';

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const QuizVision: React.FC = () => {
  const [joinCode, setJoinCode] = useState<string>('');
  const [rollNo, setRollNo] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isListeningRollNo, setIsListeningRollNo] = useState<boolean>(false);
  const [speechError, setSpeechError] = useState<string>('');
  const [recognizedText, setRecognizedText] = useState<string>('');
  const [recognizedRollNo, setRecognizedRollNo] = useState<string>('');
  const [activeInput, setActiveInput] = useState<'code' | 'rollno'>('code');
  
  const recognitionRef = useRef<any>(null);

  const handleJoinCodeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setJoinCode(e.target.value.toUpperCase());
    setSpeechError('');
  };

  const handleRollNoChange = (e: ChangeEvent<HTMLInputElement>) => {
    setRollNo(e.target.value);
    setSpeechError('');
  };

  const startSpeechRecognition = (type: 'code' | 'rollno'): void => {
    // Clear previous errors
    setSpeechError('');
    if (type === 'code') {
      setRecognizedText('');
      setActiveInput('code');
    } else {
      setRecognizedRollNo('');
      setActiveInput('rollno');
    }

    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setSpeechError('Speech recognition is not supported in your browser. Please try Chrome or Edge.');
      alert('Speech recognition is not supported in your browser. Please try Chrome or Edge.');
      return;
    }

    // Stop any existing recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    // Initialize speech recognition
    recognitionRef.current = new SpeechRecognition();
    
    // Configure recognition
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';
    recognitionRef.current.maxAlternatives = 1;

    // Event handlers
    recognitionRef.current.onstart = () => {
      if (type === 'code') {
        setIsListening(true);
        speak("Listening for quiz code...");
      } else {
        setIsListeningRollNo(true);
        speak("Listening for roll number...");
      }
    };

    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      const confidence = event.results[0][0].confidence;
      
      console.log(`Recognized: ${transcript}, Confidence: ${confidence}`);
      
      if (type === 'code') {
        // Process the recognized text for quiz code
        let processedText = transcript
          .toUpperCase()
          .replace(/\s+/g, '') // Remove spaces
          .replace(/[^A-Z0-9]/g, '') // Remove special characters, keep only letters and numbers
          .trim();
        
        // Extract alphanumeric codes (like "QUIZ1234" or similar patterns)
        const codeMatch = processedText.match(/[A-Z]{4}\d{4}|[A-Z0-9]{8}|[A-Z]{3,}\d{3,}/);
        
        if (codeMatch) {
          processedText = codeMatch[0];
        } else if (processedText.length >= 4) {
          // Take first 8 characters if it's a reasonable length
          processedText = processedText.substring(0, 8);
        }
        
        setRecognizedText(transcript);
        setJoinCode(processedText);
        speak(`Code recognized: ${processedText.split('').join(' ')}`);
      } else {
        // Process for roll number (typically numbers only, but can include letters)
        let processedRollNo = transcript
          .toUpperCase()
          .replace(/\s+/g, '') // Remove spaces
          .trim();
        
        // Clean up common spoken patterns
        processedRollNo = processedRollNo
          .replace(/ROLL\s*(NUMBER\s*)?/gi, '') // Remove "roll number" from speech
          .replace(/[^A-Z0-9]/g, '') // Keep only alphanumeric
          .trim();
        
        setRecognizedRollNo(transcript);
        setRollNo(processedRollNo);
        speak(`Roll number recognized: ${processedRollNo.split('').join(' ')}`);
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      setIsListeningRollNo(false);
      
      switch(event.error) {
        case 'no-speech':
          setSpeechError('No speech detected. Please try again.');
          speak("No speech detected. Please try again.");
          break;
        case 'audio-capture':
          setSpeechError('No microphone found. Please check your microphone.');
          speak("No microphone found.");
          break;
        case 'not-allowed':
          setSpeechError('Microphone access denied. Please allow microphone access.');
          speak("Microphone permission required.");
          break;
        case 'network':
          setSpeechError('Network error. Please check your connection.');
          speak("Network error occurred.");
          break;
        default:
          setSpeechError('Error recognizing speech. Please try again.');
          speak("Speech recognition failed.");
      }
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
      setIsListeningRollNo(false);
      if (!speechError && ((type === 'code' && !recognizedText) || (type === 'rollno' && !recognizedRollNo))) {
        speak("Listening stopped. No input detected.");
      }
    };

    // Start recognition
    try {
      recognitionRef.current.start();
      // Auto-stop after 10 seconds
      setTimeout(() => {
        if ((type === 'code' && isListening) || (type === 'rollno' && isListeningRollNo)) {
          if (recognitionRef.current) {
            recognitionRef.current.stop();
            speak("Time limit reached. Please try again.");
          }
        }
      }, 10000);
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setSpeechError('Failed to start speech recognition. Please try again.');
      setIsListening(false);
      setIsListeningRollNo(false);
    }
  };

  const stopSpeechRecognition = (): void => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
        setIsListeningRollNo(false);
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    }
  };

  const handleVoiceInputCode = (): void => {
    if (isListening) {
      stopSpeechRecognition();
    } else {
      startSpeechRecognition('code');
    }
  };

  const handleVoiceInputRollNo = (): void => {
    if (isListeningRollNo) {
      stopSpeechRecognition();
    } else {
      startSpeechRecognition('rollno');
    }
  };

  const handleReadCode = (): void => {
    if ('speechSynthesis' in window && joinCode) {
      const utterance = new SpeechSynthesisUtterance(`Your code is ${joinCode.split('').join(' ')}`);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  const handleReadRollNo = (): void => {
    if ('speechSynthesis' in window && rollNo) {
      const utterance = new SpeechSynthesisUtterance(`Your roll number is ${rollNo.split('').join(' ')}`);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  const handleJoinQuiz = (): void => {
    if (joinCode && rollNo) {
      // Validate code format (alphanumeric, 4-12 characters)
      if (/^[A-Z0-9]{4,12}$/.test(joinCode)) {
        if (/^[A-Z0-9]+$/.test(rollNo)) {
          alert(`Joining quiz: ${joinCode} with Roll No: ${rollNo}`);
          // Here you would typically redirect or call an API
        } else {
          alert('Invalid roll number format. Please enter a valid alphanumeric roll number.');
          speak("Invalid roll number format detected.");
        }
      } else {
        alert('Invalid code format. Please enter a valid alphanumeric code.');
        speak("Invalid code format detected.");
      }
    } else {
      alert('Please enter both quiz code and roll number.');
      speak("Both quiz code and roll number are required.");
    }
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return (
    <div className="min-h-screen transition-all duration-300 bg-white">
      <Navbar />
      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        
        {/* Main Content Grid */}
        <div className="">
          {/* Join Quiz Section */}
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
                  Enter your quiz code and roll number to join an accessible learning experience
                </p>
              </div>

              {/* Input Section */}
              <div className="max-w-xl mx-auto mb-8 space-y-6">
                {/* Quiz Code Input */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="joinCode" className="block text-sm font-medium text-gray-900">
                      Quiz Code
                    </label>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">Tap microphone to speak</span>
                      <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`}></div>
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
                      placeholder="Speak or type your quiz code (e.g., QUIZ1234)"
                      onFocus={() => {
                        speak("Enter quiz code");
                        setActiveInput('code');
                      }}
                      className="w-full pl-12 pr-4 py-3 text-base bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all text-gray-900 placeholder-gray-500"
                      aria-label="Quiz join code input"
                      aria-describedby="code-help"
                    />
                    {joinCode && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <CheckCircle className="text-emerald-600" size={20} />
                      </div>
                    )}
                  </div>
                  
                  {/* Speech recognition feedback */}
                  {recognizedText && !isListening && (
                    <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="text-xs text-blue-700 flex items-center">
                        <Mic size={12} className="mr-1" />
                        <span className="font-medium">Recognized:</span> 
                        <span className="ml-1">{recognizedText}</span>
                      </p>
                    </div>
                  )}
                  
                  <div className="flex justify-between mt-3">
                    <div className="flex space-x-2">
                      <button
                        onClick={handleVoiceInputCode}
                        className={`px-3 py-1 text-xs rounded-lg transition-all flex items-center space-x-1 ${
                          isListening 
                            ? 'bg-red-50 border border-red-200 text-red-600' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        aria-label={isListening ? "Stop listening for code" : "Start voice input for code"}
                        aria-pressed={isListening}
                      >
                        <Mic size={12} />
                        <span>{isListening ? 'Stop' : 'Speak'}</span>
                      </button>
                      <button
                        onClick={handleReadCode}
                        disabled={!joinCode}
                        className={`px-3 py-1 text-xs rounded-lg transition-all flex items-center space-x-1 ${joinCode 
                          ? 'bg-blue-50 text-[#2563eb] hover:bg-blue-100' 
                          : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                        }`}
                        aria-label="Read code aloud"
                      >
                        <Headphones size={12} />
                        <span>Hear</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Roll Number Input */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="rollNo" className="block text-sm font-medium text-gray-900">
                      Roll Number
                    </label>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">Tap microphone to speak</span>
                      <div className={`w-2 h-2 rounded-full ${isListeningRollNo ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`}></div>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <User size={20} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="rollNo"
                      value={rollNo}
                      onChange={handleRollNoChange}
                      placeholder="Speak or type your roll number"
                      onFocus={() => {
                        speak("Enter roll number");
                        setActiveInput('rollno');
                      }}
                      className="w-full pl-12 pr-4 py-3 text-base bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all text-gray-900 placeholder-gray-500"
                      aria-label="Roll number input"
                    />
                    {rollNo && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <CheckCircle className="text-emerald-600" size={20} />
                      </div>
                    )}
                  </div>
                  
                  {/* Speech recognition feedback */}
                  {recognizedRollNo && !isListeningRollNo && (
                    <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="text-xs text-blue-700 flex items-center">
                        <Mic size={12} className="mr-1" />
                        <span className="font-medium">Recognized:</span> 
                        <span className="ml-1">{recognizedRollNo}</span>
                      </p>
                    </div>
                  )}
                  
                  <div className="flex justify-between mt-3">
                    <div className="flex space-x-2">
                      <button
                        onClick={handleVoiceInputRollNo}
                        className={`px-3 py-1 text-xs rounded-lg transition-all flex items-center space-x-1 ${
                          isListeningRollNo 
                            ? 'bg-red-50 border border-red-200 text-red-600' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        aria-label={isListeningRollNo ? "Stop listening for roll number" : "Start voice input for roll number"}
                        aria-pressed={isListeningRollNo}
                      >
                        <Mic size={12} />
                        <span>{isListeningRollNo ? 'Stop' : 'Speak'}</span>
                      </button>
                      <button
                        onClick={handleReadRollNo}
                        disabled={!rollNo}
                        className={`px-3 py-1 text-xs rounded-lg transition-all flex items-center space-x-1 ${rollNo 
                          ? 'bg-blue-50 text-[#2563eb] hover:bg-blue-100' 
                          : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                        }`}
                        aria-label="Read roll number aloud"
                      >
                        <Headphones size={12} />
                        <span>Hear</span>
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
                  disabled={!joinCode || !rollNo}
                  onFocus={() => speak("Join quiz session button")}
                  className={`w-full py-4 rounded-xl font-semibold text-base transition-all ${joinCode && rollNo
                    ? 'bg-gradient-to-r from-[#2563eb] to-[#3b82f6] hover:from-[#1d4ed8] hover:to-[#2563eb] text-white shadow-sm hover:shadow transform hover:-translate-y-0.5' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Join Quiz Session
                </button>
                
                {/* Speech recognition instructions */}
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 text-center">
                    {(isListening || isListeningRollNo) ? (
                      <span className="text-red-600 font-medium">
                        🎤 {activeInput === 'code' ? 'Speak your quiz code now...' : 'Speak your roll number now...'} (Listening for 10 seconds)
                      </span>
                    ) : (
                      <>
                        <span className="font-medium"/>
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default QuizVision;
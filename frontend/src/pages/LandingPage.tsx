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
  Brain
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
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechError, setSpeechError] = useState<string>('');
  const [recognizedText, setRecognizedText] = useState<string>('');
  
  const recognitionRef = useRef<any>(null);

  const handleJoinCodeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setJoinCode(e.target.value.toUpperCase());
    setSpeechError('');
  };

  const startSpeechRecognition = (): void => {
    // Clear previous errors
    setSpeechError('');
    setRecognizedText('');

    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setSpeechError('Speech recognition is not supported in your browser. Please try Chrome or Edge.');
      alert('Speech recognition is not supported in your browser. Please try Chrome or Edge.');
      return;
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
      setIsListening(true);
      speak("Listening for quiz code...");
    };

    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      const confidence = event.results[0][0].confidence;
      
      console.log(`Recognized: ${transcript}, Confidence: ${confidence}`);
      
      // Process the recognized text
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
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      
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
      if (!speechError && !recognizedText) {
        speak("Listening stopped. No code detected.");
      }
    };

    // Start recognition
    try {
      recognitionRef.current.start();
      // Auto-stop after 10 seconds
      setTimeout(() => {
        if (isListening && recognitionRef.current) {
          recognitionRef.current.stop();
          speak("Time limit reached. Please try again.");
        }
      }, 10000);
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setSpeechError('Failed to start speech recognition. Please try again.');
      setIsListening(false);
    }
  };

  const stopSpeechRecognition = (): void => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    }
  };

  const handleVoiceInput = (): void => {
    if (isListening) {
      stopSpeechRecognition();
    } else {
      startSpeechRecognition();
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

  const handleJoinQuiz = (): void => {
    if (joinCode) {
      // Validate code format (alphanumeric, 4-12 characters)
      if (/^[A-Z0-9]{4,12}$/.test(joinCode)) {
        alert(`Joining quiz: ${joinCode}`);
        // Here you would typically redirect or call an API
      } else {
        alert('Invalid code format. Please enter a valid alphanumeric code.');
        speak("Invalid code format detected.");
      }
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
                  Enter your quiz code to join an accessible learning experience designed for all users
                </p>
              </div>

              {/* Code Input Section */}
              <div className="max-w-xl mx-auto mb-8">
                <div className="mb-6">
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
                    <input
                      type="text"
                      id="joinCode"
                      value={joinCode}
                      onChange={handleJoinCodeChange}
                      placeholder="Speak or type your code (e.g., QUIZ1234)"
                      onFocus={() => speak("Enter quiz code")}
                      className="w-full px-6 py-4 text-base bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all text-gray-900 placeholder-gray-500"
                      aria-label="Quiz join code input"
                      aria-describedby="code-help speech-error"
                    />
                    {joinCode && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                        <CheckCircle className="text-emerald-600" size={20} />
                        <span className="text-sm text-gray-600">Valid</span>
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
                  
                  {speechError && (
                    <div className="mt-2 p-2 bg-red-50 rounded-lg border border-red-100" id="speech-error">
                      <p className="text-xs text-red-700 flex items-center">
                        <span className="font-medium">Error:</span> 
                        <span className="ml-1">{speechError}</span>
                      </p>
                    </div>
                  )}
                  
                  <p className="mt-2 text-sm text-gray-500" id="code-help">
                    Code should be 4-12 alphanumeric characters (e.g., QUIZ1234)
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                  <button
                    onClick={handleJoinQuiz}
                    disabled={!joinCode}
                    onFocus={() => speak("Join quiz session button")}
                    className={`w-full py-4 rounded-xl font-semibold text-base transition-all ${joinCode 
                      ? 'bg-gradient-to-r from-[#2563eb] to-[#3b82f6] hover:from-[#1d4ed8] hover:to-[#2563eb] text-white shadow-sm hover:shadow transform hover:-translate-y-0.5' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Join Quiz Session
                  </button>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={handleVoiceInput}
                      className={`py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center space-x-2 ${
                        isListening 
                          ? 'bg-red-50 border-2 border-red-300 text-red-600 shadow-sm' 
                          : speechError 
                            ? 'bg-red-50 border border-red-200 text-red-600 hover:border-red-300'
                            : 'bg-white border border-gray-300 text-gray-700 hover:border-[#2563eb] hover:text-[#2563eb] hover:shadow-sm'
                      }`}
                      aria-label={isListening ? "Stop listening" : "Start voice input"}
                      aria-pressed={isListening}
                    >
                      {isListening ? (
                        <>
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          <span>Stop Listening</span>
                        </>
                      ) : (
                        <>
                          <Mic size={18} />
                          <span>Voice Input</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleReadCode}
                      disabled={!joinCode}
                      className={`py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center space-x-2 ${joinCode 
                        ? 'bg-blue-50 border border-blue-200 text-[#2563eb] hover:border-[#3b82f6] hover:bg-blue-100 hover:shadow-sm' 
                        : 'bg-gray-50 border border-gray-300 text-gray-400 cursor-not-allowed'
                      }`}
                      aria-label="Read code aloud"
                    >
                      <Headphones size={18} />
                      <span>Read Aloud</span>
                    </button>
                  </div>
                  
                  {/* Speech recognition instructions */}
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 text-center">
                      {isListening ? (
                        <span className="text-red-600 font-medium">
                          🎤 Speak your quiz code now... (Listening for 10 seconds)
                        </span>
                      ) : (
                        <>
                          💡 <span className="font-medium">Voice Input Tip:</span> Say something like "QUIZ 1 2 3 4" or "My code is A B C D 1 2 3 4"
                        </>
                      )}
                    </p>
                  </div>
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
// App.tsx
import React, { useState} from 'react';
import {speak} from '../services/speech/tts.ts';
import type { ChangeEvent } from 'react';   
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



const QuizVision: React.FC = () => {
  const [joinCode, setJoinCode] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);


  const handleJoinCodeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setJoinCode(e.target.value.toUpperCase());
  };

  const handleVoiceInput = (): void => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsListening(true);
      setTimeout(() => {
        setJoinCode('QUIZ' + Math.floor(Math.random() * 1000));
        setIsListening(false);
      }, 1500);
    } else {
      alert('Speech recognition not supported in your browser');
    }
  };

  const handleReadCode = (): void => {
    if ('speechSynthesis' in window && joinCode) {
      const utterance = new SpeechSynthesisUtterance(`Your code is ${joinCode.split('').join(' ')}`);
      speechSynthesis.speak(utterance);
    }
  };

  const handleJoinQuiz = (): void => {
    if (joinCode) {
      alert(`Joining quiz: ${joinCode}`);
    }
  };

  return (
    <div className="min-h-screen transition-all duration-300 bg-white">
      
      {/* Header with subtle accent */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#2563eb] to-[#3b82f6] rounded-xl flex items-center justify-center shadow-sm">
                    <span className="text-white font-bold text-sm">QV</span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-[#2563eb] bg-clip-text text-transparent">
                      QuizVision
                    </h1>
                 
                  </div>
                </div>

                {/* Divider */}
                <div className="h-8 w-px bg-gray-200"></div>

                {/* Organization Logos */}
                <div className="flex items-center space-x-6">

                {/* MeitY + SSN */}
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                    <img 
                        src="/images/ssn-logo.png" 
                        alt="MeitY Logo" 
                        className="w-full h-full object-contain p-1"
                    />
                    </div>
                    <div>
                    </div>
                </div>

                {/* NPTEL */}
                <div className="flex items-center space-x-3">
                    <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center  overflow-hidden">
                    <img 
                        src="/images/meity.png" 
                        alt="NPTEL Logo" 
                        className="w-full h-full object-contain p-1"
                    />
                    </div>
                    <div>
                    </div>
                </div>

                </div>

              </div>
            </div>

            {/* Host Login Button */}
            <button 
              className="px-5 py-2.5 bg-gradient-to-r from-[#2563eb] to-[#3b82f6] hover:from-[#1d4ed8] hover:to-[#2563eb] text-white font-medium rounded-lg shadow-sm hover:shadow transition-all duration-200 flex items-center space-x-2 group"
              onClick={() => alert('Host Login clicked')}
              onFocus={() => speak("Host Login")}
            >
              <LogIn size={18} className="group-hover:translate-x-0.5 transition-transform" />
              <span className="text-sm">Host Login</span>
            </button>
          </div>
        </div>
      </header>

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
                  <label htmlFor="joinCode" className="block text-sm font-medium text-gray-900 mb-2">
                    Quiz Code
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="joinCode"
                      value={joinCode}
                      onChange={handleJoinCodeChange}
                      placeholder="Enter your 8-character code"
                      onFocus={() => speak("Enter quiz code")}
                      className="w-full px-6 py-4 text-base bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all text-gray-900 placeholder-gray-500"
                      aria-label="Quiz join code input"
                    />
                    {joinCode && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                        <CheckCircle className="text-emerald-600" size={20} />
                        <span className="text-sm text-gray-600">Valid</span>
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Code should be 8 characters (e.g., QUIZ1234)
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
                      className={`py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center space-x-2 ${isListening 
                        ? 'bg-red-50 border border-red-200 text-red-600' 
                        : 'bg-white border border-gray-300 text-gray-700 hover:border-[#2563eb] hover:text-[#2563eb]'
                      }`}
                    >
                      {isListening ? (
                        <>
                          <div className="animate-pulse w-2 h-2 bg-red-500 rounded-full"></div>
                          <span>Listening...</span>
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
                      onFocus={() => speak("Voice input button")}
                      className={`py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center space-x-2 ${joinCode 
                        ? 'bg-blue-50 border border-blue-200 text-[#2563eb] hover:border-[#3b82f6] hover:bg-blue-100' 
                        : 'bg-gray-50 border border-gray-300 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Headphones size={18} />
                      <span>Read Aloud</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            {/* Branding */}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#2563eb] to-[#3b82f6] rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">QV</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  QuizVision • National Language Translation Mission
                </p>
                <p className="text-xs text-gray-600">
                  An initiative by the Government of India
                </p>
              </div>
            </div>

            {/* Links */}
            <div className="flex items-center space-x-6">
              <a href="#" className="text-sm text-gray-600 hover:text-[#2563eb] transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-gray-600 hover:text-[#2563eb] transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-sm text-gray-600 hover:text-[#2563eb] transition-colors">
                Accessibility Statement
              </a>
              <a href="#" className="text-sm text-gray-600 hover:text-[#2563eb] transition-colors">
                Contact
              </a>
            </div>

            {/* Copyright */}
            <div className="text-center md:text-right">
              <p className="text-sm text-gray-600">
                © {new Date().getFullYear()} National Language Translation Mission
              </p>
              <p className="text-xs text-gray-500 mt-1">
                WCAG AA+ Compliant • ISO 27001 Certified
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default QuizVision;
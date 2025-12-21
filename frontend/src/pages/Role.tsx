import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Brain,
  Accessibility,
  Globe,
  Shield,
  Users,
  User,
  UserPlus,
  ArrowRight,
  Sparkles,
  Award,
  CheckCircle,
  ClipboardCheck,
  BarChart3,
  Settings
} from 'lucide-react';

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
              <li>Interactive Quizzes</li>
              <li>Real-time Analytics</li>
              <li>Accessibility Tools</li>
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
const QuizVisionHome: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<'participant' | 'host' | null>(null);
  const [isHoveringParticipant, setIsHoveringParticipant] = useState(false);
  const [isHoveringHost, setIsHoveringHost] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      cleanupAudio();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Clean up audio resources
  const cleanupAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current.onplay = null;
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current = null;
    }
    
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  };

  const handleRoleSelect = async (role: 'participant' | 'host') => {
    // Prevent multiple clicks
    if (isLoading || isPlaying) {
      return;
    }
    
    // Reset states
    setAudioError(null);
    cleanupAudio();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setSelectedRole(role);
    
    if (role === 'participant') {
      setIsLoading(true);
      
      try {
        // Use the streaming endpoint
        const formData = new FormData();
        formData.append('text', 'Participant role selected, going to the session page');
        
        console.log('Fetching TTS audio...');
        const response = await fetch('http://127.0.0.1:5000/tts', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Server error: ${response.status} - ${errorText}`);
        }
        
        // Get audio as blob
        const audioBlob = await response.blob();
        
        // Check if blob is valid
        if (audioBlob.size === 0) {
          throw new Error('Received empty audio file');
        }
        
        // Check content type
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('audio')) {
          console.warn('Response is not audio, trying to play anyway...');
        }
        
        console.log(`Received ${audioBlob.size} bytes, type: ${audioBlob.type}`);
        
        // Create object URL from blob
        const audioUrl = URL.createObjectURL(audioBlob);
        objectUrlRef.current = audioUrl;
        
        // Create audio element
        const audio = new Audio();
        audio.src = audioUrl;
        audioRef.current = audio;
        
        // Set up event handlers - IMPORTANT: Set before playing
        audio.onplay = () => {
          console.log('Audio playback started successfully');
          setIsLoading(false);
          setIsPlaying(true);
          setAudioError(null);
        };
        
        audio.onended = () => {
          console.log('Audio playback finished');
          setIsPlaying(false);
          cleanupAudio();
          
          // Auto redirect after audio finishes
          console.log('Redirecting to join-quiz page...');
          timeoutRef.current = setTimeout(() => {
            navigate('/join-session');
          }, 300); // Slightly longer delay for better UX
        };
        
        audio.onerror = (event) => {
          console.error('Audio playback error event:', event);
          console.error('Audio error details:', {
            error: audio.error,
            src: audio.src,
            networkState: audio.networkState,
            readyState: audio.readyState
          });
          
          setIsLoading(false);
          setIsPlaying(false);
          setAudioError('Audio playback failed');
          cleanupAudio();
          
          // Fallback: redirect after delay
          console.log('Audio error, fallback redirect in 1.5 seconds');
          timeoutRef.current = setTimeout(() => {
            navigate('/join-quiz');
          }, 1500);
        };
        
        // Set volume and other properties
        audio.volume = 0.8;
        audio.preload = 'auto';
        
        // Try to play audio with error handling
        console.log('Attempting to play audio...');
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('Audio play() promise resolved');
            })
            .catch(error => {
              console.error('Audio play() promise rejected:', error);
              setIsLoading(false);
              setAudioError(`Play failed: ${error.message}`);
              
              // Try fallback: maybe the audio format is unsupported
              // Convert to different format or provide alternative
              timeoutRef.current = setTimeout(() => {
                console.log('Fallback redirect after play failure');
                navigate('/join-quiz');
              }, 1000);
            });
        }
        
        // Fallback timeout for safety
        timeoutRef.current = setTimeout(() => {
          if (isPlaying || isLoading) {
            console.log('Safety timeout reached, redirecting...');
            cleanupAudio();
            navigate('/join-quiz');
          }
        }, 8000); // 8 second max timeout
        
      } catch (error) {
        console.error('TTS fetch or processing error:', error);
        setIsLoading(false);
        setAudioError(error instanceof Error ? error.message : 'Failed to process audio');
        cleanupAudio();
        
        // If TTS fails, navigate after delay
        console.log('TTS failed, redirecting in 1 second...');
        timeoutRef.current = setTimeout(() => {
          navigate('/join-quiz');
        }, 1000);
      }
      
    } else {
      // For host, navigate immediately
      navigate('/auth');
    }
  };

  // Test TTS endpoint directly
  const testTTS = async () => {
    try {
      const formData = new FormData();
      formData.append('text', 'Test audio');
      
      const response = await fetch('http://127.0.0.1:5000/tts', {
        method: 'POST',
        body: formData,
      });
      
      console.log('Test response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        ok: response.ok
      });
      
      const blob = await response.blob();
      console.log('Test blob:', {
        size: blob.size,
        type: blob.type,
        blob
      });
      
    } catch (error) {
      console.error('Test failed:', error);
    }
  };

  return (
    <div className="min-h-screen transition-all duration-300 bg-white">
      <Navbar />
      
      {/* Audio Status Indicator */}
      {(isLoading || isPlaying || audioError) && (
        <div className="fixed top-4 right-4 z-50 rounded-lg shadow-lg p-3 max-w-xs bg-white border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                isLoading ? 'bg-yellow-500 animate-pulse' :
                isPlaying ? 'bg-green-500' :
                'bg-red-500'
              }`}></div>
              <span className={`text-sm font-medium ${
                isLoading ? 'text-yellow-600' :
                isPlaying ? 'text-green-600' :
                'text-red-600'
              }`}>
                {isLoading ? '🔄 Streaming...' : 
                 isPlaying ? '🔊 Playing...' : 
                 '❌ Audio Error'}
              </span>
            </div>
            <button
              onClick={testTTS}
              className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-600"
              title="Test TTS endpoint"
            >
              Test
            </button>
          </div>
          
          <div className="mt-2 text-xs text-gray-500">
            {isLoading && 'Fetching audio from server...'}
            {isPlaying && 'Audio playing, will redirect when finished'}
            {audioError && (
              <div className="space-y-1">
                <p className="text-red-500">{audioError}</p>
                <p>Will redirect anyway in a moment...</p>
              </div>
            )}
          </div>
          
          {/* Debug info in development */}
          {process.env.NODE_ENV === 'development' && audioError && (
            <details className="mt-2 text-xs">
              <summary className="cursor-pointer text-gray-400">Debug Info</summary>
              <div className="mt-1 p-2 bg-gray-50 rounded text-gray-600 font-mono">
                <p>Check browser console for details</p>
                <p>Try: Open dev tools → Console tab</p>
              </div>
            </details>
          )}
        </div>
      )}
      
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Participant Card */}
            <div 
              className={`relative transition-all duration-300 ${
                selectedRole === 'participant' 
                  ? 'transform scale-[1.02]' 
                  : isHoveringParticipant 
                    ? 'transform -translate-y-2' 
                    : ''
              }`}
              onMouseEnter={() => setIsHoveringParticipant(true)}
              onMouseLeave={() => setIsHoveringParticipant(false)}
            >
              <div 
                className={`h-full rounded-2xl border-2 p-8 cursor-pointer transition-all duration-300 ${
                  selectedRole === 'participant'
                    ? 'border-[#2563eb] bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-blue-200 hover:shadow-md'
                }`}
                onClick={() => handleRoleSelect('participant')}
              >
                <div className="absolute top-0 left-0 w-16 h-16 overflow-hidden">
                  <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-transparent transform -translate-x-12 -translate-y-12"></div>
                </div>
                
                <div className="flex flex-col items-center text-center">
                  <div className={`mb-6 p-4 rounded-xl transition-all duration-300 ${
                    selectedRole === 'participant' || isHoveringParticipant
                      ? 'bg-gradient-to-br from-blue-500 to-indigo-500'
                      : 'bg-gradient-to-br from-blue-100 to-indigo-100'
                  }`}>
                    <User className={`${selectedRole === 'participant' || isHoveringParticipant ? 'text-white' : 'text-[#2563eb]'}`} size={36} />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Participant
                  </h3>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Join an existing quiz session using a code provided by your host. Participate in real-time interactive quizzes.
                  </p>
                  
                  <div className="w-full mb-8">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 rounded-lg bg-blue-50/50">
                        <ClipboardCheck size={18} className="text-[#2563eb]" />
                        <div className="text-left">
                          <div className="text-sm font-medium text-gray-700">Quick Join</div>
                          <div className="text-xs text-gray-500">Enter code and start immediately</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg bg-blue-50/50">
                        <Award size={18} className="text-[#2563eb]" />
                        <div className="text-left">
                          <div className="text-sm font-medium text-gray-700">Live Scoring</div>
                          <div className="text-xs text-gray-500">See your rank in real-time</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg bg-blue-50/50">
                        <UserPlus size={18} className="text-[#2563eb]" />
                        <div className="text-left">
                          <div className="text-sm font-medium text-gray-700">Easy Participation</div>
                          <div className="text-xs text-gray-500">Simple interface for all users</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    disabled={isLoading || isPlaying}
                    className={`w-full py-4 rounded-xl font-semibold text-base transition-all flex items-center justify-center space-x-2 ${
                      selectedRole === 'participant' || isHoveringParticipant
                        ? 'bg-gradient-to-r from-[#2563eb] to-[#3b82f6] text-white shadow-sm hover:from-[#1d4ed8] hover:to-[#2563eb]'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } ${(isLoading || isPlaying) ? 'opacity-75 cursor-not-allowed' : ''}`}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Loading Audio...</span>
                      </>
                    ) : isPlaying ? (
                      <>
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-75"></div>
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-150"></div>
                        </div>
                        <span>Playing Audio...</span>
                      </>
                    ) : (
                      <>
                        <span>Join as Participant</span>
                        <ArrowRight size={18} className={selectedRole === 'participant' || isHoveringParticipant ? 'animate-pulse' : ''} />
                      </>
                    )}
                  </button>
                  
                  {(isLoading || isPlaying || audioError) && selectedRole === 'participant' && (
                    <div className="mt-3 space-y-1">
                      <p className={`text-sm ${
                        isLoading ? 'text-blue-600' :
                        isPlaying ? 'text-green-600' :
                        'text-red-600'
                      }`}>
                        {isLoading ? 'Loading audio...' : 
                         isPlaying ? 'Audio playing...' : 
                         'Audio error, redirecting...'}
                      </p>
                      <p className="text-xs text-gray-500">
                        🔊 Accessibility feature enabled
                      </p>
                    </div>
                  )}
                </div>
                
                {selectedRole === 'participant' && (
                  <div className="absolute -top-2 -right-2">
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center ${
                      isLoading ? 'bg-yellow-500 text-white' :
                      isPlaying ? 'bg-green-500 text-white' :
                      audioError ? 'bg-red-500 text-white' :
                      'bg-emerald-500 text-white'
                    }`}>
                      <CheckCircle size={12} className="mr-1" />
                      {isLoading ? 'Loading' : 
                       isPlaying ? 'Playing' : 
                       audioError ? 'Error' : 
                       'Selected'}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Host Card */}
            <div 
              className={`relative transition-all duration-300 ${
                selectedRole === 'host' 
                  ? 'transform scale-[1.02]' 
                  : isHoveringHost 
                    ? 'transform -translate-y-2' 
                    : ''
              }`}
              onMouseEnter={() => setIsHoveringHost(true)}
              onMouseLeave={() => setIsHoveringHost(false)}
            >
              <div 
                className={`h-full rounded-2xl border-2 p-8 cursor-pointer transition-all duration-300 ${
                  selectedRole === 'host'
                    ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-green-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-emerald-200 hover:shadow-md'
                }`}
                onClick={() => handleRoleSelect('host')}
              >
                <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/10 to-transparent transform translate-x-12 -translate-y-12"></div>
                </div>
                
                <div className="flex flex-col items-center text-center">
                  <div className={`mb-6 p-4 rounded-xl transition-all duration-300 ${
                    selectedRole === 'host' || isHoveringHost
                      ? 'bg-gradient-to-br from-emerald-500 to-green-500'
                      : 'bg-gradient-to-br from-emerald-100 to-green-100'
                  }`}>
                    <Users className={`${selectedRole === 'host' || isHoveringHost ? 'text-white' : 'text-emerald-600'}`} size={36} />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Host
                  </h3>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Create and manage quiz sessions. Build interactive quizzes, invite participants, and monitor real-time analytics.
                  </p>
                  
                  <div className="w-full mb-8">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 rounded-lg bg-emerald-50/50">
                        <Sparkles size={18} className="text-emerald-600" />
                        <div className="text-left">
                          <div className="text-sm font-medium text-gray-700">Quiz Builder</div>
                          <div className="text-xs text-gray-500">Create custom quizzes easily</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg bg-emerald-50/50">
                        <BarChart3 size={18} className="text-emerald-600" />
                        <div className="text-left">
                          <div className="text-sm font-medium text-gray-700">Analytics Dashboard</div>
                          <div className="text-xs text-gray-500">Track participant performance</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg bg-emerald-50/50">
                        <Settings size={18} className="text-emerald-600" />
                        <div className="text-left">
                          <div className="text-sm font-medium text-gray-700">Full Control</div>
                          <div className="text-xs text-gray-500">Manage settings and access</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    disabled={isLoading || isPlaying}
                    className={`w-full py-4 rounded-xl font-semibold text-base transition-all flex items-center justify-center space-x-2 ${
                      selectedRole === 'host' || isHoveringHost
                        ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-sm hover:from-emerald-600 hover:to-green-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } ${(isLoading || isPlaying) ? 'opacity-75 cursor-not-allowed' : ''}`}
                  >
                    <span>Continue as Host</span>
                    <ArrowRight size={18} className={selectedRole === 'host' || isHoveringHost ? 'animate-pulse' : ''} />
                  </button>
                </div>
                
                {selectedRole === 'host' && (
                  <div className="absolute -top-2 -right-2">
                    <div className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center">
                      <CheckCircle size={12} className="mr-1" />
                      Selected
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="text-center text-sm text-gray-500 mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="mb-2">
              <strong>Troubleshooting:</strong> If audio doesn't play, the page will redirect automatically after a short delay.
            </p>
            <p className="text-xs">
              Check browser console (F12 → Console) for detailed error messages.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default QuizVisionHome;
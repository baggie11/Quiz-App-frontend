// components/QuizPlayPage.tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  Clock, 
  Volume2, 
  Check, 
  AlertCircle, 
  Loader2, 
  ChevronRight,
  Star,
  ListChecks,
  List,
  MessageSquare,
  AlertTriangle,
  RefreshCw,
  Info
} from 'lucide-react';
import type { QType, Question } from '../types';

// Interface for your API response
interface ApiQuestionOption {
  id: string;
  is_correct: boolean;
  option_text: string;
}

interface ApiQuestion {
  id: string;
  question_text: string;
  order_index: number;
  question_options?: ApiQuestionOption[];
  rating_max?: number;
  correct_answer?: number | null;
  model_answer?: string;
  multi_answers?: number[];
  meta?: { required?: boolean; draft?: boolean; time_limit?: number; [k: string]: any };
}

interface ApiResponse {
  status: string;
  data: ApiQuestion[];
}

const QuizPlayPage = () => {
  const { sessionId, participantId } = useParams<{ sessionId: string; participantId: string }>();
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [ratingValue, setRatingValue] = useState<number>(0);
  const [openText, setOpenText] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [sessionTitle, setSessionTitle] = useState<string>('Live Quiz');
  const [usingMockData, setUsingMockData] = useState(false);
  
  const ttsRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Function to convert API question format to your Question type
  const convertApiQuestionToQuestion = (apiQuestion: ApiQuestion): Question => {
    // Determine question type based on available fields
    // Since your current API only returns quiz type, we'll default to 'quiz'
    // You'll need to update this when you add other question types
    let type: QType = 'quiz';
    
    // Extract just the option texts from question_options
    const options = apiQuestion.question_options?.map(opt => opt.option_text) || [];
    
    // Find correct answer index for quiz type
    let correctAnswer: number | null = null;
    if (apiQuestion.question_options) {
      const correctIndex = apiQuestion.question_options.findIndex(opt => opt.is_correct);
      if (correctIndex !== -1) {
        correctAnswer = correctIndex;
      }
    }
    
    // Convert meta if available
    const meta = apiQuestion.meta || {};
    
    return {
      id: apiQuestion.id,
      text: apiQuestion.question_text,
      type: type,
      options: options,
      ratingMax: apiQuestion.rating_max,
      correctAnswer: correctAnswer,
      modelAnswer: apiQuestion.model_answer,
      multiAnswers: apiQuestion.multi_answers,
      meta: meta
    };
  };

  // Get question type icon
  const getQuestionIcon = (type: QType) => {
    switch(type) {
      case 'quiz': return <ListChecks size={16} />;
      case 'multi': return <List size={16} />;
      case 'rating': return <Star size={16} />;
      case 'open': return <MessageSquare size={16} />;
      default: return <ListChecks size={16} />;
    }
  };

  // Get question type label
  const getQuestionTypeLabel = (type: QType) => {
    switch(type) {
      case 'quiz': return 'Single Choice';
      case 'multi': return 'Multiple Choice';
      case 'rating': return 'Rating';
      case 'open': return 'Open Text';
      default: return 'Question';
    }
  };

  // Fetch questions on component mount
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!sessionId) {
        setError('Session ID is required');
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      setUsingMockData(false);

      try {
        console.log('Fetching questions for session:', sessionId);
        
        const response = await fetch(`http://localhost:3000/api/sessions/${sessionId}/questions`, {
          headers: {
            'Authorization': `Bearer ${participantId}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Server error:', errorText);
          throw new Error(`Server error: ${response.status}`);
        }

        const apiResponse: ApiResponse = await response.json();
        console.log('API Response:', apiResponse);

        // Check if response has valid data
        if (apiResponse.status !== 'ok' || !Array.isArray(apiResponse.data)) {
          throw new Error('Invalid response format from server');
        }

        // Convert API questions to your Question type
        const convertedQuestions = apiResponse.data.map(convertApiQuestionToQuestion);
        
        if (convertedQuestions.length === 0) {
          throw new Error('No questions found for this session');
        }

        // Sort by order_index
        convertedQuestions.sort((a, b) => {
          const apiQuestionA = apiResponse.data.find(q => q.id === a.id);
          const apiQuestionB = apiResponse.data.find(q => q.id === b.id);
          return (apiQuestionA?.order_index || 0) - (apiQuestionB?.order_index || 0);
        });

        setQuestions(convertedQuestions);
        setSessionTitle(`Session ${sessionId}`);
        
        // Initialize timer if first question has meta.time_limit
        if (convertedQuestions.length > 0) {
          const firstQuestion = convertedQuestions[0];
          const timeLimit = firstQuestion.meta?.time_limit as number | undefined;
          if (timeLimit) {
            setTimeLeft(timeLimit);
          }
        }

      } catch (err) {
        console.error('Error fetching questions:', err);
        setError(err instanceof Error ? err.message : 'Failed to load quiz questions');
        
        // Create mock data for testing
        const mockQuestions: Question[] = [
          {
            id: '1',
            text: 'What is the capital of France?',
            type: 'quiz',
            options: ['London', 'Berlin', 'Paris', 'Madrid'],
            correctAnswer: 2,
            meta: { time_limit: 30, required: true }
          },
          {
            id: '2',
            text: 'What is 2 + 2?',
            type: 'quiz',
            options: ['3', '4', '5', '6'],
            correctAnswer: 1,
            meta: { time_limit: 20, required: true }
          }
        ];
        
        setQuestions(mockQuestions);
        setSessionTitle('Demo Quiz Session');
        setUsingMockData(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
    
    // Cleanup
    return () => {
      if (ttsRef.current) {
        window.speechSynthesis.cancel();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [sessionId, participantId]);

  // Handle timer countdown
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || isAnswered || questions.length === 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timeLeft, isAnswered, questions]);

  // Text-to-Speech for accessibility
  const speakQuestion = useCallback((question: Question) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const speechText = `
      Question: ${question.text}.
      ${question.type === 'quiz' || question.type === 'multi' 
        ? `Options: ${question.options?.join(', ') || 'No options provided'}`
        : question.type === 'rating'
        ? `Please rate from 1 to ${question.ratingMax || 5}`
        : 'Please type your answer'
      }
    `;

    ttsRef.current = new SpeechSynthesisUtterance(speechText);
    ttsRef.current.rate = 0.9;
    ttsRef.current.pitch = 1;
    ttsRef.current.volume = 1;
    
    window.speechSynthesis.speak(ttsRef.current);
  }, []);

  // Auto-speak when question changes
  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex < questions.length) {
      const currentQuestion = questions[currentQuestionIndex];
      speakQuestion(currentQuestion);
      
      // Reset states for new question
      setSelectedOptions([]);
      setRatingValue(0);
      setOpenText('');
      setIsAnswered(false);
      
      // Set timer from meta.time_limit
      const timeLimit = currentQuestion.meta?.time_limit as number | undefined;
      if (timeLimit) {
        setTimeLeft(timeLimit);
      } else {
        setTimeLeft(null);
      }
      
      // Focus on textarea for open questions
      if (currentQuestion.type === 'open' && textareaRef.current) {
        setTimeout(() => {
          textareaRef.current?.focus();
        }, 500);
      }
    }
  }, [currentQuestionIndex, questions, speakQuestion]);

  const handleTimeUp = () => {
    if (window.speechSynthesis) {
      const timeUpMsg = new SpeechSynthesisUtterance("Time's up! Please submit your answer.");
      window.speechSynthesis.speak(timeUpMsg);
    }
    
    if (selectedOptions.length > 0 || ratingValue > 0 || openText.trim()) {
      handleSubmit();
    }
  };

  const handleOptionSelect = (optionIndex: number) => {
    if (isAnswered || !questions[currentQuestionIndex]) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    
    if (currentQuestion.type === 'quiz') {
      setSelectedOptions([optionIndex]);
    } else if (currentQuestion.type === 'multi') {
      setSelectedOptions(prev =>
        prev.includes(optionIndex)
          ? prev.filter(idx => idx !== optionIndex)
          : [...prev, optionIndex]
      );
    }
    
    if (window.speechSynthesis && currentQuestion.options?.[optionIndex]) {
      const msg = new SpeechSynthesisUtterance(`Selected: ${currentQuestion.options[optionIndex]}`);
      window.speechSynthesis.speak(msg);
    }
  };

  const handleRatingSelect = (value: number) => {
    if (isAnswered) return;
    setRatingValue(value);
    
    if (window.speechSynthesis) {
      const msg = new SpeechSynthesisUtterance(`Rating: ${value} out of ${questions[currentQuestionIndex]?.ratingMax || 5}`);
      window.speechSynthesis.speak(msg);
    }
  };

  const handleSubmit = async () => {
    if (isAnswered || isSubmitting || !questions[currentQuestionIndex]) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    let answer: any = null;
    
    switch (currentQuestion.type) {
      case 'quiz':
      case 'multi':
        if (selectedOptions.length === 0 && currentQuestion.meta?.required !== false) {
          if (window.speechSynthesis) {
            const msg = new SpeechSynthesisUtterance('Please select at least one option');
            window.speechSynthesis.speak(msg);
          }
          return;
        }
        answer = { selectedIndices: selectedOptions };
        break;
      case 'rating':
        if (ratingValue === 0 && currentQuestion.meta?.required !== false) {
          if (window.speechSynthesis) {
            const msg = new SpeechSynthesisUtterance('Please select a rating');
            window.speechSynthesis.speak(msg);
          }
          return;
        }
        answer = { rating: ratingValue };
        break;
      case 'open':
        if (!openText.trim() && currentQuestion.meta?.required !== false) {
          if (window.speechSynthesis) {
            const msg = new SpeechSynthesisUtterance('Please enter your answer');
            window.speechSynthesis.speak(msg);
          }
          return;
        }
        answer = { text: openText };
        break;
      default:
        return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (!usingMockData) {
        const response = await fetch(`http://localhost:3000/api/sessions/${sessionId}/questions/${currentQuestion.id}/answer`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            participantId: participantId,
            questionId: currentQuestion.id,
            answer,
            timestamp: new Date().toISOString(),
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to submit answer');
        }
      } else {
        // Mock submission
        console.log('Mock submission:', { questionId: currentQuestion.id, answer });
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setIsAnswered(true);
      
      if (window.speechSynthesis) {
        const msg = new SpeechSynthesisUtterance('Answer submitted successfully');
        window.speechSynthesis.speak(msg);
      }

      setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
        } else {
          if (window.speechSynthesis) {
            const msg = new SpeechSynthesisUtterance('Quiz completed! Thank you for participating.');
            window.speechSynthesis.speak(msg);
          }
          navigate(`/quiz-complete/${sessionId}/${participantId}`);
        }
      }, 2000);

    } catch (err) {
      console.error('Error submitting answer:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit answer');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnswered || !questions[currentQuestionIndex]) return;
      
      const currentQuestion = questions[currentQuestionIndex];
      
      switch(e.key) {
        case 'Enter':
          if (e.ctrlKey || e.metaKey) {
            handleSubmit();
          }
          break;
          
        case ' ':
          if (currentQuestion.type === 'rating' && 
              e.target instanceof HTMLElement && 
              e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            const maxRating = currentQuestion.ratingMax || 5;
            const nextRating = ratingValue === maxRating ? 1 : ratingValue + 1;
            handleRatingSelect(nextRating);
          }
          break;
          
        case 'ArrowUp':
        case 'ArrowDown':
          if (currentQuestion.type === 'rating' && 
              e.target instanceof HTMLElement && 
              e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            const maxRating = currentQuestion.ratingMax || 5;
            const direction = e.key === 'ArrowUp' ? 1 : -1;
            const newRating = Math.max(1, Math.min(maxRating, ratingValue + direction));
            handleRatingSelect(newRating);
          }
          break;
          
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          if (currentQuestion.type === 'rating' && 
              e.target instanceof HTMLElement && 
              e.target.tagName !== 'TEXTAREA') {
            const num = parseInt(e.key);
            const maxRating = currentQuestion.ratingMax || 5;
            if (num >= 1 && num <= maxRating) {
              handleRatingSelect(num);
            }
          }
          break;
          
        case 'a':
        case 'b':
        case 'c':
        case 'd':
        case 'e':
        case 'f':
        case 'g':
        case 'h':
          if ((currentQuestion.type === 'quiz' || currentQuestion.type === 'multi') && 
              e.target instanceof HTMLElement && 
              e.target.tagName !== 'TEXTAREA') {
            const optionIndex = e.key.charCodeAt(0) - 97;
            if (optionIndex >= 0 && optionIndex < (currentQuestion.options?.length || 0)) {
              handleOptionSelect(optionIndex);
            }
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestionIndex, questions, ratingValue, isAnswered]);

  const renderQuestionContent = (question: Question) => {
    if (!question) return null;

    switch (question.type) {
      case 'quiz':
      case 'multi':
        return (
          <div className="space-y-3">
            <div className="text-lg font-semibold text-gray-800 mb-4">
              Select {question.type === 'quiz' ? 'one' : 'one or more'} options:
            </div>
            <div className="space-y-2">
              {question.options?.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleOptionSelect(index)}
                  disabled={isAnswered}
                  className={`w-full p-4 rounded-xl border text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
                    selectedOptions.includes(index)
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm'
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                  } ${isAnswered ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                  aria-label={`Option ${String.fromCharCode(65 + index)}: ${option}`}
                  aria-pressed={selectedOptions.includes(index)}
                  tabIndex={isAnswered ? -1 : 0}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center bg-white">
                      <span className="text-sm font-medium text-gray-600">
                        {String.fromCharCode(65 + index)}
                      </span>
                    </div>
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0 ${
                      selectedOptions.includes(index)
                        ? 'border-indigo-500 bg-indigo-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedOptions.includes(index) && (
                        <Check size={14} className="text-white" />
                      )}
                    </div>
                    <span className="font-medium text-gray-800">{option}</span>
                  </div>
                </button>
              ))}
            </div>
            {selectedOptions.length > 0 && (
              <div className="mt-4 text-sm text-blue-600 font-medium">
                Selected: {selectedOptions.map(idx => String.fromCharCode(65 + idx)).join(', ')}
              </div>
            )}
          </div>
        );

      case 'rating':
        const maxRating = question.ratingMax || 5;
        return (
          <div className="space-y-6">
            <div className="text-lg font-semibold text-gray-800">
              Rate from 1 to {maxRating}:
            </div>
            <div className="flex justify-center gap-2">
              {Array.from({ length: maxRating }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  onClick={() => handleRatingSelect(num)}
                  disabled={isAnswered}
                  className={`w-14 h-14 rounded-xl border-2 text-xl font-bold transition-all focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
                    ratingValue >= num
                      ? 'border-blue-600 bg-gradient-to-br from-blue-500 to-indigo-600 text-white'
                      : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                  } ${isAnswered ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                  aria-label={`Rating ${num}`}
                  aria-pressed={ratingValue === num}
                  tabIndex={isAnswered ? -1 : 0}
                >
                  {num}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Poor</span>
              <span>Excellent</span>
            </div>
            {ratingValue > 0 && (
              <div className="text-center">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-full">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-blue-600 font-semibold">You selected: {ratingValue}</span>
                </div>
              </div>
            )}
          </div>
        );

      case 'open':
        return (
          <div className="space-y-4">
            <div className="text-lg font-semibold text-gray-800">Type your answer:</div>
            {question.modelAnswer && !isAnswered && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <strong>Model answer for reference:</strong> {question.modelAnswer}
                  </div>
                </div>
              </div>
            )}
            <textarea
              ref={textareaRef}
              value={openText}
              onChange={(e) => setOpenText(e.target.value)}
              disabled={isAnswered}
              rows={4}
              className="w-full p-4 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed resize-none"
              placeholder="Enter your response here..."
              aria-label="Text answer input"
              tabIndex={isAnswered ? -1 : 0}
            />
            {question.meta?.required !== false && (
              <div className="text-sm text-gray-500">
                * This question is required
              </div>
            )}
          </div>
        );
        
      default:
        return (
          <div className="text-center py-8 text-gray-500">
            Unknown question type
          </div>
        );
    }
  };

  const reloadQuestions = () => {
    setIsLoading(true);
    setError(null);
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50/50 to-blue-50/50 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 p-8 max-w-md text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Quiz</h2>
          <p className="text-gray-600">Preparing your questions...</p>
        </div>
      </div>
    );
  }

  if (error && questions.length === 0 && !usingMockData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50/50 to-blue-50/50 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Quiz</h1>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-gray-700 mb-2">{error}</p>
            <p className="text-sm text-gray-600">
              Session: {sessionId}<br/>
              Participant: {participantId?.slice(0, 8)}...
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={reloadQuestions}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-medium hover:opacity-90 transition flex items-center justify-center gap-2"
            >
              <RefreshCw size={18} />
              Retry Loading
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50/50 to-blue-50/50 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 p-8 max-w-md text-center">
          <Info className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">No Questions Available</h1>
          <p className="text-gray-600 mb-6">
            This quiz session doesn't have any questions yet.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-medium hover:opacity-90 transition"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isRequired = currentQuestion.meta?.required !== false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/50 to-blue-50/50 p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-100 p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-gray-900">{sessionTitle}</h1>
                {usingMockData && (
                  <span className="text-xs font-medium bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    Demo Mode
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 text-sm">Participant:</span>
                <span className="text-sm font-mono bg-indigo-50 text-indigo-700 px-2 py-1 rounded">
                  {participantId?.slice(0, 8)}...
                </span>
                <span className="text-sm text-gray-500">Questions: {questions.length}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {timeLeft !== null && (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
                  timeLeft <= 10 
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white animate-pulse' 
                    : 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white'
                }`}>
                  <Clock size={18} />
                  <span className="font-bold">{timeLeft}s</span>
                </div>
              )}
              <button
                onClick={() => speakQuestion(currentQuestion)}
                className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition focus:outline-none focus:ring-2 focus:ring-indigo-300"
                aria-label="Repeat question"
              >
                <Volume2 size={20} />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-2">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Error/Info banner */}
        {error && (
          <div className="mb-4 p-4 rounded-xl border bg-yellow-50 border-yellow-200">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-yellow-600" />
              <p className="text-sm text-yellow-800">{error}</p>
            </div>
          </div>
        )}

        {/* Question Card */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-100 p-6 mb-6">
          {/* Question header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full" />
                  {getQuestionTypeLabel(currentQuestion.type)}
                </div>
                {isRequired && (
                  <span className="text-xs font-medium bg-red-50 text-red-700 px-2 py-1 rounded">
                    Required
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {currentQuestion.text}
              </h2>
              
              {/* Show question metadata if available */}
              {currentQuestion.meta && currentQuestion.meta.time_limit && (
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                    Time Limit: {currentQuestion.meta.time_limit}s
                  </span>
                </div>
              )}
            </div>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 ml-4 flex-shrink-0">
              {getQuestionIcon(currentQuestion.type)}
            </div>
          </div>

          {/* Question content */}
          {renderQuestionContent(currentQuestion)}

          {/* Action buttons */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => speakQuestion(currentQuestion)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-700 hover:bg-gray-50 transition focus:outline-none focus:ring-2 focus:ring-gray-200"
                  aria-label="Repeat question with voice"
                >
                  <Volume2 size={18} />
                  Repeat Question
                </button>
              </div>
              
              <div className="flex items-center gap-3">
                {currentQuestionIndex < questions.length - 1 && isAnswered && (
                  <button
                    onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-medium hover:opacity-90 transition focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  >
                    Next Question
                    <ChevronRight size={18} />
                  </button>
                )}
                
                <button
                  onClick={handleSubmit}
                  disabled={isAnswered || isSubmitting}
                  className={`px-8 py-3 rounded-xl font-medium transition focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
                    isAnswered
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:opacity-90'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </span>
                  ) : isAnswered ? (
                    <span className="flex items-center gap-2">
                      <CheckCircle size={18} />
                      Submitted
                    </span>
                  ) : (
                    'Submit Answer'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation & Instructions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Accessibility Instructions */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-800 mb-2">Accessibility Instructions</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Tab/Shift+Tab to navigate</li>
              <li>• A/B/C/D to select options</li>
              <li>• 1-5 for rating questions</li>
              <li>• Ctrl+Enter to submit</li>
              <li>• Space to repeat question</li>
            </ul>
          </div>

          {/* Question Navigation */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-800 mb-2">Question Navigation</h3>
            <div className="flex flex-wrap gap-2">
              {questions.map((q, index) => (
                <button
                  key={q.id}
                  onClick={() => {
                    if (!isAnswered || index === currentQuestionIndex) {
                      setCurrentQuestionIndex(index);
                    }
                  }}
                  disabled={isAnswered && index !== currentQuestionIndex}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition ${
                    index === currentQuestionIndex
                      ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  } ${isAnswered && index !== currentQuestionIndex ? 'opacity-50 cursor-not-allowed' : ''}`}
                  aria-label={`Go to question ${index + 1}`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPlayPage;
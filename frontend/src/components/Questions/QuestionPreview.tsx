import { forwardRef, useEffect } from 'react';
import { type Question } from '../../types';
import { X, Eye, CheckCircle, Star, Type, MessageSquare, ClipboardList, ChevronRight } from 'lucide-react';

interface QuestionPreviewProps {
  isOpen: boolean;
  questions: Question[];
  onClose: () => void;
}

export const QuestionPreview = forwardRef<HTMLDivElement, QuestionPreviewProps>(({
  isOpen,
  questions,
  onClose
}, ref) => {
  // Focus the modal when it opens
  useEffect(() => {
    if (isOpen && ref && 'current' in ref && ref.current) {
      setTimeout(() => {
        ref.current?.focus();
      }, 50);
    }
  }, [isOpen, ref]);

  if (!isOpen) return null;

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'quiz': return <ClipboardList className="w-4 h-4" />;
      case 'multi': return <CheckCircle className="w-4 h-4" />;
      case 'rating': return <Star className="w-4 h-4" />;
      case 'open': return <MessageSquare className="w-4 h-4" />;
      default: return <Type className="w-4 h-4" />;
    }
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'quiz': return 'Single Choice';
      case 'multi': return 'Multiple Choice';
      case 'rating': return 'Rating Scale';
      case 'open': return 'Open Ended';
      default: return type;
    }
  };

  const renderQuestionPreview = (q: Question, index: number) => {
    const totalQuestions = questions.length;
    return (
      <div key={q.id} className="mb-8 last:mb-0">
        {/* Question Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className={`px-3 py-1 rounded-lg flex items-center gap-2 text-xs font-medium ${
                q.type === 'quiz' ? 'bg-blue-50 text-blue-700' :
                q.type === 'multi' ? 'bg-purple-50 text-purple-700' :
                q.type === 'rating' ? 'bg-amber-50 text-amber-700' :
                'bg-emerald-50 text-emerald-700'
              }`}>
                {getQuestionTypeIcon(q.type)}
                {getQuestionTypeLabel(q.type)}
              </div>
              <div className="text-xs text-gray-500 font-medium">
                Question {index + 1} of {totalQuestions}
              </div>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900">
              {q.text || (
                <span className="text-gray-400 italic">Click to edit question text...</span>
              )}
            </h3>
          </div>
          
          <div className="flex items-center gap-2">
            {q.meta?.required && (
              <span className="px-2 py-1 bg-red-50 text-red-700 text-xs font-medium rounded">
                Required
              </span>
            )}
          </div>
        </div>

        {/* Question Content */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          {q.type === 'quiz' || q.type === 'multi' ? (
            <div className="space-y-2.5">
              {q.options?.map((option, idx) => {
                const isCorrect = q.type === 'quiz' 
                  ? q.correctAnswer === idx 
                  : (q.multiAnswers || []).includes(idx);
                
                return (
                  <div 
                    key={idx} 
                    className={`p-3 border rounded-lg transition-all duration-200 ${
                      isCorrect 
                        ? 'border-green-300 bg-green-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          q.type === 'multi'
                            ? isCorrect
                              ? 'border-green-500 bg-green-500'
                              : 'border-gray-300'
                            : isCorrect
                              ? 'border-green-500 bg-green-500'
                              : 'border-gray-300'
                        }`}>
                          {q.type === 'multi' && isCorrect && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                          {q.type === 'quiz' && isCorrect && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                        <span className="text-gray-800 flex-1">{option}</span>
                      </div>
                      
                      {isCorrect && (
                        <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                          <CheckCircle className="w-4 h-4" />
                          <span>Correct</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {q.options && q.options.length === 0 && (
                <div className="text-center py-4 text-gray-400">
                  No options added
                </div>
              )}
            </div>
          ) : q.type === 'rating' ? (
            <div className="py-2">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-600">Poor</span>
                <span className="text-sm text-gray-600">Excellent</span>
              </div>
              <div className="flex justify-center gap-1">
                {Array.from({ length: q.ratingMax || 5 }).map((_, index) => (
                  <div key={index} className="group relative">
                    <div className="w-12 h-12 rounded-full border-2 border-gray-200 flex items-center justify-center text-2xl transition-all duration-200 group-hover:scale-110 group-hover:border-yellow-300 group-hover:bg-yellow-50">
                      {index + 1}
                    </div>
                    <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 font-medium">
                      {index + 1}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-8 text-center text-sm text-gray-500">
                Select a rating from 1 to {q.ratingMax || 5}
              </div>
            </div>
          ) : q.type === 'open' ? (
            <div className="space-y-4">
              <div className="relative">
                <textarea 
                  className="w-full p-4 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  rows={4}
                  placeholder="Type your answer here..."
                  disabled
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                  Character limit: 500
                </div>
              </div>
              
              {q.correctAnswer && (
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-3 h-3 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-blue-900 mb-1">Model Answer</h4>
                      <p className="text-blue-700 text-sm leading-relaxed">
                        {q.correctAnswer}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Question Footer */}
        {(q.type === 'quiz' || q.type === 'multi') && (
          <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
            <div>
              {q.type === 'quiz' ? 'Select one answer' : 'Select all that apply'}
            </div>
            <div>
              {q.options?.length || 0} options
            </div>
          </div>
        )}
      </div>
    );
  };

  const totalQuestions = questions.length;
  const questionTypes = {
    quiz: questions.filter(q => q.type === 'quiz').length,
    multi: questions.filter(q => q.type === 'multi').length,
    rating: questions.filter(q => q.type === 'rating').length,
    open: questions.filter(q => q.type === 'open').length,
  };

  return (
    <div 
      ref={ref}
      tabIndex={-1}
      className="fixed inset-0 z-50 overflow-y-auto focus:outline-none"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="min-h-screen px-4 text-center">
        {/* Backdrop */}
        <div className="fixed inset-0 transition-opacity" />
        
        {/* Center modal */}
        <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block w-full max-w-5xl my-8 text-left align-middle transition-all transform">
          {/* Modal Content */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <Eye className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Question Preview</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-gray-600">
                        {totalQuestions} question{totalQuestions !== 1 ? 's' : ''} • 
                      </p>
                      <div className="flex items-center gap-1.5">
                        {questionTypes.quiz > 0 && (
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded">
                            {questionTypes.quiz} Single Choice
                          </span>
                        )}
                        {questionTypes.multi > 0 && (
                          <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-xs font-medium rounded">
                            {questionTypes.multi} Multiple Choice
                          </span>
                        )}
                        {questionTypes.rating > 0 && (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-medium rounded">
                            {questionTypes.rating} Rating
                          </span>
                        )}
                        {questionTypes.open > 0 && (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded">
                            {questionTypes.open} Open Ended
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors"
                  >
                    Print Preview
                  </button>
                  <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                    aria-label="Close preview"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>
              
              {/* Progress bar for scrolling */}
              <div className="mt-4">
                <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 transition-all duration-300"
                    style={{ width: '0%' }}
                  />
                </div>
              </div>
            </div>

            {/* Scrollable Questions Area */}
            <div className="flex-1 overflow-y-auto p-6">
              {questions.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Eye className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nothing to preview yet</h3>
                  <p className="text-gray-500 max-w-sm mx-auto">
                    Add some questions to your session to see how they'll appear to respondents.
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  {questions.map((q, i) => renderQuestionPreview(q, i))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  This preview simulates the respondent's view. Actual responses will be collected when published.
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={onClose}
                    className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  >
                    Close Preview
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      // You could add logic to navigate to publish here
                    }}
                    className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors flex items-center gap-2"
                  >
                    <span>Continue Editing</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

QuestionPreview.displayName = 'QuestionPreview';
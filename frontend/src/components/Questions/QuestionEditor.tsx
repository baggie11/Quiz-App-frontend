import React, { useState } from 'react';
import type { Question } from '../../types';
import { 
  Plus, Trash2, CheckCircle, Circle, 
  Type, MessageSquare, ClipboardList, Star,
  ChevronRight, ChevronLeft, Check
} from 'lucide-react';

interface QuestionEditorProps {
  question: Question;
  index: number;
  onUpdate: (id: string, patch: Partial<Question>) => void;
  onAddOption: (questionId: string) => void;
  onUpdateOption: (questionId: string, idx: number, value: string) => void;
  onRemoveOption: (questionId: string, idx: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDropChangeType: (e: React.DragEvent, questionId: string) => void;
  isCurrent?: boolean; // New prop to indicate if this is the current question
  onSubmitQuestion?: (questionId: string) => void; // New prop for submitting individual question
  isSubmitting?: boolean; // New prop to show submission state
}

export const QuestionEditor: React.FC<QuestionEditorProps> = ({
  question,
  index,
  onUpdate,
  onAddOption,
  onUpdateOption,
  onRemoveOption,
  onDragOver,
  onDropChangeType,
  isCurrent = false,
  onSubmitQuestion,
  isSubmitting = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'quiz': return <ClipboardList className="w-5 h-5" />;
      case 'multi': return <CheckCircle className="w-5 h-5" />;
      case 'rating': return <Star className="w-5 h-5" />;
      case 'open': return <MessageSquare className="w-5 h-5" />;
      default: return <Type className="w-5 h-5" />;
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

  const handleToggleCorrect = (optionIndex: number) => {
    if (question.type === 'quiz') {
      // For single choice, toggle the correct answer
      onUpdate(question.id, {
        correctAnswer: question.correctAnswer === optionIndex ? null : optionIndex
      });
    } else if (question.type === 'multi') {
      // For multiple choice, add/remove from multiAnswers array
      const currentAnswers = question.multiAnswers || [];
      const isCurrentlyCorrect = currentAnswers.includes(optionIndex);
      
      if (isCurrentlyCorrect) {
        onUpdate(question.id, {
          multiAnswers: currentAnswers.filter(i => i !== optionIndex)
        });
      } else {
        onUpdate(question.id, {
          multiAnswers: [...currentAnswers, optionIndex]
        });
      }
    }
  };

  const isOptionCorrect = (optionIndex: number) => {
    if (question.type === 'quiz') {
      return question.correctAnswer === optionIndex;
    } else if (question.type === 'multi') {
      return (question.multiAnswers || []).includes(optionIndex);
    }
    return false;
  };

  const handleSubmitQuestion = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSubmitQuestion) {
      onSubmitQuestion(question.id);
    }
  };

  // Function to validate if question is ready for submission
  const isQuestionValidForSubmission = () => {
    // Check if question text is provided
    if (!question.text || question.text.trim() === '') {
      return false;
    }

    // For quiz and multi-choice questions, check options
    if ((question.type === 'quiz' || question.type === 'multi') && question.options) {
      // Check if all options have text
      const hasEmptyOptions = question.options.some(option => !option || option.trim() === '');
      if (hasEmptyOptions) {
        return false;
      }

      // Check for correct answers
      if (question.type === 'quiz' && question.correctAnswer === null) {
        return false; // No correct answer selected
      }

      if (question.type === 'multi' && (!question.multiAnswers || question.multiAnswers.length === 0)) {
        return false; // No correct answers selected
      }
    }

    // For rating questions, check ratingMax
    if (question.type === 'rating' && (!question.ratingMax || question.ratingMax < 2)) {
      return false;
    }

    return true;
  };

  const validationIssues = () => {
    const issues: string[] = [];
    
    if (!question.text || question.text.trim() === '') {
      issues.push('Question text is required');
    }

    if ((question.type === 'quiz' || question.type === 'multi') && question.options) {
      const emptyOptions = question.options.filter(option => !option || option.trim() === '');
      if (emptyOptions.length > 0) {
        issues.push(`${emptyOptions.length} option(s) are empty`);
      }

      if (question.type === 'quiz' && question.correctAnswer === null) {
        issues.push('No correct answer selected');
      }

      if (question.type === 'multi' && (!question.multiAnswers || question.multiAnswers.length === 0)) {
        issues.push('No correct answers selected');
      }
    }

    if (question.type === 'rating' && (!question.ratingMax || question.ratingMax < 2)) {
      issues.push('Rating scale must be at least 2');
    }

    return issues;
  };

  return (
    <div 
      className={`bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 ${
        isCurrent 
          ? 'border-indigo-500 ring-2 ring-indigo-100' 
          : 'border-gray-200 hover:border-gray-300'
      }`}
      onDragOver={onDragOver}
      onDrop={(e) => onDropChangeType(e, question.id)}
    >
      {/* Question Header */}
      <div 
        className={`p-6 cursor-pointer transition-colors ${
          isCurrent ? 'bg-indigo-50' : 'hover:bg-gray-50'
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-semibold ${
              isCurrent
                ? 'bg-indigo-600 text-white'
                : question.meta?.submitted
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {index + 1}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <div className={`px-3 py-1 rounded-lg flex items-center gap-2 text-sm font-medium ${
                  question.type === 'quiz' ? 'bg-blue-50 text-blue-700' :
                  question.type === 'multi' ? 'bg-purple-50 text-purple-700' :
                  question.type === 'rating' ? 'bg-amber-50 text-amber-700' :
                  'bg-emerald-50 text-emerald-700'
                }`}>
                  {getQuestionTypeIcon(question.type)}
                  {getQuestionTypeLabel(question.type)}
                </div>
                {question.meta?.required && (
                  <span className="px-2 py-1 bg-red-50 text-red-700 text-xs font-medium rounded">
                    Required
                  </span>
                )}
                {question.meta?.submitted && (
                  <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Submitted
                  </span>
                )}
                {isCurrent && (
                  <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded flex items-center gap-1">
                    <ChevronRight className="w-3 h-3" />
                    Current
                  </span>
                )}
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900">
                {question.text || (
                  <span className="text-gray-400 italic">Untitled question...</span>
                )}
              </h3>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {onSubmitQuestion && !question.meta?.submitted && (
              <button
                onClick={handleSubmitQuestion}
                disabled={isSubmitting || !isQuestionValidForSubmission()}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  isSubmitting
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : !isQuestionValidForSubmission()
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Submit
                  </>
                )}
              </button>
            )}
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUpdate(question.id, { 
                  meta: { ...question.meta, required: !question.meta?.required }
                });
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                question.meta?.required
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {question.meta?.required ? 'Required' : 'Optional'}
            </button>
            
            <div className="text-gray-400">
              {isExpanded ? '▼' : '▶'}
            </div>
          </div>
        </div>
      </div>

      {/* Question Content - Collapsible */}
      {isExpanded && (
        <div className="px-6 pb-6 border-t border-gray-100">
          {/* Question Text Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Text
            </label>
            <textarea
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
              rows={3}
              value={question.text || ''}
              onChange={(e) => onUpdate(question.id, { text: e.target.value })}
              placeholder="Enter your question here..."
            />
          </div>
          
          {/* Validation warnings */}
          {!isQuestionValidForSubmission() && !question.meta?.submitted && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 flex-shrink-0 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
                  !
                </div>
                <div>
                  <h4 className="font-medium text-amber-800 mb-1">
                    Complete the question to submit
                  </h4>
                  <ul className="text-sm text-amber-700 space-y-1">
                    {validationIssues().map((issue, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Question Type Specific Content */}
          {(question.type === 'quiz' || question.type === 'multi') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Answer Options
                  <span className="text-xs text-gray-500 ml-2">
                    {question.type === 'quiz' 
                      ? 'Select one correct answer' 
                      : 'Select all correct answers'}
                  </span>
                </label>
                {(question.options?.length || 0) > 0 && (
                  <button
                    onClick={() => onAddOption(question.id)}
                    className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    Add Option
                  </button>
                )}
              </div>

              {(question.options?.length || 0) === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl">
                  <p className="text-gray-500 mb-4">No options added yet</p>
                  <button
                    onClick={() => onAddOption(question.id)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
                  >
                    Add First Option
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {question.options?.map((option, idx) => (
                    <div key={idx} className="flex items-center gap-3 group">
                      {/* Correct Answer Toggle */}
                      <button
                        onClick={() => handleToggleCorrect(idx)}
                        className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg transition-colors ${
                          isOptionCorrect(idx)
                            ? question.type === 'quiz'
                              ? 'bg-green-100 text-green-600 hover:bg-green-200'
                              : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                        title={isOptionCorrect(idx) ? "Mark as incorrect" : "Mark as correct"}
                      >
                        {question.type === 'quiz' ? (
                          isOptionCorrect(idx) ? (
                            <div className="w-3 h-3 bg-green-600 rounded-full" />
                          ) : (
                            <Circle className="w-4 h-4" />
                          )
                        ) : (
                          isOptionCorrect(idx) ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <div className="w-5 h-5 border-2 border-gray-300 rounded-sm" />
                          )
                        )}
                      </button>

                      {/* Option Input */}
                      <div className="flex-1 flex items-center gap-3">
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            className={`w-full p-3 pr-10 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
                              !option || option.trim() === ''
                                ? 'border-amber-300 bg-amber-50'
                                : 'border-gray-300'
                            }`}
                            value={option}
                            onChange={(e) => onUpdateOption(question.id, idx, e.target.value)}
                            placeholder={`Option ${idx + 1}`}
                          />
                          {isOptionCorrect(idx) && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1 text-xs font-medium">
                              {question.type === 'quiz' ? (
                                <span className="text-green-600 bg-green-50 px-2 py-1 rounded">
                                  Correct Answer
                                </span>
                              ) : (
                                <span className="text-purple-600 bg-purple-50 px-2 py-1 rounded">
                                  Correct
                                </span>
                              )}
                            </div>
                          )}
                          {(!option || option.trim() === '') && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <span className="text-amber-500 text-xs font-medium bg-amber-100 px-2 py-1 rounded">
                                Required
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Remove Option Button - only show if more than 2 options */}
                        {question.options && question.options.length > 2 && (
                          <button
                            onClick={() => onRemoveOption(question.id, idx)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            title="Remove option"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Maximum options warning */}
              {question.options && question.options.length >= 10 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-amber-700 text-sm">
                    Maximum of 10 options reached. Remove an option to add more.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Rating Question Configuration */}
          {question.type === 'rating' && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Rating Scale
              </label>
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-500">Min</div>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={1}
                  disabled
                  className="w-16 p-2 border border-gray-300 rounded-lg text-center bg-gray-50"
                />
                <div className="text-sm text-gray-500">to</div>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={question.ratingMax || 5}
                  onChange={(e) => onUpdate(question.id, { ratingMax: parseInt(e.target.value) || 5 })}
                  className={`w-16 p-2 border rounded-lg text-center focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    (!question.ratingMax || question.ratingMax < 2)
                      ? 'border-amber-300 bg-amber-50'
                      : 'border-gray-300'
                  }`}
                />
                <div className="text-sm text-gray-500">Max</div>
              </div>
              {(!question.ratingMax || question.ratingMax < 2) && (
                <p className="text-amber-600 text-sm">
                  Rating scale must be at least 2
                </p>
              )}
              <div className="flex justify-center gap-2 mt-4">
                {Array.from({ length: question.ratingMax || 5 }).map((_, index) => (
                  <div
                    key={index}
                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-lg font-medium ${
                      (!question.ratingMax || question.ratingMax < 2)
                        ? 'border-amber-200 text-amber-400'
                        : 'border-gray-200 text-gray-700'
                    }`}
                  >
                    {index + 1}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Open-ended Question Configuration */}
          {question.type === 'open' && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Model Answer (Optional)
              </label>
              <textarea
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
                rows={4}
                value={question.correctAnswer || ''}
                onChange={(e) => onUpdate(question.id, { correctAnswer: e.target.value })}
                placeholder="Enter the expected answer or leave blank for no specific answer..."
              />
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div>Character limit: 1000</div>
              </div>
            </div>
          )}

          {/* Question Footer */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                ID: {question.id}
                {question.meta?.submittedAt && (
                  <span className="ml-3">
                    Submitted: {new Date(question.meta.submittedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onUpdate(question.id, { 
                    meta: { ...question.meta, draft: !question.meta?.draft }
                  })}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    question.meta?.draft
                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {question.meta?.draft ? 'Draft' : 'Mark as Draft'}
                </button>
                
                {/* Submit button in footer for better accessibility */}
                {onSubmitQuestion && !question.meta?.submitted && (
                  <button
                    onClick={handleSubmitQuestion}
                    disabled={isSubmitting || !isQuestionValidForSubmission()}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      isSubmitting
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : !isQuestionValidForSubmission()
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Question'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
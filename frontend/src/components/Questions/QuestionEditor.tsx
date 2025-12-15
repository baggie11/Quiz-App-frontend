import React, { useState } from 'react';
import type { Question } from '../../types';
import { 
  Plus, Trash2, CheckCircle, Circle, 
  Type, MessageSquare, ClipboardList, Star 
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

  return (
    <div 
      className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
      onDragOver={onDragOver}
      onDrop={(e) => onDropChangeType(e, question.id)}
    >
      {/* Question Header */}
      <div 
        className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold">
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
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900">
                {question.text || (
                  <span className="text-gray-400 italic">Untitled question...</span>
                )}
              </h3>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
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
                            className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
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

              {/* Add Option Button (when options exist) */}
              {question.options && question.options.length > 0 && question.options.length < 10 && (
                <button
                  onClick={() => onAddOption(question.id)}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-all text-gray-600 hover:text-indigo-600 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Another Option
                </button>
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
                  className="w-16 p-2 border border-gray-300 rounded-lg text-center"
                />
                <div className="text-sm text-gray-500">to</div>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={question.ratingMax || 5}
                  onChange={(e) => onUpdate(question.id, { ratingMax: parseInt(e.target.value) || 5 })}
                  className="w-16 p-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <div className="text-sm text-gray-500">Max</div>
              </div>
              <div className="flex justify-center gap-2 mt-4">
                {Array.from({ length: question.ratingMax || 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-lg font-medium text-gray-700"
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
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
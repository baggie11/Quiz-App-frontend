import React, { useState } from 'react';
import type { Question } from '../../types';
import { 
  Plus, Trash2, CheckCircle, Circle, Check,
  Type, MessageSquare, ClipboardList, Star, ArrowRight
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
  onNextQuestion?: () => void;
  isSaving?: boolean;
  isDraft?: boolean;
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
  onNextQuestion,
  isSaving = false,
  isDraft = false,
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

  const toggleCorrect = (optionIndex: number) => {
    if (question.type === 'quiz') {
      onUpdate(question.id, {
        correctAnswer: question.correctAnswer === optionIndex ? null : optionIndex
      });
    } else if (question.type === 'multi') {
      const current = question.multiAnswers ?? [];
      const updated = current.includes(optionIndex)
        ? current.filter(i => i !== optionIndex)
        : [...current, optionIndex];
      onUpdate(question.id, { multiAnswers: updated });
    }
  };

  const isCorrect = (idx: number): boolean => {
    if (question.type === 'quiz') return question.correctAnswer === idx;
    if (question.type === 'multi') return (question.multiAnswers ?? []).includes(idx);
    return false;
  };

  const options = question.options ?? [];

  return (
    <div
      className="bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-all border-gray-200"
      onDragOver={onDragOver}
      onDrop={(e) => onDropChangeType(e, question.id)}
    >
      {/* Header */}
      <div
        className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center font-semibold text-sm">
              {index + 1}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
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

                {/* Draft / Saving Indicator */}
                {isDraft && (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded flex items-center gap-1 animate-pulse">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                    Draft • Saving...
                  </span>
                )}

                {isSaving && !isDraft && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded flex items-center gap-1">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </span>
                )}
              </div>

              <h3 className="text-lg font-semibold text-gray-900">
                {question.text?.trim() || <span className="text-gray-400 italic">Untitled question...</span>}
              </h3>
            </div>
          </div>

          <div className="text-gray-400 text-lg font-light">
            {isExpanded ? '▼' : '▶'}
          </div>
        </div>
      </div>

      {/* Body */}
      {isExpanded && (
        <div className="px-6 pb-8 border-t border-gray-100">
          {/* Question Text */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Text <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={question.text || ''}
              onChange={(e) => onUpdate(question.id, { text: e.target.value })}
              placeholder="Enter your question here..."
              className={`w-full p-4 border rounded-xl resize-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                !question.text?.trim() ? 'border-amber-300 bg-amber-50' : 'border-gray-300'
              }`}
            />
          </div>

          {/* Multiple Choice Options */}
          {(question.type === 'quiz' || question.type === 'multi') && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Answer Options
                </label>
                <button
                  onClick={() => onAddOption(question.id)}
                  disabled={options.length >= 10}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Option
                </button>
              </div>

              <div className="space-y-3">
                {options.map((option, idx) => (
                  <div key={idx} className="flex items-center gap-3 group">
                    <button
                      onClick={() => toggleCorrect(idx)}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                        isCorrect(idx)
                          ? question.type === 'quiz' ? 'bg-green-600 text-white' : 'bg-purple-600 text-white'
                          : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                      }`}
                    >
                      {question.type === 'quiz' ? (
                        isCorrect(idx) ? '●' : <Circle className="w-5 h-5" />
                      ) : (
                        isCorrect(idx) ? <Check className="w-5 h-5" /> : <div className="w-5 h-5 border-2 border-gray-400 rounded" />
                      )}
                    </button>

                    <input
                      type="text"
                      value={option}
                      onChange={(e) => onUpdateOption(question.id, idx, e.target.value)}
                      placeholder={`Option ${idx + 1}`}
                      className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                        !option?.trim() ? 'border-amber-300 bg-amber-50' : 'border-gray-300'
                      }`}
                    />

                    {options.length > 2 && (
                      <button
                        onClick={() => onRemoveOption(question.id, idx)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {options.length >= 10 && (
                <p className="text-sm text-amber-700">Maximum 10 options allowed.</p>
              )}
            </div>
          )}

          {/* Rating Scale */}
          {question.type === 'rating' && (
            <div className="mt-6 space-y-6">
              <label className="block text-sm font-medium text-gray-700">Rating Scale</label>
              <div className="flex items-center justify-center gap-8">
                <span className="text-gray-500">1</span>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={question.ratingMax || 5}
                  onChange={(e) => onUpdate(question.id, { ratingMax: Math.max(2, Math.min(10, parseInt(e.target.value) || 5)) })}
                  className="w-20 px-4 py-3 text-center text-lg font-medium border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 border-gray-300"
                />
                <span className="text-gray-500">(Max)</span>
              </div>

              <div className="flex justify-center gap-4 mt-6">
                {Array.from({ length: question.ratingMax || 5 }, (_, i) => (
                  <div
                    key={i}
                    className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center text-lg font-medium text-gray-700"
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Open Ended */}
          {question.type === 'open' && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model Answer <span className="text-gray-500">(Optional – for grading reference)</span>
              </label>
              <textarea
                rows={5}
                value={question.modelAnswer || ''}
                onChange={(e) => onUpdate(question.id, { modelAnswer: e.target.value })}
                placeholder="Optional expected answer for reference or auto-grading..."
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
          )}

          {/* Next Question Button */}
          <div className="mt-10 flex justify-end">
            <button
              onClick={onNextQuestion}
              disabled={isSaving}
              className={`px-8 py-4 rounded-xl font-medium flex items-center gap-3 transition-all shadow-md ${
                isSaving
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  Saving current question...
                </>
              ) : (
                <>
                  Next Question
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionEditor;
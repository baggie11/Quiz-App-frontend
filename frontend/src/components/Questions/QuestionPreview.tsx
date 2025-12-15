import React from 'react';
import { type Question } from '../../types';

interface QuestionPreviewProps {
  isOpen: boolean;
  questions: Question[];
  onClose: () => void;
}

export const QuestionPreview: React.FC<QuestionPreviewProps> = ({
  isOpen,
  questions,
  onClose
}) => {
  if (!isOpen) return null;

  const renderQuestionPreview = (q: Question, index: number) => {
    return (
      <div key={q.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 mb-3">
        <div className="mb-2 font-medium">
          Q{index + 1}. {q.text || <span className="text-gray-400">Untitled</span>}
        </div>
        
        {q.type === 'quiz' || q.type === 'multi' ? (
          q.options?.map((o, idx) => (
            <div key={idx} className="flex items-center gap-3 mb-2">
              <input 
                type={q.type === 'multi' ? "checkbox" : "radio"} 
                disabled 
                className="cursor-not-allowed"
              />
              <span>{o}</span>
              {(q.type === 'quiz' && q.correctAnswer === idx) ||
               (q.type === 'multi' && (q.multiAnswers || []).includes(idx)) ? (
                <span className="ml-2 text-xs text-green-600">Answer</span>
              ) : null}
            </div>
          ))
        ) : q.type === 'rating' ? (
          <div className="flex gap-1 mt-2">
            {Array.from({ length: q.ratingMax || 5 }).map((_, s) => (
              <span key={s} className="text-2xl text-yellow-400">★</span>
            ))}
          </div>
        ) : q.type === 'open' ? (
          <div>
            <textarea 
              className="w-full mt-2 p-2 border rounded-lg bg-white" 
              rows={3} 
              placeholder="Type your answer..."
              disabled
            />
            {q.correctAnswer && (
              <div className="mt-2 text-sm text-green-700 p-2 bg-green-50 rounded">
                <strong>Suggested Answer:</strong> {q.correctAnswer}
              </div>
            )}
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-6 overflow-auto">
      <div className="w-full max-w-4xl bg-white rounded-2xl p-6 border border-gray-200 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Preview Questions</h3>
            <p className="text-sm text-gray-600 mt-1">This is how respondents will see your questions</p>
          </div>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            Close Preview
          </button>
        </div>
        
        <div className="max-h-[70vh] overflow-y-auto pr-2">
          {questions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No questions to preview
            </div>
          ) : (
            questions.map((q, i) => renderQuestionPreview(q, i))
          )}
        </div>
      </div>
    </div>
  );
};
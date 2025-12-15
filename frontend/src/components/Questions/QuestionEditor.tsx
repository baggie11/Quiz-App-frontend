import React from 'react';
import { type QuestionEditorProps } from '../../types';
import { QuestionTypeIcon } from './QuestionType';

export const QuestionEditor: React.FC<QuestionEditorProps> = ({
  question,
  index,
  onUpdate,
  onAddOption,
  onUpdateOption,
  onRemoveOption,
  onDragOver,
  onDropChangeType
}) => {
  const { id, type, text, options = [], ratingMax = 5, correctAnswer, multiAnswers = [] } = question;

  const renderOptions = () => {
    if (type !== 'quiz' && type !== 'multi') return null;

    return (
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3">
        {options.map((opt, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-6 flex justify-center">
              {type === 'quiz' ? (
                <input
                  type="radio"
                  name={`correct_${id}`}
                  checked={correctAnswer === i}
                  onChange={() => onUpdate(id, { correctAnswer: i })}
                  className="cursor-pointer"
                />
              ) : (
                <input
                  type="checkbox"
                  checked={multiAnswers.includes(i)}
                  onChange={(e) => {
                    const set = new Set(multiAnswers);
                    if (e.target.checked) set.add(i);
                    else set.delete(i);
                    onUpdate(id, { multiAnswers: Array.from(set) });
                  }}
                  className="cursor-pointer"
                />
              )}
            </div>
            <input
              value={opt}
              onChange={(e) => onUpdateOption(id, i, e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
              placeholder={`Option ${i + 1}`}
            />
            <button
              onClick={() => onRemoveOption(id, i)}
              className="px-3 py-1 text-red-600 bg-red-50 rounded-lg text-sm hover:bg-red-100 transition"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          onClick={() => onAddOption(id)}
          className="px-4 py-2 mt-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm hover:bg-indigo-100 transition"
        >
          + Add Option
        </button>
      </div>
    );
  };

  const renderRating = () => {
    if (type !== 'rating') return null;

    return (
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex items-center gap-3">
        <label className="text-sm text-gray-700">Max Rating:</label>
        <input
          type="number"
          min={1}
          max={10}
          value={ratingMax}
          onChange={(e) => onUpdate(id, { ratingMax: Number(e.target.value) || 1 })}
          className="w-24 px-3 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
      </div>
    );
  };

  const renderOpenText = () => {
    if (type !== 'open') return null;

    return (
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
        <label className="text-sm font-medium text-gray-700">Suggested Answer (optional)</label>
        <input
          value={typeof correctAnswer === 'string' ? correctAnswer : ''}
          onChange={(e) => onUpdate(id, { correctAnswer: e.target.value })}
          placeholder="Enter model answer..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 mt-2"
        />
      </div>
    );
  };

  return (
    <div
      onDragOver={onDragOver}
      onDrop={(e) => onDropChangeType(e, id)}
      className="bg-white shadow-lg rounded-2xl border border-gray-200 p-6 space-y-6 hover:shadow-xl transition"
    >
      {/* Question Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center">
          <QuestionTypeIcon type={type} size={20} />
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-800">{type.toUpperCase()}</div>
          <div className="text-xs text-gray-400">Q{index + 1}</div>
        </div>
      </div>

      {/* Question Text */}
      <textarea
        value={text}
        onChange={(e) => onUpdate(id, { text: e.target.value })}
        placeholder="Type your question..."
        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 resize-none"
        rows={2}
      />

      {/* Dynamic Content */}
      {renderOptions()}
      {renderRating()}
      {renderOpenText()}

      {/* Meta Controls */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={!!question.meta?.required}
            onChange={(e) => onUpdate(id, { meta: { ...question.meta, required: e.target.checked } })}
            className="cursor-pointer"
          />
          Required
        </label>
        <div className="text-xs text-gray-400">Preview-ready</div>
      </div>
    </div>
  );
};
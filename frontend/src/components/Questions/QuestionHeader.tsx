import React from 'react';
import { Eye, Save } from 'lucide-react';

interface QuestionHeaderProps {
  onPreview: () => void;
  onSaveAll: () => void;
  saving: boolean;
}

export const QuestionHeader: React.FC<QuestionHeaderProps> = ({
  onPreview,
  onSaveAll,
  saving
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Build Questions</h1>
        <p className="text-sm text-gray-600 mt-1">
          Professional question builder for quizzes, surveys, and forms.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onPreview}
          className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-sm flex items-center gap-2 hover:shadow transition"
        >
          <Eye size={16} /> Preview
        </button>
        <button
          onClick={onSaveAll}
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm flex items-center gap-2 hover:opacity-90 transition disabled:opacity-50"
        >
          <Save size={16} /> {saving ? "Saving..." : "Save All"}
        </button>
      </div>
    </div>
  );
};
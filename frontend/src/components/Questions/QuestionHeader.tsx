// components/Questions/QuestionHeader.tsx
interface QuestionHeaderProps {
  onPreview: () => void;
  onSaveAll: () => void;
  saving: boolean;
  questionsCount?: number;
  sessionId?: string;
}

export const QuestionHeader: React.FC<QuestionHeaderProps> = ({
  onPreview,
  onSaveAll,
  saving,
  questionsCount = 0,
  sessionId
}) => {
  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Question Builder</h1>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {sessionId && <span>Session: {sessionId}</span>}
              {sessionId && <div className="w-1 h-1 bg-gray-300 rounded-full"></div>}
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span>Auto-save active</span>
              </div>
            </div>
          </div>
          
          {/* Questions count display */}
          <div className="px-3 py-1 bg-gray-100 rounded-lg">
            <span className="text-sm font-medium text-gray-700">
              {questionsCount} {questionsCount === 1 ? 'Question' : 'Questions'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onPreview}
            className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Preview
          </button>
          
          <button
            onClick={onSaveAll}
            disabled={saving}
            className={`px-3 py-1.5 bg-indigo-600 text-white rounded-lg font-medium text-sm transition-colors flex items-center gap-1.5 ${
              saving ? 'opacity-70 cursor-not-allowed' : 'hover:bg-indigo-700'
            }`}
          >
            {saving ? (
              <>
                <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save All
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
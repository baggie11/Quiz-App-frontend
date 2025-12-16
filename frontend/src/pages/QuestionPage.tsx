import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { QuestionBuilderProps, Question, QType, SaveState } from '../types';
import { QuestionHeader } from '../components/Questions/QuestionHeader';
import { QuestionPalette } from '../components/Questions/QuestionPalette';
import { QuestionEditor } from '../components/Questions/QuestionEditor';
import { QuestionPreview } from '../components/Questions/QuestionPreview';
import { useDebounce } from '../hooks/useDebounce';

// Helper functions
const uid = (p = "q") => `${p}_${Date.now().toString(36)}_${Math.floor(Math.random() * 1000)}`;
const defaultOption = (n = 1) => `Option ${n}`;

// Local storage key
const STORAGE_KEY = (sessionId: string) => `quiz_builder_${sessionId}`;

export const QuestionBuilderPage: React.FC<QuestionBuilderProps> = ({
  sessionId,
  onSave,
  onPreview,
  initialQuestions = [],
  autoSaveInterval = 3000, // Default 3 seconds
}) => {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [paletteOpen, setPaletteOpen] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | QType | "drafts">("all");
  const [saveState, setSaveState] = useState<SaveState>({
    isSaving: false,
    lastSaved: null,
    hasUnsavedChanges: false,
    autoSaveEnabled: true,
    saveError: null,
  });
  
  const previewModalRef = useRef<HTMLDivElement>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);
  
  // Debounced questions for auto-save
  const debouncedQuestions = useDebounce(questions, autoSaveInterval);

  // Load saved state from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY(sessionId));
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.questions && parsed.questions.length > 0) {
          setQuestions(parsed.questions);
          setSaveState(prev => ({
            ...prev,
            lastSaved: parsed.lastSaved || null,
          }));
          console.log('Loaded questions from localStorage');
        }
      } catch (error) {
        console.error('Failed to load saved data:', error);
      }
    } else if (questions.length === 0) {
      // Initialize with starter question only if no saved data and no initial questions
      const starter: Question = {
        id: uid(),
        text: "",
        type: "quiz",
        options: [defaultOption(1), defaultOption(2)],
        ratingMax: 5,
        correctAnswer: null,
        multiAnswers: [],
        meta: {},
      };
      setQuestions([starter]);
    }
  }, [sessionId]);

  // Save to localStorage whenever questions change (debounced)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (questions.length > 0) {
      const saveData = {
        questions,
        lastSaved: new Date().toISOString(),
        version: 1,
      };
      
      try {
        localStorage.setItem(STORAGE_KEY(sessionId), JSON.stringify(saveData));
        console.log('Auto-saved to localStorage');
      } catch (error) {
        console.error('Failed to auto-save:', error);
      }
    }
  }, [debouncedQuestions, sessionId]);

  // Auto-save to server when there are unsaved changes
  useEffect(() => {
    if (!saveState.autoSaveEnabled || !saveState.hasUnsavedChanges || isInitialMount.current) {
      return;
    }

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      handleAutoSave();
    }, autoSaveInterval);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [questions, saveState.hasUnsavedChanges, saveState.autoSaveEnabled, autoSaveInterval]);

  // Mark changes as unsaved when questions are modified
  const markUnsavedChanges = useCallback(() => {
    if (!saveState.hasUnsavedChanges) {
      setSaveState(prev => ({ ...prev, hasUnsavedChanges: true }));
    }
  }, [saveState.hasUnsavedChanges]);

  // Auto-save function
  const handleAutoSave = useCallback(async () => {
    if (!saveState.hasUnsavedChanges || saveState.isSaving) {
      return;
    }

    setSaveState(prev => ({ ...prev, isSaving: true, saveError: null }));
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3000/api/session/${sessionId}/questions/auto-save`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          questions,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Auto-save failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      setSaveState(prev => ({
        ...prev,
        isSaving: false,
        hasUnsavedChanges: false,
        lastSaved: result.savedAt || new Date().toISOString(),
      }));
      
      console.log('Auto-save successful');
    } catch (error) {
      console.error('Auto-save error:', error);
      setSaveState(prev => ({
        ...prev,
        isSaving: false,
        saveError: error instanceof Error ? error.message : 'Auto-save failed',
      }));
    }
  }, [questions, sessionId, saveState.hasUnsavedChanges, saveState.isSaving]);

  // Manual save function
  const handleSaveAll = useCallback(async () => {
    if (saveState.isSaving) {
      return;
    }

    setSaveState(prev => ({ ...prev, isSaving: true, saveError: null }));
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3000/api/session/${sessionId}/questions/save`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          questions,
          forceSave: true,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Save failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Call external onSave callback if provided
      if (onSave) {
        onSave(questions);
      }
      
      setSaveState(prev => ({
        ...prev,
        isSaving: false,
        hasUnsavedChanges: false,
        lastSaved: result.savedAt || new Date().toISOString(),
      }));
      
      // Show success message
      alert('All changes saved successfully!');
      console.log('Manual save successful');
      
    } catch (error) {
      console.error('Save error:', error);
      setSaveState(prev => ({
        ...prev,
        isSaving: false,
        saveError: error instanceof Error ? error.message : 'Save failed',
      }));
      
      // Show error message
      alert('Failed to save changes. Please try again.');
    }
  }, [questions, sessionId, saveState.isSaving, onSave]);

  // Export questions function
  const handleExportQuestions = useCallback(() => {
    const dataStr = JSON.stringify(questions, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `quiz-questions-${sessionId}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [questions, sessionId]);

  // Import questions function
  const handleImportQuestions = useCallback((importedQuestions: Question[]) => {
    if (window.confirm('Import questions? This will add to your current questions.')) {
      const mergedQuestions = [...questions, ...importedQuestions.map(q => ({
        ...q,
        id: q.id || uid(), // Ensure all questions have IDs
      }))];
      
      setQuestions(mergedQuestions);
      setSaveState(prev => ({ ...prev, hasUnsavedChanges: true }));
      alert(`${importedQuestions.length} questions imported successfully.`);
    }
  }, [questions]);

  // Question CRUD operations (updated to mark unsaved changes)
  const addQuestion = useCallback((type: QType) => {
    const q: Question = {
      id: uid(),
      text: "",
      type,
      options: type === "quiz" || type === "multi" ? [defaultOption(1), defaultOption(2)] : undefined,
      ratingMax: type === "rating" ? 5 : undefined,
      correctAnswer: type === "quiz" ? null : undefined,
      multiAnswers: type === "multi" ? [] : undefined,
      meta: {},
    };
    setQuestions(prev => [...prev, q]);
    markUnsavedChanges();
  }, [markUnsavedChanges]);

  const removeQuestion = useCallback((id: string) => {
    if (questions.length <= 1) {
      alert('You must have at least one question.');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this question?')) {
      setQuestions(prev => prev.filter(q => q.id !== id));
      markUnsavedChanges();
    }
  }, [questions.length, markUnsavedChanges]);

  const updateQuestion = useCallback((id: string, patch: Partial<Question>) => {
    setQuestions(prev => prev.map(q => (q.id === id ? { ...q, ...patch } : q)));
    markUnsavedChanges();
  }, [markUnsavedChanges]);

  const addOption = useCallback((questionId: string) => {
    setQuestions(prev =>
      prev.map(q => {
        if (q.id !== questionId) return q;
        const opts = [...(q.options || [])];
        opts.push(defaultOption(opts.length + 1));
        return { ...q, options: opts };
      })
    );
    markUnsavedChanges();
  }, [markUnsavedChanges]);

  const updateOption = useCallback((questionId: string, idx: number, value: string) => {
    setQuestions(prev =>
      prev.map(q => {
        if (q.id !== questionId) return q;
        const opts = [...(q.options || [])];
        opts[idx] = value;
        return { ...q, options: opts };
      })
    );
    markUnsavedChanges();
  }, [markUnsavedChanges]);

  const removeOption = useCallback((questionId: string, idx: number) => {
    setQuestions(prev =>
      prev.map(q => {
        if (q.id !== questionId) return q;
        const opts = [...(q.options || [])];
        opts.splice(idx, 1);
        
        let ca = typeof q.correctAnswer === "number" ? q.correctAnswer : null;
        if (ca !== null) {
          if (ca === idx) ca = null;
          else if (ca > idx) ca -= 1;
        }
        
        const ma = (q.multiAnswers || []).filter((i) => i !== idx).map((i) => (i > idx ? i - 1 : i));
        
        return { ...q, options: opts, correctAnswer: ca, multiAnswers: ma };
      })
    );
    markUnsavedChanges();
  }, [markUnsavedChanges]);

  // Drag and drop handlers
  const onPaletteDragStart = (e: React.DragEvent, t: QType) => {
    e.dataTransfer.setData("application/qtype", t);
    e.dataTransfer.effectAllowed = "copy";
  };

  const onDropChangeType = useCallback((e: React.DragEvent, questionId: string) => {
    e.preventDefault();
    const t = (e.dataTransfer.getData("application/qtype") || "") as QType;
    if (!t) return;

    let updateData: Partial<Question> = {};
    
    if (t === "quiz") {
      updateData = {
        type: "quiz",
        options: [defaultOption(1), defaultOption(2)],
        ratingMax: undefined,
        correctAnswer: null,
        multiAnswers: undefined,
      };
    } else if (t === "multi") {
      updateData = {
        type: "multi",
        options: [defaultOption(1), defaultOption(2)],
        ratingMax: undefined,
        correctAnswer: undefined,
        multiAnswers: [],
      };
    } else if (t === "rating") {
      updateData = { 
        type: "rating", 
        options: undefined, 
        ratingMax: 5, 
        correctAnswer: undefined, 
        multiAnswers: undefined 
      };
    } else if (t === "open") {
      updateData = { 
        type: "open", 
        options: undefined, 
        ratingMax: undefined, 
        correctAnswer: null,
        multiAnswers: undefined 
      };
    }

    updateQuestion(questionId, updateData);
  }, [updateQuestion]);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Preview handler
  const handlePreview = useCallback(() => {
    if (onPreview) {
      onPreview(questions);
    }
    setPreviewOpen(true);
  }, [questions, onPreview]);

  // Toggle auto-save
  const toggleAutoSave = useCallback(() => {
    setSaveState(prev => ({
      ...prev,
      autoSaveEnabled: !prev.autoSaveEnabled,
    }));
    
    if (!saveState.autoSaveEnabled && saveState.hasUnsavedChanges) {
      handleAutoSave();
    }
  }, [saveState.autoSaveEnabled, saveState.hasUnsavedChanges, handleAutoSave]);

  // Filtered questions
  const filteredQuestions = useMemo(() => 
    questions.filter((q) => 
      filter === "all" ? true : 
      filter === "drafts" ? !!q.meta?.draft : 
      q.type === filter
    ), [questions, filter]
  );

  // Calculate unsaved questions count
  const unsavedQuestionsCount = useMemo(() => 
    questions.filter(q => q.meta?.draft).length, 
    [questions]
  );

  return (
    <div className="relative">
      {/* Save Indicator */}
      
      {/* Fixed Header Container */}
      <div className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="w-[800px] mx-auto px-0">
          <QuestionHeader 
            onPreview={handlePreview}
            onSaveAll={handleSaveAll}
            saving={saveState.isSaving}
            questionsCount={questions.length}
            sessionId={sessionId}
            unsavedCount={unsavedQuestionsCount}
            lastSaved={saveState.lastSaved}
            onExport={handleExportQuestions}
            onImport={() => {
              // This would trigger a file input in a real implementation
              const sampleQuestions: Question[] = [
                {
                  id: uid(),
                  text: "Sample imported question",
                  type: "quiz",
                  options: ["Option A", "Option B", "Option C"],
                  correctAnswer: 1,
                  meta: {},
                },
              ];
              handleImportQuestions(sampleQuestions);
            }}
          />
          
          {/* Filter Tabs */}
          <div className="px-4 pb-3">
            <div className="flex gap-2 flex-wrap">
              {["all", "quiz", "multi", "rating", "open", "drafts"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filter === f 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                  {f === "drafts" && unsavedQuestionsCount > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                      {unsavedQuestionsCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6">
          {/* Left Sidebar - Palette */}
          <div className="lg:w-64">
            <QuestionPalette
              isOpen={paletteOpen}
              onToggle={() => setPaletteOpen(!paletteOpen)}
              onDragStart={onPaletteDragStart}
              onAddQuestion={addQuestion}
            />
          </div>

          {/* Main Content - Questions Canvas */}
          <main className="flex-1 space-y-5">
            {filteredQuestions.length === 0 ? (
              <div className="p-8 bg-white rounded-2xl border border-gray-100 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
                <p className="text-gray-500 mb-4">
                  {filter === "all" 
                    ? "Add your first question from the palette or click below." 
                    : `No ${filter} questions. Try a different filter or add a new question.`}
                </p>
                <button
                  onClick={() => addQuestion("quiz")}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
                >
                  + Add Question
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {filteredQuestions.map((q, idx) => (
                  <div key={q.id} className="relative group">
                    <QuestionEditor
                      question={q}
                      index={idx}
                      onUpdate={updateQuestion}
                      onAddOption={addOption}
                      onUpdateOption={updateOption}
                      onRemoveOption={removeOption}
                      onDragOver={onDragOver}
                      onDropChangeType={onDropChangeType}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Mobile Floating Add Button */}
            <div className="lg:hidden fixed bottom-6 right-6 z-30">
              <button
                onClick={() => addQuestion("quiz")}
                className="w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            {/* Desktop Add Question Button */}
            <button
              onClick={() => addQuestion("quiz")}
              className="hidden lg:block w-full p-6 border-2 border-dashed border-gray-300 rounded-2xl hover:border-indigo-400 hover:bg-indigo-50 transition-all text-gray-600 hover:text-indigo-600"
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add New Question
              </div>
            </button>
          </main>
        </div>
      </div>

      {/* Preview Modal */}
      <QuestionPreview
        isOpen={previewOpen}
        questions={questions}
        onClose={() => setPreviewOpen(false)}
        ref={previewModalRef}
      />

      {/* Save All Floating Button */}
      {saveState.hasUnsavedChanges && (
        <button
          onClick={handleSaveAll}
          disabled={saveState.isSaving}
          className={`fixed bottom-8 right-8 px-6 py-3 rounded-full shadow-lg font-medium flex items-center gap-2 transition-all z-50 ${
            saveState.isSaving
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          } text-white`}
        >
          {saveState.isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Saving...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Save All Changes
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default QuestionBuilderPage;
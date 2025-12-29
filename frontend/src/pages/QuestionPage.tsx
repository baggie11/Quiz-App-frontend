import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { QuestionBuilderProps, Question, QType, SaveState } from '../types';
import { QuestionHeader } from '../components/Questions/QuestionHeader';
import { QuestionPalette } from '../components/Questions/QuestionPalette';
import { QuestionEditor } from '../components/Questions/QuestionEditor';
import { QuestionPreview } from '../components/Questions/QuestionPreview';
/*import { useDebounce } from '../hooks/useDebounce';*/

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
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState<boolean>(false);
  const [submitQuestionStatus, setSubmitQuestionStatus] = useState<{
    isSuccess: boolean;
    message: string;
  } | null>(null);
  
  const previewModalRef = useRef<HTMLDivElement>(null);
  const autoSaveTimerRef = useRef<number | null>(null);
  const isInitialMount = useRef(true);
  
  // Get current question
  const currentQuestion = useMemo(() => 
    questions[currentQuestionIndex], 
    [questions, currentQuestionIndex]
  );
  
  // Debounced questions for auto-save
  /*const debouncedQuestions = useDebounce(questions, autoSaveInterval);

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
  }, [debouncedQuestions, sessionId]);*/

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

  // Function to submit current question to backend
  const handleSubmitQuestion = useCallback(async () => {
    if (!currentQuestion) return;
    
    setIsSubmittingQuestion(true);
    setSubmitQuestionStatus(null);
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3000/api/session/${sessionId}/questions/submit`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          question: currentQuestion,
          questionIndex: currentQuestionIndex,
          totalQuestions: questions.length,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Question submission failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Mark the question as submitted in the local state
      setQuestions(prev => prev.map((q, idx) => 
        idx === currentQuestionIndex 
          ? { 
              ...q, 
              meta: { 
                ...q.meta, 
                submitted: true,
                submittedAt: new Date().toISOString(),
                submissionId: result.submissionId 
              } 
            } 
          : q
      ));
      
      // Update save state
      setSaveState(prev => ({ ...prev, hasUnsavedChanges: true }));
      
      // Show success status
      setSubmitQuestionStatus({
        isSuccess: true,
        message: `Question ${currentQuestionIndex + 1} submitted successfully!`
      });
      
      console.log('Question submitted successfully:', result);
      
      // Clear status message after 3 seconds
      setTimeout(() => setSubmitQuestionStatus(null), 3000);
      
    } catch (error) {
      console.error('Question submission error:', error);
      setSubmitQuestionStatus({
        isSuccess: false,
        message: error instanceof Error ? error.message : 'Failed to submit question'
      });
    } finally {
      setIsSubmittingQuestion(false);
    }
  }, [currentQuestion, currentQuestionIndex, sessionId, questions.length]);

  // Function to handle "Next Question" button click
  const handleNextQuestion = useCallback(async () => {
    // First submit the current question if it hasn't been submitted
    if (currentQuestion && !currentQuestion.meta?.submitted) {
      await handleSubmitQuestion();
    }
    
    // Then move to the next question
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // If this is the last question, add a new one
      const newQuestion: Question = {
        id: uid(),
        text: "",
        type: "quiz",
        options: [defaultOption(1), defaultOption(2)],
        ratingMax: 5,
        correctAnswer: null,
        multiAnswers: [],
        meta: {},
      };
      setQuestions(prev => [...prev, newQuestion]);
      setCurrentQuestionIndex(questions.length);
    }
  }, [currentQuestion, currentQuestionIndex, questions.length, handleSubmitQuestion]);

  // Function to go to previous question
  const handlePrevQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  }, [currentQuestionIndex]);

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

  // Calculate submitted questions count
  const submittedQuestionsCount = useMemo(() => 
    questions.filter(q => q.meta?.submitted).length, 
    [questions]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ===== Top Header (ONLY branding + save status) ===== */}
      <div className="sticky top-0 z-40 bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <QuestionHeader
            onPreview={handlePreview}
            onSaveAll={handleSaveAll}
            saving={saveState.isSaving}
            questionsCount={questions.length}
            unsavedCount={unsavedQuestionsCount}
            lastSaved={saveState.lastSaved}
            autoSaveEnabled={saveState.autoSaveEnabled}
            onToggleAutoSave={toggleAutoSave}
            hasUnsavedChanges={saveState.hasUnsavedChanges}
            saveError={saveState.saveError}
            sessionId={sessionId}
          />
        </div>
      </div>

      {/* ===== CONTROL CARD (Stats + Preview + Filters) ===== */}
      <div className="max-w-7xl mx-auto px-6 mt-4">
        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-2">
          
          {/* Top Row: Stats + Actions */}
          <div className="flex flex-wrap items-center gap-5">
            <div className="flex items-center gap-5">
              {/*<div className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm font-medium">
                {questions.length} Questions
              </div>*/}

              {unsavedQuestionsCount > 0 && (
                <div className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium">
                  {unsavedQuestionsCount} Drafts
                </div>
              )}
              
              {submittedQuestionsCount > 0 && (
                <div className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                  {submittedQuestionsCount} Submitted
                </div>
              )}
            </div>

            {/*<div className="flex items-center gap-2">
              <button
                onClick={handlePreview}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm font-medium"
              >
                Preview
              </button>

              <button
                onClick={handleSaveAll}
                disabled={!saveState.hasUnsavedChanges || saveState.isSaving}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  saveState.hasUnsavedChanges
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-green-100 text-green-700 cursor-not-allowed"
                }`}
              >
                {saveState.isSaving ? "Saving..." : "Save"}
              </button>
            </div> */}
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            {["all", "quiz", "multi", "rating", "open", "drafts"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === f
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ===== QUESTION NAVIGATION BAR ===== */}
      {questions.length > 0 && filter === "all" && (
        <div className="max-w-7xl mx-auto px-6 mt-4">
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={handlePrevQuestion}
                  disabled={currentQuestionIndex === 0}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    currentQuestionIndex === 0
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  ← Previous
                </button>
                
                <div className="text-sm font-medium">
                  Question {currentQuestionIndex + 1} of {questions.length}
                  {currentQuestion?.meta?.submitted && (
                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      ✓ Submitted
                    </span>
                  )}
                </div>
                
                <button
                  onClick={handleNextQuestion}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
                >
                  {currentQuestionIndex < questions.length - 1 ? "Next Question →" : "Add New Question →"}
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSubmitQuestion}
                  disabled={!currentQuestion || currentQuestion.meta?.submitted || isSubmittingQuestion}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    currentQuestion?.meta?.submitted || !currentQuestion
                      ? "bg-green-100 text-green-700 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  {isSubmittingQuestion ? "Submitting..." : 
                   currentQuestion?.meta?.submitted ? "✓ Submitted" : "Submit This Question"}
                </button>
                
                {/* Submit status message */}
                {submitQuestionStatus && (
                  <div className={`px-3 py-2 rounded-lg text-sm ${
                    submitQuestionStatus.isSuccess 
                      ? "bg-green-50 text-green-700" 
                      : "bg-red-50 text-red-700"
                  }`}>
                    {submitQuestionStatus.message}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== MAIN BUILDER AREA ===== */}
      <div className="max-w-7xl mx-auto px-6 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          
          {/* Palette */}
          <aside className="sticky top-32 self-start">
            <QuestionPalette
              isOpen={paletteOpen}
              onToggle={() => setPaletteOpen(!paletteOpen)}
              onDragStart={onPaletteDragStart}
              onAddQuestion={addQuestion}
            />
          </aside>

          {/* Question Canvas */}
          <main className="flex-1 overflow-y-auto p-4 space-y-5">
            {filteredQuestions.length === 0 ? (
              <div className="bg-white border border-dashed rounded-2xl p-10 text-center">
                <h3 className="text-lg font-semibold">No questions</h3>
                <p className="text-gray-500 mt-2">
                  Add a question from the palette
                </p>
              </div>
            ) : (
              filteredQuestions.map((q, idx) => (
                <QuestionEditor
                  key={q.id}
                  question={q}
                  index={idx}
                  onUpdate={updateQuestion}
                  onAddOption={addOption}
                  onUpdateOption={updateOption}
                  onRemoveOption={()=>removeOption}
                  onDragOver={onDragOver}
                  onDropChangeType={onDropChangeType}
                  isCurrent={filter === "all" && idx === currentQuestionIndex}
                />
              ))
            )}

            {/* Desktop Add */}
            {filter==="all"&&(
            <button
              onClick={() => addQuestion("quiz")}
              className="hidden lg:block w-full py-6 border-2 border-dashed rounded-2xl hover:bg-gray-50"
            >
              + Add Question
            </button>)}
          </main>
        </div>
      </div>

      {/* Preview */}
      <QuestionPreview
        isOpen={previewOpen}
        questions={questions}
        onClose={() => setPreviewOpen(false)}
      />
    </div>
  );
};

export default QuestionBuilderPage;
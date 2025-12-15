import React, { useState, useEffect, useRef } from 'react';
import type { QuestionBuilderProps, Question, QType } from '../types';
import { QuestionHeader } from '../components/Questions/QuestionHeader';
import { QuestionPalette } from '../components/Questions/QuestionPalette';
import { QuestionEditor } from '../components/Questions/QuestionEditor';
import { QuestionPreview } from '../components/Questions/QuestionPreview';

// Helper functions
const uid = (p = "q") => `${p}_${Date.now().toString(36)}_${Math.floor(Math.random() * 1000)}`;
const defaultOption = (n = 1) => `Option ${n}`;

export const QuestionBuilderPage: React.FC<QuestionBuilderProps> = ({
  sessionId,
  onSave,
  onPreview
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [paletteOpen, setPaletteOpen] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | QType | "drafts">("all");
  const [saving, setSaving] = useState(false);
  const previewModalRef = useRef<HTMLDivElement>(null);

  // Initialize with starter question
  useEffect(() => {
    if (questions.length === 0) {
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
  }, []);

  // Focus preview modal when it opens
  useEffect(() => {
    if (previewOpen && previewModalRef.current) {
      // Small delay to ensure modal is rendered
      setTimeout(() => {
        previewModalRef.current?.focus();
      }, 50);
    }
  }, [previewOpen]);

  // Question CRUD operations
  const addQuestion = (type: QType) => {
  const q: Question = {
    id: uid(),
    text: "",
    type,
    options: type === "quiz" || type === "multi" ? [defaultOption(1), defaultOption(2)] : undefined,
    ratingMax: type === "rating" ? 5 : undefined,
    correctAnswer: type === "quiz" ? null : undefined, // Ensure correctAnswer is null for quiz
    multiAnswers: type === "multi" ? [] : undefined,   // Ensure multiAnswers is [] for multi
    meta: {},
  };
  setQuestions((p) => [...p, q]);
};

  const removeQuestion = (id: string) => {
    setQuestions((p) => p.filter((x) => x.id !== id));
  };

  const updateQuestion = (id: string, patch: Partial<Question>) => {
    setQuestions((p) => p.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  };

  const addOption = (questionId: string) => {
    setQuestions((p) =>
      p.map((q) => {
        if (q.id !== questionId) return q;
        const opts = [...(q.options || [])];
        opts.push(defaultOption(opts.length + 1));
        return { ...q, options: opts };
      })
    );
  };

  const updateOption = (questionId: string, idx: number, value: string) => {
    setQuestions((p) =>
      p.map((q) => {
        if (q.id !== questionId) return q;
        const opts = [...(q.options || [])];
        opts[idx] = value;
        return { ...q, options: opts };
      })
    );
  };

  const removeOption = (questionId: string, idx: number) => {
    setQuestions((p) =>
      p.map((q) => {
        if (q.id !== questionId) return q;
        const opts = [...(q.options || [])];
        opts.splice(idx, 1);
        
        // Update correctAnswer for quiz questions
        let ca = typeof q.correctAnswer === "number" ? q.correctAnswer : null;
        if (ca !== null) {
          if (ca === idx) ca = null;
          else if (ca > idx) ca -= 1;
        }
        
        // Update multiAnswers for multi questions
        const ma = (q.multiAnswers || []).filter((i) => i !== idx).map((i) => (i > idx ? i - 1 : i));
        
        return { ...q, options: opts, correctAnswer: ca, multiAnswers: ma };
      })
    );
  };

  // Drag and drop handlers
  const onPaletteDragStart = (e: React.DragEvent, t: QType) => {
    e.dataTransfer.setData("application/qtype", t);
    e.dataTransfer.effectAllowed = "copy";
  };

  const onDropChangeType = (e: React.DragEvent, questionId: string) => {
  e.preventDefault();
  const t = (e.dataTransfer.getData("application/qtype") || "") as QType;
  if (!t) return;

  if (t === "quiz") {
    updateQuestion(questionId, {
      type: "quiz",
      options: [defaultOption(1), defaultOption(2)],
      ratingMax: undefined,
      correctAnswer: null,  // Reset correct answer
      multiAnswers: undefined,
    });
  } else if (t === "multi") {
    updateQuestion(questionId, {
      type: "multi",
      options: [defaultOption(1), defaultOption(2)],
      ratingMax: undefined,
      correctAnswer: undefined,
      multiAnswers: [],  // Reset multi answers to empty array
    });
  } else if (t === "rating") {
    updateQuestion(questionId, { 
      type: "rating", 
      options: undefined, 
      ratingMax: 5, 
      correctAnswer: undefined, 
      multiAnswers: undefined 
    });
  } else if (t === "open") {
    updateQuestion(questionId, { 
      type: "open", 
      options: undefined, 
      ratingMax: undefined, 
      correctAnswer: null, // Allow model answer for open questions
      multiAnswers: undefined 
    });
  }
};
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Save and preview handlers
  const handleSaveAll = async () => {
    if (onSave) onSave(questions);
    
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:3000/api/session/${sessionId}/questions`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ questions }),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    if (onPreview) onPreview(questions);
    setPreviewOpen(true);
  };

  const filteredQuestions = questions.filter((q) => 
    filter === "all" ? true : 
    filter === "drafts" ? !!q.meta?.draft : 
    q.type === filter
  );

  return (
    <div className="relative">
      {/* Fixed Header Container */}
      <div className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4">
          <QuestionHeader 
            onPreview={handlePreview}
            onSaveAll={handleSaveAll}
            saving={saving}
            questionsCount={questions.length}
            sessionId={sessionId}
          />
          
          {/* Filter Tabs - Inside the sticky container */}
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
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Pushed down for sticky header */}
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
                    <button
                      onClick={() => removeQuestion(q.id)}
                      className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 p-1.5 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-all duration-200 shadow-sm"
                      title="Delete question"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
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

      {/* Preview Modal - with ref for focus management */}
      <QuestionPreview
        isOpen={previewOpen}
        questions={questions}
        onClose={() => setPreviewOpen(false)}
        ref={previewModalRef}
      />
    </div>
  );
};

export default QuestionBuilderPage;
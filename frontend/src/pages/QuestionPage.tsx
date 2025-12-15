import React, { useState, useEffect } from 'react';
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

  // Question CRUD operations
  const addQuestion = (type: QType) => {
    const q: Question = {
      id: uid(),
      text: "",
      type,
      options: type === "quiz" || type === "multi" ? [defaultOption(1), defaultOption(2)] : undefined,
      ratingMax: type === "rating" ? 5 : undefined,
      correctAnswer: null,
      multiAnswers: type === "multi" ? [] : undefined,
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
        correctAnswer: null,
        multiAnswers: [],
      });
    } else if (t === "multi") {
      updateQuestion(questionId, {
        type: "multi",
        options: [defaultOption(1), defaultOption(2)],
        ratingMax: undefined,
        correctAnswer: null,
        multiAnswers: [],
      });
    } else if (t === "rating") {
      updateQuestion(questionId, { 
        type: "rating", 
        options: undefined, 
        ratingMax: 5, 
        correctAnswer: null, 
        multiAnswers: undefined 
      });
    } else if (t === "open") {
      updateQuestion(questionId, { 
        type: "open", 
        options: undefined, 
        ratingMax: undefined, 
        correctAnswer: null, 
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
    <div className="max-w-6xl mx-auto py-6 px-4">
      <QuestionHeader 
        onPreview={handlePreview}
        onSaveAll={handleSaveAll}
        saving={saving}
      />

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
          {/* Filter Tabs */}
          <div className="flex gap-2 mb-4">
            {["all", "quiz", "multi", "rating", "open", "drafts"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-3 py-1 rounded-lg text-sm ${
                  filter === f 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {filteredQuestions.length === 0 ? (
            <div className="p-6 bg-white rounded-2xl border border-gray-100 text-center text-gray-500">
              No questions — add one from the palette or click "Add Quiz".
            </div>
          ) : (
            filteredQuestions.map((q, idx) => (
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
                  className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition"
                >
                  ×
                </button>
              </div>
            ))
          )}

          {/* Add Question Button */}
          <button
            onClick={() => addQuestion("quiz")}
            className="w-full p-6 border-2 border-dashed border-gray-300 rounded-2xl hover:border-indigo-400 hover:bg-indigo-50 transition text-gray-600 hover:text-indigo-600"
          >
            + Add New Question
          </button>
        </main>
      </div>

      {/* Preview Modal */}
      <QuestionPreview
        isOpen={previewOpen}
        questions={questions}
        onClose={() => setPreviewOpen(false)}
      />
    </div>
  );
};

export default QuestionBuilderPage;
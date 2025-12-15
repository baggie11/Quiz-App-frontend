import React from 'react';
import { ChevronUp, ChevronDown, PlusCircle, ListChecks, List, Star, MessageSquare } from 'lucide-react';
import { type QType } from '../../types';

const PALETTE_ITEMS = [
  { id: "quiz", label: "Single Choice", type: "quiz" as QType, icon: <ListChecks size={16} /> },
  { id: "multi", label: "Multiple Choice", type: "multi" as QType, icon: <List size={16} /> },
  { id: "rating", label: "Rating", type: "rating" as QType, icon: <Star size={16} /> },
  { id: "open", label: "Open Text", type: "open" as QType, icon: <MessageSquare size={16} /> },
] as const;

interface QuestionPaletteProps {
  isOpen: boolean;
  onToggle: () => void;
  onDragStart: (e: React.DragEvent, type: QType) => void;
  onAddQuestion: (type: QType) => void;
}

export const QuestionPalette: React.FC<QuestionPaletteProps> = ({
  isOpen,
  onToggle,
  onDragStart,
  onAddQuestion
}) => {
  return (
    <div className="sticky top-24">
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-100 p-4 space-y-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Question Types</h3>
          <button 
            onClick={onToggle} 
            className="p-1 rounded-md hover:bg-gray-100 transition"
          >
            {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
        
        {isOpen && (
          <div className="space-y-3">
            {PALETTE_ITEMS.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => onDragStart(e, item.type)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white border border-gray-100 hover:shadow-lg cursor-grab transition"
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-800">{item.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <button
          onClick={() => onAddQuestion("quiz")}
          className="w-full px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white flex items-center justify-center gap-2 hover:opacity-90 transition"
        >
          <PlusCircle size={16} /> Add Quiz
        </button>
      </div>
    </div>
  );
};
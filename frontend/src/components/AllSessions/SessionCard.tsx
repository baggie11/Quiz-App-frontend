// components/AllSessions/SessionCard.tsx
import React from 'react';
import { type Session } from '../../types';
import { Calendar, Edit, ArrowRight } from 'lucide-react';

interface SessionCardProps {
  session: Session;
  getSessionStatus: (session: Session) => {
    text: string;
    color: string;
    icon: string;
  };
}

const SessionCard: React.FC<SessionCardProps> = ({ session, getSessionStatus }) => {
  const status = getSessionStatus(session);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-[#2563eb] transition">
            {session.title || 'Untitled Session'}
          </h3>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
            {status.icon && <span className="mr-1">{status.icon}</span>}
            {status.text}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {session.draft && (
            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">Draft</span>
          )}
          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#2563eb] group-hover:translate-x-1 transition" />
        </div>
      </div>

      {/* Session Details */}
      <div className="space-y-3 mb-4">
        {session.start_date && (
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
            <span className="font-medium">Starts:</span>
            <span className="ml-1">{formatDate(session.start_date)}</span>
          </div>
        )}
        
        {session.end_date && (
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
            <span className="font-medium">Ends:</span>
            <span className="ml-1">{formatDate(session.end_date)}</span>
          </div>
        )}
        
       
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="text-sm text-gray-500">
          ID: <span className="font-mono text-gray-700">{session.id.substring(0, 8)}...</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-600">
          <Edit className="w-4 h-4 mr-1" />
          <span>Edit Questions</span>
        </div>
      </div>
    </div>
  );
};

export default SessionCard;
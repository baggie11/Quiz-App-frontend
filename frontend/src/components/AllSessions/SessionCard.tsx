import React from 'react';
import { Brain } from 'lucide-react';
import { type Session, type SessionStatus } from '../../types';

interface SessionCardProps {
  session: Session;
  getSessionStatus: (session: Session) => SessionStatus;
}

const SessionCard: React.FC<SessionCardProps> = ({ session, getSessionStatus }) => {
  const status = getSessionStatus(session);

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="group bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      {/* Status Header */}
      <div className={`px-4 py-3 ${status.color.replace('text-', '')} border-b border-gray-100`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-semibold">{status.icon} {status.text}</span>
          </div>
          {session.draft && (
            <span className="text-xs font-medium px-2 py-1 bg-white/80 rounded-full">
              Draft Mode
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5">
        {/* Session Title */}
        <div className="mb-6">
          <div className="flex items-start mb-3">
            <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg mr-3">
              <Brain className="text-[#2563eb]" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#2563eb] transition-colors">
                {session.title}
              </h3>
              <p className="text-xs text-gray-500 mt-1">ID: {session.id.slice(0, 8)}...</p>
            </div>
          </div>
        </div>

        {/* Time Details */}
        <div className="space-y-4 mb-6">
          <div className="flex items-start">
            <div className="p-2 bg-blue-50 rounded-lg mr-3">
              <svg className="w-4 h-4 text-[#2563eb]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-sm text-[#2563eb] font-medium">Start Time</div>
              <div className="text-gray-800 font-semibold">
                {formatDateTime(session.start_date)}
              </div>
            </div>
          </div>

          <div className="flex items-start">
            <div className="p-2 bg-indigo-50 rounded-lg mr-3">
              <svg className="w-4 h-4 text-[#3b82f6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <div className="text-sm text-[#3b82f6] font-medium">End Time</div>
              <div className="text-gray-800 font-semibold">
                {formatDateTime(session.end_date)}
              </div>
            </div>
          </div>
        </div>

        {/* Duration */}
        {session.scheduled_start && session.ended_at && (
          <div className="mb-6 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Duration:</span>
              <span className="text-sm font-bold text-gray-900">
                {Math.round((new Date(session.ended_at).getTime() - new Date(session.scheduled_start).getTime()) / (1000 * 60 * 60))} hours
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="pt-4 border-t border-gray-100 flex space-x-2">
          <button className="flex-1 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#2563eb] to-[#3b82f6] hover:from-[#1d4ed8] hover:to-[#2563eb] rounded-lg transition-all">
            View Details
          </button>
          <button className="px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-[#2563eb] hover:bg-blue-50 rounded-lg transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionCard;
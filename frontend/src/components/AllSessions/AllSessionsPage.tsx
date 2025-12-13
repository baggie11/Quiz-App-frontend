import React, { useState, useEffect } from 'react';
import { type Session } from '../../types';
import SessionCard from './SessionCard';

import LoadingSpinner from '../Shared/LoadingSpinner';

interface AllSessionsPageProps {
  sessions: Session[];
  setSessions: React.Dispatch<React.SetStateAction<Session[]>>;
}

const AllSessionsPage: React.FC<AllSessionsPageProps> = ({ sessions, setSessions }) => {
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3000/api/session`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const json = await response.json();

        if (response.ok && json.success) {
          setSessions(json.sessions);
        } else {
          console.error("Failed to fetch sessions:", json.message);
        }
      } catch (err) {
        console.error("Error fetching sessions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, [setSessions]);

  const getSessionStatus = (session: Session) => {
    const now = new Date();
    const start = session.scheduled_start ? new Date(session.scheduled_start) : null;
    const end = session.ended_at ? new Date(session.ended_at) : null;
    
    if (session.draft) {
      return { text: 'Draft', color: 'bg-blue-100 text-blue-800', icon: '📝' };
    }
    if (!start) {
      return { text: 'Not Scheduled', color: 'bg-gray-100 text-gray-800', icon: '⏳' };
    }
    if (end && now > end) {
      return { text: 'Completed', color: 'bg-emerald-100 text-emerald-800', icon: '✅' };
    }
    if (now >= start && (!end || now <= end)) {
      return { text: 'Live Now', color: 'bg-red-100 text-red-600', icon: '🔴' };
    }
    if (now < start) {
      return { text: 'Upcoming', color: 'bg-amber-100 text-amber-800', icon: '' };
    }
    return { text: 'Active', color: 'bg-blue-100 text-blue-800', icon: '📊' };
  };

  const filteredSessions = sessions.filter(session => {
    if (filterStatus === 'all') return true;
    const status = getSessionStatus(session);
    return status.text.toLowerCase().replace(' ', '') === filterStatus;
  });

  if (loading) return <LoadingSpinner message="Loading sessions..." />;
  if (!sessions.length) return <div className="text-center py-20 text-gray-500">No sessions found</div>;

  return (
    <div className="w-full mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">All Sessions</h1>
            <p className="text-gray-600 text-lg">
              {filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''} • Total: {sessions.length}
            </p>
          </div>
          
       
        </div>

      
      </div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSessions.map((session) => (
          <SessionCard key={session.id} session={session} getSessionStatus={getSessionStatus} />
        ))}
      </div>

      {/* Footer Legend */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-600 mb-4 md:mb-0">
            <span className="font-semibold text-gray-900">{filteredSessions.length}</span> sessions • 
            <span className="font-semibold text-gray-900 ml-2">{sessions.length}</span> total
          </div>
          <div className="flex flex-wrap gap-3">
            {['Draft', 'Upcoming', 'Live Now', 'Completed', 'Not Scheduled'].map((status) => (
              <div key={status} className="flex items-center">
                <div className={`w-3 h-3 ${
                  status === 'Draft' ? 'bg-blue-100' :
                  status === 'Upcoming' ? 'bg-amber-100' :
                  status === 'Live Now' ? 'bg-red-100' :
                  status === 'Completed' ? 'bg-emerald-100' : 'bg-gray-100'
                } rounded-full mr-2`} />
                <span className="text-sm text-gray-600">{status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Empty Filter State */}
      {filteredSessions.length === 0 && sessions.length > 0 && (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No sessions match your filter</h3>
          <p className="text-gray-600">Try selecting a different status filter</p>
          <button 
            onClick={() => setFilterStatus('all')}
            className="mt-4 px-4 py-2 text-sm font-medium text-[#2563eb] hover:text-[#1d4ed8]"
          >
            Clear filter
          </button>
        </div>
      )}
    </div>
  );
};

export default AllSessionsPage;
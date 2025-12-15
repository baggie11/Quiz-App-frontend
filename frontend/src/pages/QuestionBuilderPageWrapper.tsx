// components/Questions/QuestionBuilderWrapper.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';
import TopBar from '../components/TopBar/TopBar';
import QuestionBuilderPage from './QuestionPage';
import LoadingSpinner from '../components/Shared/LoadingSpinner';
import { type UserType } from '../types';
;

const QuestionBuilderWrapper: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  if (loading) return <LoadingSpinner message="Checking authorization..." />;
  
  if (!user || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-semibold text-red-600">
        ❌ Not authorized to access this page
      </div>
    );
  }

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            activePage="sessions"
            setActivePage={() => {}}
          />
          <div className="flex-1 min-h-screen lg:ml-64">
            <TopBar onMenuClick={() => setSidebarOpen(true)} />
            <main className="p-8">
              <div className="max-w-4xl mx-auto p-6 bg-red-50 rounded-2xl border border-red-100">
                <h2 className="text-xl font-semibold text-red-900 mb-2">Error: No Session ID</h2>
                <p className="text-red-700 mb-4">Please select a session to add questions.</p>
                <button
                  onClick={() => window.location.href = '/dashboard?sessions'}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                >
                  Go to Sessions
                </button>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  const handleSave = (questions: any[]) => {
    console.log('Saving questions:', questions);
  };

  const handlePreview = (questions: any[]) => {
    console.log('Previewing questions:', questions);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activePage="sessions" // Set to sessions page in sidebar
          setActivePage={() => {}}
        />
        <div className="flex-1 min-h-screen lg:ml-64">
          <TopBar onMenuClick={() => setSidebarOpen(true)} />
          <main className="p-4 lg:p-8 h-[calc(100vh-64px)] overflow-y-auto">
            <QuestionBuilderPage
              sessionId={sessionId}
              onSave={handleSave}
              onPreview={handlePreview}
            />
          </main>
        </div>
      </div>
    </div>
  );
};

export default QuestionBuilderWrapper;
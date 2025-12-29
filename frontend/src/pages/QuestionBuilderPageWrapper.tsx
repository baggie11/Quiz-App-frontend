// components/Questions/QuestionBuilderWrapper.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QuestionBuilderPage from './QuestionPage';
import LoadingSpinner from '../components/Shared/LoadingSpinner';
import { type UserType } from '../types';
import { ArrowLeft, FileText } from 'lucide-react';

const QuestionBuilderWrapper: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<UserType | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /* -------------------- AUTH LOAD -------------------- */

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }

    setLoading(false);
  }, []);

  const handleGoBack = () => {
    navigate('/dashboard?sessions');
  };

  /* -------------------- LOADING -------------------- */

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  /* -------------------- NOT AUTHENTICATED -------------------- */

  if (!user || !token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Sign in Required
          </h2>
          <p className="text-gray-600 mb-6">
            Please sign in to access the question builder.
          </p>
          <button
            onClick={() => (window.location.href = '/login')}
            className="w-full px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  /* -------------------- INVALID SESSION -------------------- */

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Sessions
          </button>

          <div className="bg-white rounded-xl border p-8">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-gray-600" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Session Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              Please select a valid session from your dashboard.
            </p>
            <button
              onClick={handleGoBack}
              className="px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium"
            >
              View Sessions
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------- RENDER -------------------- */

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleGoBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Sessions</span>
              </button>

              <div className="h-6 w-px bg-gray-200" />

              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Question Builder
                </h1>
                <p className="text-sm text-gray-500">
                  Session: {sessionId}
                </p>
              </div>
            </div>

            <div className="text-sm text-gray-500">
              {user.email}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg border min-h-[600px]">
            <div className="border-b p-4">
              <h2 className="font-semibold text-gray-900">
                Questions
              </h2>
            </div>

            <div className="overflow-y-auto max-h-[calc(100vh-220px)] p-4">
              <QuestionBuilderPage sessionId={sessionId} />
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t flex justify-between text-sm text-gray-500">
            <div>© {new Date().getFullYear()} Your Platform</div>
            <button
              onClick={() => window.open('/help/question-builder', '_blank')}
              className="text-gray-600 hover:text-gray-900"
            >
              Help & Documentation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionBuilderWrapper;

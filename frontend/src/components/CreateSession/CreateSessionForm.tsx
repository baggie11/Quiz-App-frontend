import React, { useState, type ChangeEvent, type FormEvent } from 'react';
import { Clock, Calendar as CalendarIcon, Tag } from 'lucide-react';
import { type Session } from '../../types';

interface CreateSessionFormProps {
  addSession: (newSession: Session) => void;
}

const CreateSessionForm: React.FC<CreateSessionFormProps> = ({ addSession }) => {
  const [formData, setFormData] = useState({
    sessionName: '',
    startDate: '',
    endDate: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors when user changes dates
    if (error?.includes('date')) {
      setError(null);
    }
  };

  const validateDates = (): boolean => {
    if (!formData.startDate || !formData.endDate) {
      setError("Both start date and end date are required");
      return false;
    }

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to compare dates only

    // Check if start date is in the future
    if (startDate < today) {
      setError("Start date cannot be in the past");
      return false;
    }

    // Check if end date is after start date
    if (endDate < startDate) {
      setError("End date cannot be before start date");
      return false;
    }

    // Optional: Check if end date is too far in the future (e.g., 1 year max)
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1);
    if (endDate > maxDate) {
      setError("End date cannot be more than 1 year in the future");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent, saveAsDraft = false) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate form data
    if (!formData.sessionName.trim()) {
      setError("Session name is required");
      return;
    }

    if (!validateDates()) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Format dates to ISO string without time (just date)
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      
      // Set time to beginning of day for start date
      startDate.setHours(0, 0, 0, 0);
      
      // Set time to end of day for end date
      endDate.setHours(23, 59, 59, 999);

      const payload = {
        title: formData.sessionName.trim(),
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        draft: saveAsDraft,
      };

      console.log('Payload:', payload); // For debugging

      const response = await fetch('http://localhost:3000/api/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.status === "ok") {
        setSuccess(saveAsDraft ? "Draft saved successfully" : "Session created successfully");
        addSession({ ...data.data, draft: saveAsDraft });
        setFormData({
          sessionName: '',
          startDate: '',
          endDate: '',
        });
      } else {
        setError(data.message || "Failed to create session");
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate min/max dates for inputs
  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);
  const maxDateString = maxDate.toISOString().split('T')[0];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Session</h1>
            <p className="text-gray-600">
              Set up a new quiz session with custom timing, access controls, and settings
            </p>
          </div>
          <div className="hidden lg:flex items-center space-x-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-100">
            <Clock className="text-blue-600" size={18} />
            <span className="text-sm font-medium text-blue-900">Draft</span>
          </div>
        </div>
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full animate-pulse" />
      </div>

      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-8">
        {/* Session Details */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Tag className="text-blue-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Session Details</h2>
              <p className="text-gray-600 text-sm">Basic information about your session</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="sessionName" className="block text-sm font-medium text-gray-900 mb-2">
                Session Name *
              </label>
              <input
                type="text"
                id="sessionName"
                name="sessionName"
                value={formData.sessionName}
                onChange={handleChange}
                placeholder="Enter a descriptive name for your session"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
              <p className="mt-2 text-sm text-gray-500">
                This name will be visible to participants
              </p>
            </div>
          </div>
        </div>

        {/* Timing */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <CalendarIcon className="text-purple-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Timing</h2>
              <p className="text-gray-600 text-sm">When should the session be active?</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Start Date */}
            <div className="space-y-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-900 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  min={today}
                  max={maxDateString}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
                <p className="mt-2 text-sm text-gray-500">
                  Session will become active on this date
                </p>
              </div>
            </div>

            {/* End Date */}
            <div className="space-y-4">
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-900 mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  min={formData.startDate || today}
                  max={maxDateString}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                  disabled={!formData.startDate}
                />
                <p className="mt-2 text-sm text-gray-500">
                  Session will end on this date
                </p>
              </div>
            </div>
          </div>

         

          {/* Preview */}
          {formData.startDate && formData.endDate && (
            <div className="mt-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-emerald-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-emerald-900 mb-1">Session Duration Preview</p>
                  <p className="text-xs text-emerald-700">
                    Your session will run from{' '}
                    <span className="font-semibold">{new Date(formData.startDate).toLocaleDateString()}</span>
                    {' '}to{' '}
                    <span className="font-semibold">{new Date(formData.endDate).toLocaleDateString()}</span>
                    {' '}({Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24))} days)
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error and Success Messages */}
        {(error || success) && (
          <div className={`p-4 rounded-xl border ${error ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
            <div className="flex items-center space-x-3">
              {error ? (
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              )}
              <p className={`text-sm font-medium ${error ? 'text-red-900' : 'text-emerald-900'}`}>
                {error || success}
              </p>
            </div>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="">
          <button
            type="submit"
            className="px-6 py-3 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Session'}
          </button>
          
        
        </div>
      </form>
    </div>
  );
};

export default CreateSessionForm;
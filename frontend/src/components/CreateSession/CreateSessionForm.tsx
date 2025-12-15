import React, { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Calendar as CalendarIcon, Tag } from 'lucide-react';
import { type Session } from '../../types';

interface CreateSessionFormProps {
  addSession?: (newSession: Session) => void;
  redirectToBuilder?: boolean; // New prop to control redirect behavior
}

const CreateSessionForm: React.FC<CreateSessionFormProps> = ({ 
  addSession, 
  redirectToBuilder = true // Default to redirect
}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    sessionName: '',
    startDate: '',
    endDate: '',
    duration: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors when user changes input
    if (error) {
      setError(null);
    }
  };

  const validateForm = (): boolean => {
    // Validate session name
    if (!formData.sessionName.trim()) {
      setError("Session name is required");
      return false;
    }

    // Validate dates
    if (!formData.startDate) {
      setError("Start date is required");
      return false;
    }

    if (!formData.endDate) {
      setError("End date is required");
      return false;
    }

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if start date is valid
    if (startDate < today) {
      setError("Start date cannot be in the past");
      return false;
    }

    // Check if end date is after start date
    if (endDate < startDate) {
      setError("End date cannot be before start date");
      return false;
    }

    // Validate duration
    if (!formData.duration) {
      setError("Test duration is required");
      return false;
    }

    const duration = parseInt(formData.duration);
    if (isNaN(duration) || duration <= 0) {
      setError("Duration must be a positive number");
      return false;
    }

    if (duration > 1440) { // 24 hours in minutes
      setError("Duration cannot exceed 24 hours (1440 minutes)");
      return false;
    }

    if (duration < 1) {
      setError("Duration must be at least 1 minute");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Format dates to ISO string
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
        duration: parseInt(formData.duration), // Duration in minutes
        draft: false,
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
        const newSession = { ...data.data, draft: false };
        
        // Show success message
        setSuccess("Session created successfully! Redirecting to question builder...");
        
        // Call addSession callback if provided
        if (addSession) {
          addSession(newSession);
        }
        
        // Redirect to question builder with session ID in URL
        if (redirectToBuilder && data.data?.id) {
          // Small delay to show success message
          setTimeout(() => {
            navigate(`/session/${data.data.id}/questions`);
          }, 1500);
        } else {
          // Reset form if not redirecting
          setTimeout(() => {
            setFormData({
              sessionName: '',
              startDate: '',
              endDate: '',
              duration: '',
            });
            setSuccess(null);
          }, 2000);
        }
      } else {
        setError(data.message || "Failed to create session");
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    setError(null);
    setSuccess(null);

    if (!formData.sessionName.trim()) {
      setError("Session name is required for draft");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const payload = {
        title: formData.sessionName.trim(),
        start_date: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        end_date: formData.endDate ? new Date(formData.endDate).toISOString() : null,
        duration: formData.duration ? parseInt(formData.duration) : null,
        draft: true,
      };

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
        const newSession = { ...data.data, draft: true };
        
        // Show success message
        setSuccess("Draft saved successfully!");
        
        // Call addSession callback if provided
        if (addSession) {
          addSession(newSession);
        }
        
        // Reset form
        setTimeout(() => {
          setFormData({
            sessionName: '',
            startDate: '',
            endDate: '',
            duration: '',
          });
          setSuccess(null);
        }, 2000);
      } else {
        setError(data.message || "Failed to save draft");
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

  // Common test duration options in minutes
  const durationOptions = [
    { value: '15', label: '15 minutes' },
    { value: '30', label: '30 minutes' },
    { value: '45', label: '45 minutes' },
    { value: '60', label: '1 hour' },
    { value: '90', label: '1.5 hours' },
    { value: '120', label: '2 hours' },
    { value: '180', label: '3 hours' },
    { value: '240', label: '4 hours' },
    { value: '300', label: '5 hours' },
    { value: '360', label: '6 hours' },
    { value: 'custom', label: 'Custom duration...' },
  ];

  // Format minutes to hours and minutes
  const formatDuration = (minutes: string) => {
    const mins = parseInt(minutes);
    if (isNaN(mins) || mins === 0) return '';
    
    const hours = Math.floor(mins / 60);
    const remainingMinutes = mins % 60;
    
    if (hours === 0) {
      return `${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
    } else if (remainingMinutes === 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    } else {
      return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Session</h1>
            <p className="text-gray-600">
              Set up a new quiz session with timing, duration, and settings
            </p>
          </div>
          <div className="hidden lg:flex items-center space-x-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-100">
            <Clock className="text-blue-600" size={18} />
            <span className="text-sm font-medium text-blue-900">
              {redirectToBuilder ? 'Auto-redirect Enabled' : 'Manual Mode'}
            </span>
          </div>
        </div>
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
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

        {/* Session Availability Dates */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <CalendarIcon className="text-purple-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Availability Window</h2>
              <p className="text-gray-600 text-sm">When can participants access this session?</p>
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
                  Date when session becomes available
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
                  Date when session closes
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Test Duration */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Clock className="text-indigo-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Test Duration</h2>
              <p className="text-gray-600 text-sm">How long is the test/exam?</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Quick Duration Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">
                Select Duration
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {durationOptions.map((option) => (
                  <button
                    type="button"
                    key={option.value}
                    onClick={() => {
                      if (option.value === 'custom') {
                        // Focus on custom input
                        document.getElementById('customDuration')?.focus();
                        setFormData(prev => ({ ...prev, duration: '' }));
                      } else {
                        setFormData(prev => ({ ...prev, duration: option.value }));
                      }
                    }}
                    className={`px-4 py-3 rounded-xl border transition-all ${
                      formData.duration === option.value
                        ? 'bg-blue-50 border-blue-300 text-blue-700 ring-2 ring-blue-100'
                        : option.value === 'custom'
                        ? 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Duration Input */}
            <div>
              <label htmlFor="customDuration" className="block text-sm font-medium text-gray-900 mb-2">
                Custom Duration (minutes) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="customDuration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  min="1"
                  max="1440"
                  step="1"
                  placeholder="Enter duration in minutes"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-24"
                  required
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                  minutes
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Session Summary */}
        {formData.sessionName && formData.startDate && formData.endDate && formData.duration && (
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border border-emerald-200 p-6">
            <h3 className="text-lg font-semibold text-emerald-900 mb-4">Ready to Create Session</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-emerald-800">
                  <span className="font-medium">Session Name:</span> {formData.sessionName}
                </p>
                <p className="text-sm text-emerald-800">
                  <span className="font-medium">Available From:</span> {new Date(formData.startDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-emerald-800">
                  <span className="font-medium">Available Until:</span> {new Date(formData.endDate).toLocaleDateString()}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-emerald-800">
                  <span className="font-medium">Test Duration:</span> {formatDuration(formData.duration)}
                </p>
                <p className="text-sm text-emerald-800">
                  <span className="font-medium">Total Minutes:</span> {formData.duration}
                </p>
              </div>
            </div>
            {redirectToBuilder && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm text-blue-800 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                  </svg>
                  After creating the session, you'll be redirected to the question builder
                </p>
              </div>
            )}
          </div>
        )}

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

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Save Draft Button */}
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={!formData.sessionName.trim() || loading}
            className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save as Draft'}
          </button>
          
          {/* Create Session Button */}
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Session & Add Questions'}
          </button>
        </div>

        {/* Information Note */}
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-medium text-blue-900 mb-1">What happens next?</p>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• After creating the session, you'll be redirected to the question builder</li>
                <li>• You can add questions immediately or come back later</li>
                <li>• Save as Draft to create without required fields filled</li>
                <li>• All sessions appear in your dashboard for easy management</li>
              </ul>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateSessionForm;
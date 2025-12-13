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

  const handleSubmit = async (e: FormEvent, saveAsDraft = false) => {
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
          duration: '',
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

          {/* Date Information */}
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex items-start space-x-3">
              <CalendarIcon className="text-blue-600 mt-0.5" size={18} />
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">Availability Window</p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Participants can start the test anytime between these dates</li>
                  <li>• Once started, they must complete within the test duration</li>
                  <li>• Start date must be today or in the future</li>
                  <li>• End date must be after start date</li>
                </ul>
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
                    key={option.value}
                    type="button"
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
              <p className="mt-2 text-sm text-gray-500">
                Enter the total time allowed for the test (1-1440 minutes)
              </p>
            </div>

            {/* Duration Display */}
            {formData.duration && (
              <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-indigo-900 mb-1">Selected Duration</p>
                    <p className="text-2xl font-bold text-indigo-700">
                      {formatDuration(formData.duration)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-indigo-600 mb-1">Total minutes</p>
                    <p className="text-2xl font-bold text-indigo-700">
                      {formData.duration}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Duration Information */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-gray-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">About Test Duration</p>
                  <ul className="text-xs text-gray-700 space-y-1">
                    <li>• Duration is the time limit for completing the test</li>
                    <li>• Timer starts when participant begins the test</li>
                    <li>• Test auto-submits when time expires</li>
                    <li>• Minimum: 1 minute</li>
                    <li>• Maximum: 24 hours (1440 minutes)</li>
                    <li>• Recommended: 30-180 minutes for standard tests</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Session Summary */}
        {formData.sessionName && formData.startDate && formData.endDate && formData.duration && (
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border border-emerald-200 p-6">
            <h3 className="text-lg font-semibold text-emerald-900 mb-4">Session Summary</h3>
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
                <p className="text-sm text-emerald-800">
                  <span className="font-medium">Availability Period:</span> {Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                </p>
              </div>
            </div>
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

        {/* Submit Button */}
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
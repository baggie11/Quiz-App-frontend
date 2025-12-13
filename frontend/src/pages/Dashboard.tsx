import React, { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import {
  Brain,
  Menu,
  X,
  Search,
  Bell,
  User,
  Home,
  Calendar,
  PlusCircle,
  Settings,
  FileText,
  Users,
  BarChart,
  HelpCircle,
  LogOut,
  ChevronDown,
  Clock,
  Calendar as CalendarIcon,
  Tag
} from 'lucide-react';
import {  Hash, CheckCircle } from 'lucide-react';

// User Account Dropdown Component
const UserAccountDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="User account menu"
      >
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
          <User className="text-white" size={20} />
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-gray-900">Alex Johnson</p>
          <p className="text-xs text-gray-500">Instructor</p>
        </div>
        <ChevronDown size={16} className="text-gray-500" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-20">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">Alex Johnson</p>
              <p className="text-xs text-gray-500 mt-1">alex@quizvision.com</p>
            </div>
            
            <div className="py-1">
              <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <User size={16} className="mr-3 text-gray-500" />
                My Profile
              </a>
              <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <Settings size={16} className="mr-3 text-gray-500" />
                Settings
              </a>
              <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <HelpCircle size={16} className="mr-3 text-gray-500" />
                Help & Support
              </a>
            </div>
            
            <div className="border-t border-gray-100 pt-1">
              <button className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                <LogOut size={16} className="mr-3" />
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Sidebar Component
const Sidebar: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  activePage: string;
  setActivePage: (page: string) => void;
}> = ({ isOpen, onClose, activePage, setActivePage }) => {
  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'new-session', icon: PlusCircle, label: 'New Session' },
    { id: 'sessions', icon: Calendar, label: 'All Sessions' },
    { id: 'questions', icon: FileText, label: 'Question Bank' },
    { id: 'participants', icon: Users, label: 'Participants' },
    { id: 'analytics', icon: BarChart, label: 'Analytics' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-40
          w-64 bg-white border-r border-gray-200
          transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0
          transition-transform duration-300 ease-in-out
          flex flex-col
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#2563eb] to-[#3b82f6] rounded-xl flex items-center justify-center">
              <Brain className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">QuizVision</h1>
              <p className="text-xs text-gray-500">Instructor Dashboard</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setActivePage(item.id);
                    // Close sidebar on mobile after selection
                    if (window.innerWidth < 1024) {
                      onClose();
                    }
                  }}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-xl
                    transition-all duration-200
                    ${
                      activePage === item.id
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-[#2563eb] border border-blue-100'
                        : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <item.icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>

          {/* Help Section */}
          <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex items-start space-x-3">
              <HelpCircle className="text-blue-600 mt-0.5" size={18} />
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">Need help?</p>
                <p className="text-xs text-blue-700 mb-2">Check our documentation or contact support</p>
                <button className="text-xs px-3 py-1.5 bg-white text-blue-600 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors">
                  Get Help
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-xs font-bold text-white">AI</span>
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-900">Smart Assistant</p>
              <p className="text-xs text-gray-500">Ready to help</p>
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </div>
        </div>
      </aside>
    </>
  );
};

// Dashboard Component - Updated
const Dashboard: React.FC = () => {
  type UserType = {
    name: string;
    email: string;
    role?: string;
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState("new-session");
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-lg">Checking authorization...</div>;
  if (!user || !token) return <div className="min-h-screen flex items-center justify-center text-xl font-semibold text-red-600">❌ Not authorized to access this page</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activePage={activePage}
          setActivePage={setActivePage}
        />

        {/* Main content area with fixed sidebar spacing */}
        <div className="flex-1 min-h-screen lg:ml-64">
          <TopBar onMenuClick={() => setSidebarOpen(true)} />
          
          {/* Scrollable main content */}
          <main className="p-4 lg:p-8 h-[calc(100vh-64px)] overflow-y-auto">
            {(activePage === "dashboard" || activePage === "new-session") && 
              <CreateSessionForm addSession={(newSession) => setSessions(prev => [newSession, ...prev])} />
            }
            {activePage === "sessions" && <AllSessionsPage sessions={sessions} setSessions={setSessions} />}
            
            {/* Add placeholder content for other pages */}
            {activePage === "questions" && (
              <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Question Bank</h1>
                <p className="text-gray-600">Question bank page content goes here...</p>
              </div>
            )}
            {activePage === "participants" && (
              <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Participants</h1>
                <p className="text-gray-600">Participants page content goes here...</p>
              </div>
            )}
            {activePage === "analytics" && (
              <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Analytics</h1>
                <p className="text-gray-600">Analytics page content goes here...</p>
              </div>
            )}
            {activePage === "settings" && (
              <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>
                <p className="text-gray-600">Settings page content goes here...</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

// Top Bar Component
const TopBar: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            <Menu size={24} className="text-gray-700" />
          </button>
          
        
        </div>

        <div className="flex items-center space-x-4">
         
          
          <div className="hidden lg:block h-6 w-px bg-gray-300" />
          
          <UserAccountDropdown />
        </div>
      </div>
    </header>
  );
};

// ---------------- CREATE SESSION FORM ----------------
interface CreateSessionFormProps {
  addSession: (newSession: any) => void;
}

const CreateSessionForm: React.FC<CreateSessionFormProps> = ({ addSession }) => {
  const [formData, setFormData] = useState({
    sessionName: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent, saveAsDraft = false) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const scheduled_start = formData.startDate && formData.startTime
        ? new Date(`${formData.startDate}T${formData.startTime}`).toISOString()
        : null;

      const ended_at = formData.endDate && formData.endTime
        ? new Date(`${formData.endDate}T${formData.endTime}`).toISOString()
        : null;

      const payload = {
        title: formData.sessionName || 'Untitled Draft',
        scheduled_start,
        ended_at,
        draft: saveAsDraft,
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
      console.log(data);

      if (response.ok && data.status === "ok") {
        setSuccess(saveAsDraft ? "Draft saved successfully" : "Session created successfully");
        addSession({ ...data.data, draft: saveAsDraft });
      } else {
        setError(data.message || "Failed to create session");
        console.log(data.message);
      }
    } catch (err: any) {
      console.log("Hello an error occurred.");
      console.error(err);
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

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
            {/* Start */}
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
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-900 mb-2">
                  Start Time *
                </label>
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* End */}
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
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-900 mb-2">
                  End Time *
                </label>
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex items-start space-x-3">
              <Clock className="text-blue-600 mt-0.5" size={18} />
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">Time Zone Notice</p>
                <p className="text-xs text-blue-700">
                  All times are displayed in your current timezone ({Intl.DateTimeFormat().resolvedOptions().timeZone})
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex flex-col-reverse lg:flex-row gap-4 pt-4">
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Session'}
          </button>
          {error && <p className="text-red-600 text-sm mt-2 lg:mt-0">{error}</p>}
          {success && <p className="text-green-600 text-sm mt-2 lg:mt-0">{success}</p>}
        </div>
      </form>
    </div>
  );
};

// ---------------- ALL SESSIONS PAGE ----------------
interface AllSessionsPageProps {
  sessions: any[];
  setSessions: React.Dispatch<React.SetStateAction<any[]>>;
}

const AllSessionsPage: React.FC<AllSessionsPageProps> = ({ sessions, setSessions }) => {
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredSessions = sessions.filter(session => {
    if (filterStatus === 'all') return true;
    const status = getSessionStatus(session);
    return status.text.toLowerCase().replace(' ', '') === filterStatus;
  });

  const getSessionStatus = (session: any) => {
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

  useEffect(() => {
    const fetchSessions = async() => {
      try{
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
        }else{
          console.error("Failed to fetch sessions:", json.message);
        }
      }catch(err){
        console.error("Error fetching sessions:", err);
      }finally{
        setLoading(false);
      }
    };
    fetchSessions();
  },[setSessions]);

  const formatDateTime = (dateString: string) => {
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

   if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563eb] mb-4"></div>
      <div className="text-lg text-gray-600">Loading sessions...</div>
    </div>
  );
  if (!sessions.length) return <div className="text-center py-20 text-gray-500">No sessions found</div>;

  return (
    <div className="w-full mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              All Sessions
            </h1>
            <p className="text-gray-600 text-lg">
              {filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''} • Total: {sessions.length}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-xl pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="upcoming">Upcoming</option>
                <option value="livenow">Live Now</option>
                <option value="completed">Completed</option>
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            <button className="px-4 py-2.5 bg-gradient-to-r from-[#2563eb] to-[#3b82f6] text-white rounded-xl font-medium hover:from-[#1d4ed8] hover:to-[#2563eb] transition-all shadow-sm hover:shadow">
              + New Session
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{sessions.length}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Hash className="text-[#2563eb]" size={20} />
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Live Now</p>
                <p className="text-2xl font-bold text-gray-900">
                  {sessions.filter(s => getSessionStatus(s).text === 'Live Now').length}
                </p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900">
                  {sessions.filter(s => getSessionStatus(s).text === 'Upcoming').length}
                </p>
              </div>
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {sessions.filter(s => getSessionStatus(s).text === 'Completed').length}
                </p>
              </div>
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-emerald-600" size={20} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSessions.map((session: any) => {
          const status = getSessionStatus(session);
          
          return (
            <div
              key={session.id}
              className="group bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
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
                  {/* Start Time */}
                  <div className="flex items-start">
                    <div className="p-2 bg-blue-50 rounded-lg mr-3">
                      <svg className="w-4 h-4 text-[#2563eb]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-[#2563eb] font-medium">Start Time</div>
                      <div className="text-gray-800 font-semibold">
                        {formatDateTime(session.scheduled_start)}
                      </div>
                    </div>
                  </div>

                  {/* End Time */}
                  <div className="flex items-start">
                    <div className="p-2 bg-indigo-50 rounded-lg mr-3">
                      <svg className="w-4 h-4 text-[#3b82f6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-[#3b82f6] font-medium">End Time</div>
                      <div className="text-gray-800 font-semibold">
                        {formatDateTime(session.ended_at)}
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
        })}
      </div>

      {/* Footer Legend */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-600 mb-4 md:mb-0">
            <span className="font-semibold text-gray-900">{filteredSessions.length}</span> sessions • 
            <span className="font-semibold text-gray-900 ml-2">{sessions.length}</span> total
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-100 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Draft</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-amber-100 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Upcoming</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-100 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Live Now</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-emerald-100 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Completed</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gray-100 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Not Scheduled</span>
            </div>
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

export default Dashboard;
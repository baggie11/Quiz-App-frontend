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
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-white border-r border-gray-200
          transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 transition-transform duration-300 ease-in-out
          flex flex-col h-screen
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
                  onClick={() => setActivePage(item.id)}
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
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="search"
              placeholder="Search sessions, questions..."
              className="pl-10 pr-4 py-2 w-64 lg:w-80 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Bell size={22} className="text-gray-700" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          
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

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:3000/api/session', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setSessions(data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  const handleChange = (id: number, field: string, value: string) => {
    setSessions(prev =>
      prev.map(session =>
        session.id === id ? { ...session, [field]: value } : session
      )
    );
  };

  if (loading) return <div className="text-center py-20 text-gray-500">Loading sessions...</div>;
  if (!sessions.length) return <div className="text-center py-20 text-gray-500">No sessions found</div>;

  return (
    <div className="w-full mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-3">All Sessions</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {sessions.map((session: any) => (
          <div
            key={session.id}
            className={`
              h-28 p-3 rounded-xl border border-white/20 
              bg-white/30 backdrop-blur-md shadow-sm 
              hover:bg-gradient-to-r hover:from-indigo-200/40 hover:to-blue-200/40 
              hover:text-white hover:shadow-lg transition-all duration-300
              w-full relative
            `}
          >
            {/* Draft Badge */}
            {session.draft && (
              <span className="absolute top-4 right-4 px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full">
                Draft
              </span>
            )}

            {/* Session Name */}
            <div className="mb-4 flex items-center space-x-2">
              <span className="text-indigo-500 font-medium">Session Name:</span>
              <span className="text-gray-900 font-semibold">{session.title}</span>
            </div>

            {/* Start & End Time */}
            <div className="flex flex-col space-y-1">
              <div className="mb-2 sm:mb-0">
                <span className="text-indigo-500 font-medium">Starts:</span>
                <span className="ml-2 text-gray-700">
                  {session.scheduled_start
                    ? new Date(session.scheduled_start).toLocaleString()
                    : 'N/A'}
                </span>
              </div>
              
              <div>
                <span className="text-indigo-500 font-medium">Ends:</span>
                <span className="ml-2 text-gray-700">
                  {session.ended_at
                    ? new Date(session.ended_at).toLocaleString()
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ---------------- DASHBOARD ----------------
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
  const [activePage, setActivePage] = useState("new-session"); // default = new session
  const [sessions, setSessions] = useState<any[]>([]); // NEW

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

        <div className="flex-1 flex flex-col min-h-screen">
          <TopBar onMenuClick={() => setSidebarOpen(true)} />

          <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
            {(activePage === "dashboard" || activePage === "new-session") && 
              <CreateSessionForm addSession={(newSession) => setSessions(prev => [newSession, ...prev])} />
            }
            {activePage === "sessions" && <AllSessionsPage sessions={sessions} setSessions={setSessions} />}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
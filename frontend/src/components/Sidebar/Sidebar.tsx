import React from 'react';
import {
  Home,
  PlusCircle,
  Calendar,
  FileText,
  Users,
  BarChart,
  Settings,
  Brain,
  HelpCircle,
} from 'lucide-react';
import { type MenuItem } from '../../types';
import  SidebarItem from './SidebarItem';
import HelpSection from './HelpSection';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activePage: string;
  setActivePage: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, activePage, setActivePage }) => {
  const menuItems: MenuItem[] = [
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
              <SidebarItem
                key={item.id}
                item={item}
                activePage={activePage}
                setActivePage={setActivePage}
                onClose={onClose}
              />
            ))}
          </ul>

          <HelpSection />
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

export default Sidebar;
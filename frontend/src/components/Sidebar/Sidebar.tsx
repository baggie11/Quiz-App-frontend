import React from 'react';
import {

  PlusCircle,
  Calendar,

  Settings,
  Brain,

} from 'lucide-react';
import { type MenuItem } from '../../types';
import  SidebarItem from './SidebarItem';


interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activePage: string;
  setActivePage: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, activePage, setActivePage }) => {
  const menuItems: MenuItem[] = [
    { id: 'new-session', icon: PlusCircle, label: 'New Session' },
    { id: 'sessions', icon: Calendar, label: 'All Sessions' },
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
        </nav>

        
      </aside>
    </>
  );
};

export default Sidebar;
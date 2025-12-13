import React, { useState } from 'react';
import { User, Settings, HelpCircle, LogOut, ChevronDown } from 'lucide-react';

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

export default UserAccountDropdown;
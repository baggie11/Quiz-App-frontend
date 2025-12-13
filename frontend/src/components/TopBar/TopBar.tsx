import React from 'react';
import { Menu } from 'lucide-react';
import UserAccountDropdown from './UserAccountDropdown';

interface TopBarProps {
  onMenuClick: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
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

export default TopBar;
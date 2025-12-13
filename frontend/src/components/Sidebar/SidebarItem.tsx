import React from 'react';
import { type MenuItem } from '../../types';

interface SidebarItemProps {
  item: MenuItem;
  activePage: string;
  setActivePage: (page: string) => void;
  onClose: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ item, activePage, setActivePage, onClose }) => {
  const Icon = item.icon;

  const handleClick = () => {
    setActivePage(item.id);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <li>
      <button
        onClick={handleClick}
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
        <Icon size={20} />
        <span className="font-medium">{item.label}</span>
      </button>
    </li>
  );
};

export default SidebarItem;
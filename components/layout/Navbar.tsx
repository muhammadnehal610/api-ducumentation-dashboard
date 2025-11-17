import React from 'react';
import { Search, Bell, Settings, User, LogOut, Menu } from 'lucide-react';
import { User as UserType } from '../../types';


interface NavbarProps {
  onLogout: () => void;
  toggleSidebar: () => void;
  user: UserType;
}

const Navbar: React.FC<NavbarProps> = ({ onLogout, toggleSidebar, user }) => {
  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={toggleSidebar} className="lg:hidden text-gray-500 dark:text-gray-400 mr-4">
            <Menu size={24} />
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 w-full max-w-xs bg-gray-100 dark:bg-gray-800 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
            <Bell size={20} />
          </button>
          <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
            <Settings size={20} />
          </button>

          <div className="relative group">
            <button className="flex items-center space-x-2">
              <img src={`https://i.pravatar.cc/150?u=${user.id}`} alt="User Avatar" className="w-8 h-8 rounded-full" />
            </button>
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 invisible group-hover:visible">
              <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role} Developer</p>
              </div>
              <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                <User size={16} className="mr-2"/> Profile
              </a>
              <button onClick={onLogout} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                <LogOut size={16} className="mr-2 text-red-500"/> <span className="text-red-500">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
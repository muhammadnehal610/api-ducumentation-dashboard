import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Settings, User, LogOut, Menu, Edit, Trash2, Repeat, ChevronDown } from 'lucide-react';
import { User as UserType, Service } from '../../types.ts';

interface NavbarProps {
  onLogout: () => void;
  toggleSidebar: () => void;
  user: UserType;
  service: Service;
  onManageService: (action: { action: 'rename' | 'delete', service: Service }) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onLogout, toggleSidebar, user, service, onManageService }) => {
  const [isServiceMenuOpen, setServiceMenuOpen] = useState(false);
  const serviceMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (serviceMenuRef.current && !serviceMenuRef.current.contains(event.target as Node)) {
        setServiceMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleSwitchService = () => {
    localStorage.removeItem('selectedService');
    navigate('/');
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={toggleSidebar} className="lg:hidden text-gray-500 dark:text-gray-400 mr-4">
            <Menu size={24} />
          </button>
          
          <div className="relative" ref={serviceMenuRef}>
            <button onClick={() => setServiceMenuOpen(!isServiceMenuOpen)} className="flex items-center space-x-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
              <span>{service.name}</span>
              <ChevronDown size={20} className={`transition-transform duration-200 ${isServiceMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            {isServiceMenuOpen && (
              <div className="absolute top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 border border-gray-200 dark:border-gray-700">
                 <button onClick={handleSwitchService} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Repeat size={14} className="mr-2" /> Switch Service
                </button>
                {user.role === 'backend' && (
                  <>
                    <button onClick={() => { onManageService({ action: 'rename', service }); setServiceMenuOpen(false); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                      <Edit size={14} className="mr-2" /> Rename Service
                    </button>
                    <button onClick={() => { onManageService({ action: 'delete', service }); setServiceMenuOpen(false); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50">
                      <Trash2 size={14} className="mr-2" /> Delete Service
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
            <Bell size={20} />
          </button>
          
          <div className="relative group">
            <button className="flex items-center space-x-2">
              <img src={`https://i.pravatar.cc/150?u=${user.id}`} alt="User Avatar" className="w-8 h-8 rounded-full" />
            </button>
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 invisible group-hover:visible z-10 border border-gray-200 dark:border-gray-700">
              <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role} Developer</p>
              </div>
              <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                <User size={16} className="mr-2"/> Profile
              </a>
               <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                <Settings size={16} className="mr-2"/> Settings
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

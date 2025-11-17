import React, { useMemo } from 'react';
import { LayoutDashboard, Code, Book, PlayCircle, FileJson, Lock, GitMerge, AlertTriangle, GitBranch, SettingsIcon, ChevronDown, ChevronsLeft, ChevronsRight, Briefcase, Users } from 'lucide-react';
// FIX: Changed alias imports to relative paths with extensions for module resolution.
import { Page, User } from '../../types.ts';

interface SidebarProps {
  onNavigate: (page: Page) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  services: string[];
  selectedService: string;
  setSelectedService: (service: string) => void;
  user: User;
}

const allNavItems: { page: Page; icon: React.ElementType; roles: User['role'][] }[] = [
  { page: 'Overview', icon: LayoutDashboard, roles: ['frontend', 'backend'] },
  { page: 'Modules', icon: Briefcase, roles: ['frontend', 'backend'] },
  { page: 'Endpoints', icon: Code, roles: ['frontend', 'backend'] },
  { page: 'API Playground', icon: PlayCircle, roles: ['frontend', 'backend'] },
  { page: 'Schemas', icon: FileJson, roles: ['frontend', 'backend'] },
  { page: 'Authentication', icon: Lock, roles: ['frontend', 'backend'] },
  { page: 'Flows', icon: GitMerge, roles: ['frontend', 'backend'] },
  { page: 'Error Codes', icon: AlertTriangle, roles: ['frontend', 'backend'] },
  { page: 'Changelog', icon: GitBranch, roles: ['frontend', 'backend'] },
  { page: 'User Management', icon: Users, roles: ['backend'] },
  { page: 'Settings', icon: SettingsIcon, roles: ['frontend', 'backend'] },
];

const Sidebar: React.FC<SidebarProps> = ({ onNavigate, isOpen, setIsOpen, services, selectedService, setSelectedService, user }) => {
    
    const navItems = useMemo(() => {
        return allNavItems.filter(item => item.roles.includes(user.role));
    }, [user.role]);

    const NavLink: React.FC<{ page: Page; icon: React.ElementType }> = ({ page, icon: Icon }) => (
        <li
          onClick={() => onNavigate(page)}
          className={`flex items-center p-3 my-1 rounded-lg cursor-pointer transition-colors duration-200 text-gray-300 hover:bg-gray-700 hover:text-white`}
        >
          <Icon size={20} />
          <span className={`ml-4 transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>{page}</span>
        </li>
      );

  return (
    <aside className={`fixed top-0 left-0 h-full bg-gray-900 text-white flex flex-col z-40 transition-width duration-300 ${isOpen ? 'w-64' : 'w-20'} lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-800" style={{ minHeight: '65px' }}>
          <div className={`flex items-center ${!isOpen ? 'w-full justify-center' : ''}`}>
             <Book size={28} className="text-primary-400" />
            <h1 className={`text-xl font-bold ml-2 transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>{`API Docs`}</h1>
          </div>
          <button onClick={() => setIsOpen(!isOpen)} className="hidden lg:block p-1 rounded-full hover:bg-gray-700">
             {isOpen ? <ChevronsLeft size={20}/> : <ChevronsRight size={20}/>}
          </button>
      </div>

      <div className={`p-4 border-b border-gray-800 ${!isOpen ? 'hidden' : ''}`}>
        <div className="relative">
          <select 
            value={selectedService} 
            onChange={(e) => setSelectedService(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {services.map(service => <option key={service}>{service}</option>)}
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <nav className="flex-1 p-2 overflow-y-auto">
        <ul>
          {navItems.map(item => <NavLink key={item.page} {...item} />)}
        </ul>
      </nav>

      <div className={`p-4 border-t border-gray-800 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
        <div className="flex items-center">
            <img src={`https://i.pravatar.cc/150?u=${user.id}`} alt="User" className="w-10 h-10 rounded-full" />
            <div className={`ml-3 transition-opacity duration-200`}>
                <p className="font-semibold text-sm">{user.name}</p>
                <p className="text-xs text-gray-400 capitalize">{user.role} Developer</p>
            </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

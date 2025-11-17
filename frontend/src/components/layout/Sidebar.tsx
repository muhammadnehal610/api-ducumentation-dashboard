import React, { useMemo } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { LayoutDashboard, Code, Book, PlayCircle, FileJson, Lock, GitMerge, AlertTriangle, GitBranch, Settings as SettingsIcon, ChevronsLeft, ChevronsRight, Users, Box } from 'lucide-react';
import { User } from '../../types.ts';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  user: User;
}

interface NavItem {
    name: string;
    path: string;
    icon: React.ElementType;
    roles: User['role'][];
}

const allNavItems: NavItem[] = [
  { name: 'Dashboard', path: 'dashboard', icon: LayoutDashboard, roles: ['frontend', 'backend'] },
  { name: 'Modules', path: 'modules', icon: Box, roles: ['frontend', 'backend'] },
  { name: 'Endpoints', path: 'endpoints', icon: Code, roles: ['frontend', 'backend'] },
  { name: 'API Playground', path: 'api-playground', icon: PlayCircle, roles: ['frontend', 'backend'] },
  { name: 'Schemas', path: 'schemas', icon: FileJson, roles: ['frontend', 'backend'] },
  { name: 'Authentication', path: 'authentication', icon: Lock, roles: ['frontend', 'backend'] },
  { name: 'Flows', path: 'flows', icon: GitMerge, roles: ['frontend', 'backend'] },
  { name: 'Error Codes', path: 'error-codes', icon: AlertTriangle, roles: ['frontend', 'backend'] },
  { name: 'Changelog', path: 'changelog', icon: GitBranch, roles: ['frontend', 'backend'] },
  { name: 'User Management', path: 'user-management', icon: Users, roles: ['backend'] },
  { name: 'Settings', path: 'settings', icon: SettingsIcon, roles: ['frontend', 'backend'] },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, user }) => {
    const { serviceId } = useParams<{ serviceId: string }>();

    const navItems = useMemo(() => {
        return allNavItems.filter(item => item.roles.includes(user.role));
    }, [user.role]);

    const NavItemLink: React.FC<{ item: NavItem }> = ({ item }) => (
        <li>
            <NavLink
                to={`/${serviceId}/${item.path}`}
                end={item.path === 'dashboard'} // Ensure dashboard is only active on its exact path
                className={({ isActive }) => 
                    `flex items-center p-3 my-1 rounded-lg cursor-pointer transition-colors duration-200 
                    ${isActive ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`
                }
            >
                <item.icon size={20} />
                <span className={`ml-4 whitespace-nowrap transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>{item.name}</span>
            </NavLink>
        </li>
      );

  return (
    <aside className={`fixed top-0 left-0 h-full bg-gray-900 text-white flex flex-col z-40 transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'}`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-800" style={{ minHeight: '65px' }}>
          <div className={`flex items-center ${!isOpen ? 'w-full justify-center' : ''}`}>
             <Book size={28} className="text-primary-400" />
            <h1 className={`text-xl font-bold ml-2 transition-opacity duration-200 whitespace-nowrap ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>{`API Docs`}</h1>
          </div>
          <button onClick={() => setIsOpen(!isOpen)} className="hidden lg:block p-1 rounded-full hover:bg-gray-700">
             {isOpen ? <ChevronsLeft size={20}/> : <ChevronsRight size={20}/>}
          </button>
      </div>

      <nav className="flex-1 p-2 overflow-y-auto">
        <ul>
          {navItems.map(item => <NavItemLink key={item.path} item={item} />)}
        </ul>
      </nav>

      <div className={`p-4 border-t border-gray-800 transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
        <div className="flex items-center">
            <img src={`https://i.pravatar.cc/150?u=${user.id}`} alt="User" className="w-10 h-10 rounded-full" />
            <div className={`ml-3`}>
                <p className="font-semibold text-sm whitespace-nowrap">{user.name}</p>
                <p className="text-xs text-gray-400 capitalize whitespace-nowrap">{user.role} Developer</p>
            </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

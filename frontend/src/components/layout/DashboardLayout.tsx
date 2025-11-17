import React, { useState } from 'react';
import Sidebar from './Sidebar.tsx';
import Navbar from './Navbar.tsx';
import Breadcrumbs from '../ui/Breadcrumbs.tsx';
// FIX: Changed alias imports to relative paths with extensions for module resolution.
import { Page, User, Breadcrumb, Service } from '../../types.ts';

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
  breadcrumbs: Breadcrumb[];
  onNavigate: (page: Page, breadcrumbs?: Breadcrumb[]) => void;
  service: Service;
  onSwitchService: () => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, user, onLogout, breadcrumbs, onNavigate, service, onSwitchService }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-950">
      <Sidebar 
        user={user}
        onNavigate={(page) => onNavigate(page)} 
        isOpen={isSidebarOpen} 
        setIsOpen={setSidebarOpen} 
      />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        <Navbar 
            onLogout={onLogout} 
            toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} 
            user={user}
            service={service}
            onSwitchService={onSwitchService}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Breadcrumbs items={breadcrumbs} onNavigate={onNavigate} />
          <div className="mt-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
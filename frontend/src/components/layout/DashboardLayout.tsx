import React, { useState } from 'react';
import Sidebar from './Sidebar.tsx';
import Navbar from './Navbar.tsx';
import Breadcrumbs from '../ui/Breadcrumbs.tsx';
// FIX: Changed alias imports to relative paths with extensions for module resolution.
import { Page, User, Breadcrumb } from '../../types.ts';
import { services } from '../../constants/dummyData.ts';

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
  breadcrumbs: Breadcrumb[];
  onNavigate: (page: Page, breadcrumbs?: Breadcrumb[]) => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, user, onLogout, breadcrumbs, onNavigate }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [selectedService, setSelectedService] = useState(services[0]);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-950">
      <Sidebar 
        user={user}
        onNavigate={(page) => onNavigate(page)} 
        isOpen={isSidebarOpen} 
        setIsOpen={setSidebarOpen} 
        selectedService={selectedService}
        setSelectedService={setSelectedService}
      />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        <Navbar onLogout={onLogout} toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} user={user}/>
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

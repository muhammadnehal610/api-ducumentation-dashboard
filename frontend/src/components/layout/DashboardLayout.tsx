import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './Sidebar.tsx';
import Navbar from './Navbar.tsx';
import Breadcrumbs from '../ui/Breadcrumbs.tsx';
// FIX: Changed alias imports to relative paths with extensions for module resolution.
import { Page, User, Breadcrumb } from '../../types.ts';
import { apiClient } from '../../services/apiClient.ts';

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
  breadcrumbs: Breadcrumb[];
  onNavigate: (page: Page, breadcrumbs?: Breadcrumb[]) => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, user, onLogout, breadcrumbs, onNavigate }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [services, setServices] = useState<{ id: string; name: string }[]>([]);
  const [selectedService, setSelectedService] = useState('All Services');

  const fetchServices = useCallback(async () => {
    try {
        const response = await apiClient<{ data: { id: string; name: string }[] }>('/modules');
        setServices(response.data);
    } catch (error) {
        console.error("Failed to fetch services:", error);
    }
  }, []);

  useEffect(() => {
    fetchServices();
    
    const handleServicesUpdate = () => {
        fetchServices();
    };

    window.addEventListener('servicesUpdated', handleServicesUpdate);

    return () => {
        window.removeEventListener('servicesUpdated', handleServicesUpdate);
    };
  }, [fetchServices]);
  
  const handleServiceSelect = (serviceName: string) => {
    setSelectedService(serviceName);
    if (serviceName === 'All Services') {
        onNavigate('Endpoints');
    } else if (serviceName === '__CREATE_NEW__') {
        onNavigate('Service Management');
    }
    else {
        onNavigate('Endpoints', [
            { name: 'Home', page: 'Overview' },
            { name: 'Service Management', page: 'Service Management'},
            { name: serviceName, page: 'Endpoints' },
        ]);
    }
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-950">
      <Sidebar 
        user={user}
        onNavigate={(page) => onNavigate(page)} 
        isOpen={isSidebarOpen} 
        setIsOpen={setSidebarOpen} 
        services={services}
        selectedService={selectedService}
        setSelectedService={handleServiceSelect}
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

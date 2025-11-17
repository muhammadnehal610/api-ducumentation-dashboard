import React, { useState, useEffect } from 'react';
// FIX: Imported the 'Navigate' component from 'react-router-dom'.
import { Outlet, useParams, useNavigate, useLocation, useOutletContext, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar.tsx';
import Navbar from './Navbar.tsx';
import Breadcrumbs from '../ui/Breadcrumbs.tsx';
import Loading from '../ui/Loading.tsx';
import ServiceFormModal from '../modals/ServiceFormModal.tsx';
import DeleteServiceModal from '../modals/DeleteServiceModal.tsx';
import { User, Service, Breadcrumb } from '../../types.ts';
import { apiClient } from '../../services/apiClient.ts';

interface DashboardLayoutProps {
  user: User;
  onLogout: () => void;
}

export interface DashboardOutletContext {
    user: User;
    service: Service;
}

// Helper to generate breadcrumbs from pathname
const generateBreadcrumbs = (pathname: string, serviceName: string): Breadcrumb[] => {
    const base: Breadcrumb[] = [{ name: serviceName, page: 'dashboard' }];
    const parts = pathname.split('/').filter(p => p && isNaN(Number(p))); // filter out IDs

    if (parts.length < 2) return base;

    let currentPath = `/${parts[0]}`; // serviceId is not in parts here as we use location.pathname
    
    // This is a simplified breadcrumb generator
    const capitalized = parts[1].charAt(0).toUpperCase() + parts[1].slice(1).replace('-', ' ');
    base.push({ name: capitalized, page: `${currentPath}/${parts[1]}` });

    if (parts.length > 2 && parts[2] !== 'edit' && parts[2] !== 'create') {
      base.push({ name: 'Details', page: '#' });
    } else if (parts[2] === 'edit' || parts[2] === 'create') {
      base.push({ name: 'Form', page: '#' });
    }

    return base;
};


export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ user, onLogout }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [service, setService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [serviceToManage, setServiceToManage] = useState<{ action: 'rename' | 'delete', service: Service } | null>(null);
  
  useEffect(() => {
    const fetchServiceDetails = async () => {
      if (!serviceId) {
        navigate('/');
        return;
      }
      setIsLoading(true);
      setError('');
      try {
        const response = await apiClient<{ data: Service[] }>('/services');
        const currentService = response.data.find(s => s.id === serviceId);
        if (currentService) {
          setService(currentService);
          localStorage.setItem('selectedService', JSON.stringify(currentService));
        } else {
          setError('Service not found.');
          localStorage.removeItem('selectedService');
          setTimeout(() => navigate('/'), 2000); // Redirect if service is invalid
        }
      } catch (err) {
        setError('Failed to load service data.');
        setTimeout(() => navigate('/'), 2000);
      } finally {
        setIsLoading(false);
      }
    };
    fetchServiceDetails();
  }, [serviceId, navigate]);
  
  const handleRenameService = async (serviceData: { name: string, description: string }) => {
    if (!serviceToManage) return;
    try {
        const updatedService = await apiClient<Service>(`/services/${serviceToManage.service.id}`, { method: 'PUT', body: serviceData });
        setService(updatedService);
        setServiceToManage(null);
        alert("Service renamed successfully.");
    } catch(err: any) {
        alert(`Failed to rename service: ${err.message}`);
    }
  }

  const handleDeleteService = async () => {
    if (!serviceToManage) return;
    try {
        await apiClient(`/services/${serviceToManage.service.id}`, { method: 'DELETE' });
        setServiceToManage(null);
        alert("Service deleted successfully.");
        localStorage.removeItem('selectedService');
        navigate('/'); // Go back to selector
    } catch(err: any) {
        alert(`Failed to delete service: ${err.message}`);
    }
  }
  
  const breadcrumbs = service ? generateBreadcrumbs(location.pathname.replace(`/${serviceId}/`, ''), service.name) : [];
  
  if (isLoading) return <Loading />;
  if (error) return <div className="h-screen w-screen flex items-center justify-center text-red-500">{error} Redirecting...</div>;
  if (!service) return <Navigate to="/" />;

  return (
    <>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-950">
        <Sidebar 
          user={user}
          isOpen={isSidebarOpen} 
          setIsOpen={setSidebarOpen} 
        />
        <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
          <Navbar 
              onLogout={onLogout} 
              toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} 
              user={user}
              service={service}
              onManageService={setServiceToManage}
          />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            <Breadcrumbs items={breadcrumbs} />
            <div className="mt-6">
              <Outlet context={{ user, service }} />
            </div>
          </main>
        </div>
      </div>
      
      {serviceToManage?.action === 'rename' && (
        <ServiceFormModal
            isOpen={true}
            onClose={() => setServiceToManage(null)}
            onSave={handleRenameService}
            service={serviceToManage.service}
        />
      )}
       {serviceToManage?.action === 'delete' && (
        <DeleteServiceModal
            isOpen={true}
            onClose={() => setServiceToManage(null)}
            onConfirm={handleDeleteService}
            service={serviceToManage.service}
        />
      )}
    </>
  );
};

export default DashboardLayout;

export function useDashboardContext() {
  return useOutletContext<DashboardOutletContext>();
}
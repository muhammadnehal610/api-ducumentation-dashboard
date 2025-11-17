import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, Plus, Server, Search, MoreVertical, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiClient } from '../services/apiClient.ts';
import { User, Service } from '../types.ts';
import ServiceFormModal from '../components/modals/ServiceFormModal.tsx';
import DeleteServiceModal from '../components/modals/DeleteServiceModal.tsx';

interface ServiceListPageProps {
  user: User;
}

const ITEMS_PER_PAGE = 8;

const ServiceListPage: React.FC<ServiceListPageProps> = ({ user }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  
  const [serviceToManage, setServiceToManage] = useState<{ action: 'rename' | 'delete', service: Service } | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await apiClient<{ data: Service[] }>('/services');
      setServices(response.data.sort((a, b) => a.name.localeCompare(b.name)));
      if (response.data.length === 0 && user.role === 'frontend') {
        setError("No services configured. Please contact an administrator.");
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch services.');
    } finally {
      setIsLoading(false);
    }
  }, [user.role]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);
  
  const handleSelectService = (service: Service) => {
    navigate(`/${service.id}/dashboard`);
  };

  const handleSaveService = async (serviceData: { name: string, description: string }) => {
    try {
        if (serviceToManage?.action === 'rename') {
             await apiClient(`/services/${serviceToManage.service.id}`, { method: 'PUT', body: serviceData });
        } else {
             await apiClient('/services', { method: 'POST', body: serviceData });
        }
        fetchServices();
        setServiceToManage(null);
        setIsCreateModalOpen(false);
    } catch(err: any) {
        alert(`Failed to save service: ${err.message}`);
    }
  }

  const handleDeleteService = async () => {
    if (serviceToManage?.action !== 'delete') return;
    try {
        await apiClient(`/services/${serviceToManage.service.id}`, { method: 'DELETE' });
        fetchServices();
        setServiceToManage(null);
    } catch(err: any) {
        alert(`Failed to delete service: ${err.message}`);
    }
  }

  const filteredServices = useMemo(() =>
    services.filter(service =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase())
    ), [services, searchTerm]
  );

  const paginatedServices = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredServices.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredServices, currentPage]);

  const totalPages = Math.ceil(filteredServices.length / ITEMS_PER_PAGE);
  
  useEffect(() => {
      const handleClickOutside = () => setActiveMenu(null);
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-950 p-4">
      <div className="w-full max-w-4xl">
        <div className="flex justify-center mb-8">
            <div className="flex items-center">
                 <Book size={40} className="text-primary-500" />
                 <h1 className="text-4xl font-bold ml-3 text-gray-800 dark:text-gray-200">API Docs</h1>
            </div>
        </div>
        <div className="bg-white dark:bg-gray-900 shadow-xl rounded-lg p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Select a Service Workspace</h2>
              <p className="text-gray-500 dark:text-gray-400">Choose a service to open its documentation dashboard.</p>
            </div>
            {user.role === 'backend' && (
              <button onClick={() => setIsCreateModalOpen(true)} className="w-full sm:w-auto flex-shrink-0 flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg">
                <Plus size={18} className="mr-2" /> Create New Service
              </button>
            )}
          </div>
          
          <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="text" placeholder="Search services..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg"/>
          </div>

          {isLoading && <div className="text-center p-8">Loading...</div>}
          {error && <div className="text-center p-8 text-red-500">{error}</div>}

          {!isLoading && !error && (
            <div className="space-y-3 min-h-[300px]">
              {paginatedServices.map(service => (
                <div key={service.id} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-primary-100 dark:bg-primary-900/50 rounded-lg mr-4">
                        <Server className="text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-100">{service.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{service.description || 'No description'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleSelectService(service)} className="px-4 py-1.5 text-sm font-semibold bg-primary-500 hover:bg-primary-600 text-white rounded-md">Open</button>
                    {user.role === 'backend' && (
                      <div className="relative">
                          <button onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === service.id ? null : service.id); }} className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"><MoreVertical size={18} /></button>
                           {activeMenu === service.id && (
                            <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 border border-gray-200 dark:border-gray-700">
                                <button onClick={() => setServiceToManage({ action: 'rename', service })} className="w-full text-left flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <Edit size={14} className="mr-2"/> Rename
                                </button>
                                <button onClick={() => setServiceToManage({ action: 'delete', service })} className="w-full text-left flex items-center px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50">
                                    <Trash2 size={14} className="mr-2"/> Delete
                                </button>
                            </div>
                           )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
               {filteredServices.length === 0 && (
                <div className="text-center text-gray-500 py-12">No services found.</div>
              )}
            </div>
          )}
          
          {totalPages > 1 && (
             <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-sm">
                <span className="text-gray-600 dark:text-gray-400">Page {currentPage} of {totalPages}</span>
                <div className="flex items-center gap-2">
                    <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="p-2 disabled:opacity-50 flex items-center"><ChevronLeft size={16}/> Prev</button>
                    <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="p-2 disabled:opacity-50 flex items-center">Next <ChevronRight size={16}/></button>
                </div>
             </div>
          )}
        </div>
      </div>
      
      {/* Modals */}
      <ServiceFormModal 
        isOpen={isCreateModalOpen || serviceToManage?.action === 'rename'}
        onClose={() => { setIsCreateModalOpen(false); setServiceToManage(null); }}
        onSave={handleSaveService}
        service={serviceToManage?.action === 'rename' ? serviceToManage.service : null}
      />
      <DeleteServiceModal 
        isOpen={serviceToManage?.action === 'delete'}
        onClose={() => setServiceToManage(null)}
        onConfirm={handleDeleteService}
        service={serviceToManage?.action === 'delete' ? serviceToManage.service : null}
      />
    </div>
  );
};

export default ServiceListPage;

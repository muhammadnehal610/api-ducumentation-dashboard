import React, { useState, useEffect, useCallback } from 'react';
import { ChevronRight, Plus, Edit, Trash2, Search, ChevronLeft, Server } from 'lucide-react';
import { User } from '../../types.ts';
import Modal from '../../components/ui/Modal.tsx';
import { apiClient } from '../../services/apiClient.ts';

interface Service {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

interface ServiceManagementProps {
  onSelectService: (serviceName: string) => void;
  user: User;
}

const ITEMS_PER_PAGE = 10;

const ServiceManagement: React.FC<ServiceManagementProps> = ({ onSelectService, user }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);
  
  const fetchServices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
        const params = new URLSearchParams({
            page: currentPage.toString(),
            limit: ITEMS_PER_PAGE.toString(),
            search: debouncedSearchTerm,
        });
        const response = await apiClient<{ data: { services: Service[], total: number, page: number, totalPages: number } }>(`/modules?${params.toString()}`);
        setServices(response.data.services);
        setTotal(response.data.total);
        setTotalPages(response.data.totalPages);
        setCurrentPage(response.data.page);
    } catch (err: any) {
        setError(err.message || "Failed to fetch services.");
    } finally {
        setIsLoading(false);
    }
  }, [currentPage, debouncedSearchTerm]);
  
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);
  
  const notifySidebar = () => {
    window.dispatchEvent(new CustomEvent('servicesUpdated'));
  };

  const handleOpenModal = (service: Service | null) => {
    setEditingService(service);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
      setIsModalOpen(false);
      setEditingService(null);
  }
  
  const handleSaveService = async (serviceData: { name: string, description: string }) => {
      try {
          if (editingService) {
              await apiClient(`/modules/${editingService.id}`, { method: 'PUT', body: serviceData });
          } else {
              await apiClient('/modules', { method: 'POST', body: serviceData });
          }
          fetchServices();
          notifySidebar();
          handleCloseModal();
          // Ideally, show a success toast here
      } catch (err: any) {
          alert(`Failed to save service: ${err.message}`);
      }
  }

  const handleDelete = async (e: React.MouseEvent, service: Service) => {
    e.stopPropagation();
    if (window.confirm(`Deleting the "${service.name}" service will delete all related data (endpoints, schemas). This action cannot be undone. Are you sure?`)) {
        try {
            await apiClient(`/modules/${service.id}`, { method: 'DELETE' });
            fetchServices();
            notifySidebar();
        } catch (err: any) {
            alert(`Failed to delete service: ${err.message}`);
        }
    }
  }
  
  const Pagination = () => (
    <div className="flex justify-between items-center mt-4 px-6 pb-4 text-sm">
      <div>
        <span className="text-gray-600 dark:text-gray-400">
          Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, total)} to {Math.min(currentPage * ITEMS_PER_PAGE, total)} of {total} results
        </span>
      </div>
      <div className="flex items-center">
        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1 || isLoading} className="p-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"><ChevronLeft size={16}/></button>
        <span className="px-2">Page {currentPage} of {totalPages}</span>
        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0 || isLoading} className="p-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"><ChevronRight size={16}/></button>
      </div>
    </div>
  );

  if (user.role === 'frontend') {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">API Services</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                Browse endpoints grouped by their service.
            </p>
            {isLoading ? (<div>Loading services...</div>) : error ? (<div className="text-red-500">{error}</div>) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map(service => (
                    <div key={service.id} onClick={() => onSelectService(service.name)}
                        className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 flex items-center justify-between cursor-pointer hover:shadow-lg hover:border-primary-500 dark:hover:border-primary-500 transition-all">
                        <div className="flex items-center">
                        <div className="p-3 bg-primary-100 dark:bg-gray-800 rounded-lg mr-4">
                            <Server className="text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{service.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">View Endpoints</p>
                        </div>
                        </div>
                        <ChevronRight className="text-gray-400 group-hover:text-primary-500 transition-colors" />
                    </div>
                    ))}
                </div>
            )}
        </div>
    );
  }

  // Backend developer view
  return (
    <div>
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
            <div>
                <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Service Management</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                    Create, edit, and delete API services and their related data.
                </p>
            </div>
             <button onClick={() => handleOpenModal(null)}
                className="flex items-center bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg w-full sm:w-auto mt-4 sm:mt-0">
                <Plus size={18} className="mr-2"/>
                Create New Service
            </button>
        </div>
        
        <div className="mb-6 relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input type="text" placeholder="Search by service name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>

        {error && <p className="text-center text-red-500 p-4">{error}</p>}
        <div className="overflow-x-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm">
            {isLoading ? (<div className="p-8 text-center">Loading services...</div>) : (
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Service Name</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created At</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Updated At</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        {services.map(service => (
                        <tr key={service.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td onClick={() => onSelectService(service.name)} className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white cursor-pointer">{service.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(service.createdAt).toLocaleString()}</td>
                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(service.updatedAt).toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button onClick={() => handleOpenModal(service)} className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 mr-4"><Edit size={18}/></button>
                                <button onClick={(e) => handleDelete(e, service)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"><Trash2 size={18}/></button>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                </table>
            )}
             {!isLoading && services.length === 0 && (
                <div className="text-center p-8 text-gray-500">
                    No services found.
                </div>
            )}
        </div>
        {total > 0 && <Pagination />}


        <ServiceFormModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSaveService} service={editingService} />
    </div>
  );
};

const ServiceFormModal: React.FC<{
    isOpen: boolean; onClose: () => void; onSave: (data: {name: string, description: string}) => void; service: Service | null;
}> = ({isOpen, onClose, onSave, service}) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    React.useEffect(() => {
        if(isOpen) {
            setName(service?.name || '');
            setDescription(service?.description || '');
        }
    }, [isOpen, service]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ name, description });
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={service ? 'Edit Service' : 'Create New Service'}>
             <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Service Name</label>
                    <input type="text" placeholder="e.g., User Service" value={name} onChange={e => setName(e.target.value)}
                     className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md" required />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                    <textarea placeholder="Endpoints related to user management." rows={3} value={description} onChange={e => setDescription(e.target.value)}
                     className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md"></textarea>
                </div>
                <div className="flex justify-end pt-4">
                    <button type="button" onClick={onClose} className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">Cancel</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">Save Service</button>
                </div>
            </form>
        </Modal>
    )
}

export default ServiceManagement;

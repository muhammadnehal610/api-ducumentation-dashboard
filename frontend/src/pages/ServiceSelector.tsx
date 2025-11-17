import React, { useState, useEffect } from 'react';
import { Book, Plus, Server } from 'lucide-react';
import { apiClient } from '../services/apiClient.ts';
import { User, Service } from '../types.ts';
import Modal from '../components/ui/Modal.tsx';

interface ServiceSelectorProps {
  onSelectService: (service: Service) => void;
  user: User;
}

const ServiceSelector: React.FC<ServiceSelectorProps> = ({ onSelectService, user }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchServices = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await apiClient<{ data: Service[] }>('/services');
      setServices(response.data);
      if (response.data.length === 0 && user.role === 'frontend') {
        setError("No services have been configured yet. Please contact a backend developer.");
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch services.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSelect = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      onSelectService(service);
    }
  };
  
  const handleSaveService = async (serviceData: { name: string, description: string }) => {
    try {
        const response = await apiClient<{ data: Service }>('/services', { method: 'POST', body: serviceData });
        fetchServices(); // Refresh list
        setIsModalOpen(false);
        // Automatically select the new service
        onSelectService(response.data);
    } catch (err: any) {
        alert(`Failed to create service: ${err.message}`);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
            <div className="flex items-center">
                 <Book size={40} className="text-primary-500" />
                 <h1 className="text-4xl font-bold ml-3 text-gray-800 dark:text-gray-200">API Docs</h1>
            </div>
        </div>
        <div className="bg-white dark:bg-gray-900 shadow-xl rounded-lg p-8">
          <div className="text-center">
            <Server size={48} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-200">Select a Service</h2>
            <p className="text-center text-gray-500 dark:text-gray-400 mb-6">Choose a service workspace to continue.</p>
          </div>
          
          {isLoading && <p className="text-center">Loading services...</p>}
          {error && <p className="text-red-500 text-center text-sm mb-4">{error}</p>}

          {!isLoading && !error && services.length > 0 && (
             <select 
                onChange={(e) => handleSelect(e.target.value)}
                defaultValue=""
                className="w-full px-4 py-3 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="" disabled>-- Choose a service --</option>
                {services.map(service => (
                    <option key={service.id} value={service.id}>{service.name}</option>
                ))}
             </select>
          )}

          {user.role === 'backend' && (
            <>
              <div className="flex items-center my-6">
                  <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
                  <span className="flex-shrink mx-4 text-gray-500 dark:text-gray-400 text-sm">OR</span>
                  <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors"
              >
                <Plus size={20} className="mr-2" />
                Create New Service
              </button>
            </>
          )}
        </div>
      </div>
       {user.role === 'backend' && (
            <ServiceFormModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveService}
            />
       )}
    </div>
  );
};


const ServiceFormModal: React.FC<{
    isOpen: boolean; onClose: () => void; onSave: (data: {name: string, description: string}) => void;
}> = ({isOpen, onClose, onSave}) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ name, description });
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Service">
             <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Service Name</label>
                    <input type="text" placeholder="e.g., E-Commerce API" value={name} onChange={e => setName(e.target.value)}
                     className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md" required />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                    <textarea placeholder="A short description of this service." rows={3} value={description} onChange={e => setDescription(e.target.value)}
                     className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md"></textarea>
                </div>
                <div className="flex justify-end pt-4">
                    <button type="button" onClick={onClose} className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">Cancel</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">Create Service</button>
                </div>
            </form>
        </Modal>
    )
}

export default ServiceSelector;
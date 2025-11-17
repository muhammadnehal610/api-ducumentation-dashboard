import React, { useState } from 'react';
import { Search, Bell, Settings, User, LogOut, Menu, MoreVertical, Edit, Trash2, Repeat } from 'lucide-react';
// FIX: Changed alias import to relative path with extension for module resolution.
import { User as UserType, Service } from '../../types.ts';
import { apiClient } from '../../services/apiClient.ts';
import Modal from '../ui/Modal.tsx';


interface NavbarProps {
  onLogout: () => void;
  toggleSidebar: () => void;
  user: UserType;
  service: Service;
  onSwitchService: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onLogout, toggleSidebar, user, service, onSwitchService }) => {
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);

  const handleDeleteService = async () => {
    if (window.confirm(`Deleting the "${service.name}" service will delete all related data. This action cannot be undone. Are you sure?`)) {
        try {
            await apiClient(`/services/${service.id}`, { method: 'DELETE' });
            onSwitchService(); // Go back to selector
        } catch (err: any) {
            alert(`Failed to delete service: ${err.message}`);
        }
    }
  }

  const handleSaveService = async (serviceData: { name: string, description: string }) => {
    try {
        await apiClient(`/services/${service.id}`, { method: 'PUT', body: serviceData });
        // Optionally refresh service data globally, for now we just close
        setIsServiceModalOpen(false);
        alert("Service updated successfully. The name will update on next service selection.");
    } catch (err: any) {
        alert(`Failed to update service: ${err.message}`);
    }
  }

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={toggleSidebar} className="lg:hidden text-gray-500 dark:text-gray-400 mr-4">
            <Menu size={24} />
          </button>
          
          <div className="relative group">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{service.name}</h2>
            {user.role === 'backend' && (
              <div className="absolute top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 invisible group-hover:visible z-10">
                <button onClick={() => setIsServiceModalOpen(true)} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Edit size={14} className="mr-2" /> Edit Service
                </button>
                 <button onClick={onSwitchService} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Repeat size={14} className="mr-2" /> Switch Service
                </button>
                <button onClick={handleDeleteService} className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50">
                  <Trash2 size={14} className="mr-2" /> Delete Service
                </button>
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
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 invisible group-hover:visible">
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
       {user.role === 'backend' && (
            <ServiceFormModal 
                isOpen={isServiceModalOpen}
                onClose={() => setIsServiceModalOpen(false)}
                onSave={handleSaveService}
                service={service}
            />
       )}
    </header>
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
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">Save Service</button>
                </div>
            </form>
        </Modal>
    )
}

export default Navbar;
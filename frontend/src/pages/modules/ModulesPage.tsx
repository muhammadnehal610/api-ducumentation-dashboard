import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, ChevronRight, Plus, Edit, Trash2 } from 'lucide-react';
import { User, Module } from '../../types.ts';
import Modal from '../../components/ui/Modal.tsx';
import { apiClient } from '../../services/apiClient.ts';
import { useDashboardContext } from '../../components/layout/DashboardLayout.tsx';

const ModulesPage: React.FC = () => {
  const { user } = useDashboardContext();
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();

  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);

  const isBackend = user.role === 'backend';

  const fetchModules = useCallback(async () => {
    if (!serviceId) return;
    setIsLoading(true);
    setError(null);
    try {
        const response = await apiClient<{ data: Module[] }>(`/modules?serviceId=${serviceId}`);
        setModules(response.data);
    } catch (err: any) {
        setError(err.message || "Failed to fetch modules.");
    } finally {
        setIsLoading(false);
    }
  }, [serviceId]);
  
  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  const handleOpenModal = (module: Module | null) => {
    setEditingModule(module);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
      setIsModalOpen(false);
      setEditingModule(null);
  }
  
  const handleSaveModule = async (moduleData: { name: string, description: string }) => {
      try {
          if (editingModule) {
              await apiClient(`/modules/${editingModule.id}`, { method: 'PUT', body: moduleData });
          } else {
              await apiClient('/modules', { method: 'POST', body: { ...moduleData, serviceId } });
          }
          fetchModules();
          handleCloseModal();
      } catch (err: any) {
          alert(`Failed to save module: ${err.message}`);
      }
  }

  const handleDelete = async (module: Module) => {
    if (window.confirm(`Are you sure you want to delete the "${module.name}" module and all its endpoints?`)) {
        try {
            await apiClient(`/modules/${module.id}`, { method: 'DELETE' });
            fetchModules();
        } catch (err: any) {
            alert(`Failed to delete module: ${err.message}`);
        }
    }
  }

  return (
    <div>
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
            <div>
                <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Modules</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                    Browse endpoints grouped by their module.
                </p>
            </div>
            {isBackend && (
                 <button onClick={() => handleOpenModal(null)}
                    className="flex items-center bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg w-full sm:w-auto mt-4 sm:mt-0">
                    <Plus size={18} className="mr-2"/>
                    Create New Module
                </button>
            )}
        </div>
        
        {isLoading ? (<div>Loading modules...</div>) : error ? (<div className="text-red-500">{error}</div>) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modules.map(module => (
                <div key={module.id} 
                    className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 flex items-center justify-between hover:shadow-lg hover:border-primary-500 dark:hover:border-primary-500 transition-all">
                    <div onClick={() => navigate(`/${serviceId}/modules/${module.id}`)} className="flex items-center cursor-pointer flex-grow overflow-hidden">
                        <div className="p-3 bg-primary-100 dark:bg-gray-800 rounded-lg mr-4">
                            <Box className="text-primary-600 dark:text-primary-400" />
                        </div>
                        <div className="flex-grow">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{module.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">View Endpoints</p>
                        </div>
                    </div>
                    <div className="flex items-center flex-shrink-0">
                        <ChevronRight className="text-gray-400 group-hover:text-primary-500 transition-colors" />
                        {isBackend && (
                             <div className="flex items-center ml-2 border-l border-gray-200 dark:border-gray-700 pl-2">
                                <button onClick={() => handleOpenModal(module)} className="text-gray-400 hover:text-primary-500 p-1"><Edit size={16} /></button>
                                <button onClick={() => handleDelete(module)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={16} /></button>
                            </div>
                        )}
                    </div>
                </div>
                ))}
                 {modules.length === 0 && (
                    <div className="col-span-full text-center p-8 text-gray-500 dark:text-gray-400">
                        No modules created yet for this service.
                    </div>
                )}
            </div>
        )}
        <ModuleFormModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSaveModule} module={editingModule} />
    </div>
  );
};

const ModuleFormModal: React.FC<{
    isOpen: boolean; onClose: () => void; onSave: (data: {name: string, description: string}) => void; module: Module | null;
}> = ({isOpen, onClose, onSave, module}) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    React.useEffect(() => {
        if(isOpen) {
            setName(module?.name || '');
            setDescription(module?.description || '');
        }
    }, [isOpen, module]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ name, description });
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={module ? 'Edit Module' : 'Create New Module'}>
             <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Module Name</label>
                    <input type="text" placeholder="e.g., User Management" value={name} onChange={e => setName(e.target.value)}
                     className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md" required />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                    <textarea placeholder="Endpoints related to users." rows={3} value={description} onChange={e => setDescription(e.target.value)}
                     className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md"></textarea>
                </div>
                <div className="flex justify-end pt-4">
                    <button type="button" onClick={onClose} className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">Cancel</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">Save Module</button>
                </div>
            </form>
        </Modal>
    )
}

export default ModulesPage;

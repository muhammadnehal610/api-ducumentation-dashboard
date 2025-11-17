import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Briefcase, ChevronRight, Plus, Edit, Trash2, Search, ChevronLeft } from 'lucide-react';
// FIX: Changed alias imports to relative paths with extensions for module resolution.
import { User } from '../../types.ts';
import Modal from '../../components/ui/Modal.tsx';
import { apiClient } from '../../services/apiClient.ts';

interface Module {
    id: string;
    name: string;
    description?: string;
}

interface ModulesProps {
  onSelectModule: (moduleName: string) => void;
  user: User;
}

const ITEMS_PER_PAGE = 5;

const Modules: React.FC<ModulesProps> = ({ onSelectModule, user }) => {
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  const fetchModules = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
        const response = await apiClient<{ data: Module[] }>('/modules');
        setModules(response.data);
    } catch (err: any) {
        setError(err.message || "Failed to fetch modules.");
    } finally {
        setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  const filteredModules = useMemo(() => {
    return modules.filter(m => 
        m.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [modules, searchTerm]);

  const totalPages = Math.ceil(filteredModules.length / ITEMS_PER_PAGE);
  const paginatedModules = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredModules.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredModules, currentPage]);


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
              await apiClient('/modules', { method: 'POST', body: moduleData });
          }
          fetchModules();
          handleCloseModal();
      } catch (err: any) {
          alert(`Failed to save module: ${err.message}`);
      }
  }

  const handleDelete = async (e: React.MouseEvent, module: Module) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete the "${module.name}" module?`)) {
        try {
            await apiClient(`/modules/${module.id}`, { method: 'DELETE' });
            fetchModules();
        } catch (err: any) {
            alert(`Failed to delete module: ${err.message}`);
        }
    }
  }
  
  const Pagination = () => (
    <div className="flex justify-end items-center mt-4 text-sm">
        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 disabled:opacity-50"><ChevronLeft size={16}/></button>
        <span>Page {currentPage} of {totalPages}</span>
        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="p-2 disabled:opacity-50"><ChevronRight size={16}/></button>
    </div>
  );

  if (isLoading) return <div>Loading modules...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  if (user.role === 'frontend') {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">API Modules</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                Browse endpoints grouped by their service module.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modules.map(module => (
                <div key={module.id} onClick={() => onSelectModule(module.name)}
                    className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 flex items-center justify-between cursor-pointer hover:shadow-lg hover:border-primary-500 dark:hover:border-primary-500 transition-all">
                    <div className="flex items-center">
                    <div className="p-3 bg-primary-100 dark:bg-gray-800 rounded-lg mr-4">
                        <Briefcase className="text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{module.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">View Endpoints</p>
                    </div>
                    </div>
                    <ChevronRight className="text-gray-400 group-hover:text-primary-500 transition-colors" />
                </div>
                ))}
            </div>
        </div>
    );
  }

  // Backend developer view
  return (
    <div>
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
            <div>
                <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Manage Modules</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                    Create, edit, and delete API modules.
                </p>
            </div>
             <button onClick={() => handleOpenModal(null)}
                className="flex items-center bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg w-full sm:w-auto mt-4 sm:mt-0">
                <Plus size={18} className="mr-2"/>
                Add Module
            </button>
        </div>
        
        <div className="mb-6 relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input type="text" placeholder="Search modules..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>

        <div className="overflow-x-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Module Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                 <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {paginatedModules.map(module => (
                    <tr key={module.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td onClick={() => onSelectModule(module.name)} className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white cursor-pointer">{module.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">{module.description || `A collection of endpoints related to ${module.name.toLowerCase()}.`}</td>
                         <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button onClick={() => handleOpenModal(module)} className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 mr-4"><Edit size={18}/></button>
                            <button onClick={(e) => handleDelete(e, module)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"><Trash2 size={18}/></button>
                        </td>
                    </tr>
                    ))}
                 </tbody>
            </table>
        </div>
        {filteredModules.length > 0 && <Pagination />}


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
        <Modal isOpen={isOpen} onClose={onClose} title={module ? 'Edit Module' : 'Create Module'}>
             <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Module Name</label>
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
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">Save Module</button>
                </div>
            </form>
        </Modal>
    )
}

export default Modules;
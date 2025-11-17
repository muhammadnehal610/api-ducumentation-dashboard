import React, { useState, useMemo } from 'react';
import { schemas as initialSchemas } from '../../constants/dummyData';
import { User, Schema } from '../../types';
import { Plus, Edit, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import Modal from '../../components/ui/Modal';

interface ModelsProps {
    user: User;
    onSelectModel: (modelName: string) => void;
}

const ITEMS_PER_PAGE = 10;

const Models: React.FC<ModelsProps> = ({ user, onSelectModel }) => {
    const [schemas, setSchemas] = useState(initialSchemas);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSchema, setEditingSchema] = useState<Schema | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const isBackend = user.role === 'backend';

    const totalPages = Math.ceil(schemas.length / ITEMS_PER_PAGE);
    const paginatedSchemas = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return schemas.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [schemas, currentPage]);

    const handleOpenModal = (schema: Schema | null) => {
        setEditingSchema(schema);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingSchema(null);
    };

    const handleSave = (schemaData: { name: string, description: string }) => {
        if (editingSchema) {
            setSchemas(schemas.map(s => s.name === editingSchema.name ? { ...s, ...schemaData } : s));
        } else {
            setSchemas([...schemas, { ...schemaData, fields: [] }]);
        }
        handleCloseModal();
    };

    const handleDelete = (schemaName: string) => {
        if (window.confirm(`Are you sure you want to delete the model "${schemaName}"? This will delete all its fields.`)) {
            setSchemas(schemas.filter(s => s.name !== schemaName));
        }
    };

    const Pagination = () => (
        <div className="flex justify-between items-center mt-4 px-6 pb-4 text-sm">
            <div>
                <span className="text-gray-600 dark:text-gray-400">
                    Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, schemas.length)} to {Math.min(currentPage * ITEMS_PER_PAGE, schemas.length)} of {schemas.length} results
                </span>
            </div>
            <div className="flex items-center">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"><ChevronLeft size={16}/></button>
                <span className="px-2">Page {currentPage} of {totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"><ChevronRight size={16}/></button>
            </div>
        </div>
    );

    return (
        <div>
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Schemas / Models</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        High-level data models used across the API.
                    </p>
                </div>
                {isBackend && (
                    <button
                        onClick={() => handleOpenModal(null)}
                        className="flex items-center bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg w-full sm:w-auto mt-4 sm:mt-0"
                    >
                        <Plus size={18} className="mr-2" /> Add New Model
                    </button>
                )}
            </div>

            <div className="overflow-x-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Model Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                        {paginatedSchemas.map(schema => (
                            <tr key={schema.name}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{schema.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{schema.description}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => onSelectModel(schema.name)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mr-4 inline-flex items-center"><Eye size={16} className="mr-1"/> View Schemas</button>
                                    {isBackend && (
                                        <>
                                            <button onClick={() => handleOpenModal(schema)} className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 mr-4"><Edit size={16}/></button>
                                            <button onClick={() => handleDelete(schema.name)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"><Trash2 size={16}/></button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {paginatedSchemas.length > 0 && <Pagination />}
            </div>
             {isBackend && (
                <ModelFormModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                    editingSchema={editingSchema}
                />
            )}
        </div>
    );
};


interface ModelFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { name: string, description: string }) => void;
    editingSchema: Schema | null;
}

const ModelFormModal: React.FC<ModelFormModalProps> = ({ isOpen, onClose, onSave, editingSchema }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    React.useEffect(() => {
        if (isOpen) {
            setName(editingSchema?.name || '');
            setDescription(editingSchema?.description || '');
        }
    }, [isOpen, editingSchema]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ name, description });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={editingSchema ? 'Edit Model' : 'Create New Model'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Model Name</label>
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g., User" className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md" required />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="A brief description of the model." className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md"></textarea>
                </div>
                <div className="flex justify-end pt-4">
                    <button type="button" onClick={onClose} className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">Cancel</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">Save Model</button>
                </div>
            </form>
        </Modal>
    );
};

export default Models;

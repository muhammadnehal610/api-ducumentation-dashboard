import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { User, Schema } from '../../types.ts';
import { Plus, Edit, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import Modal from '../../components/ui/Modal.tsx';
import { apiClient } from '../../services/apiClient.ts';
import { useDashboardContext } from '../../components/layout/DashboardLayout.tsx';

const ITEMS_PER_PAGE = 10;

const SchemasPage: React.FC = () => {
    const { user } = useDashboardContext();
    const { serviceId } = useParams<{ serviceId: string }>();
    const navigate = useNavigate();

    const [schemas, setSchemas] = useState<Schema[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSchema, setEditingSchema] = useState<Schema | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const isBackend = user.role === 'backend';

    const fetchSchemas = useCallback(async () => {
        if (!serviceId) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiClient<{ data: Schema[] }>(`/schemas?serviceId=${serviceId}`);
            setSchemas(response.data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch schemas.');
        } finally {
            setIsLoading(false);
        }
    }, [serviceId]);

    useEffect(() => {
        fetchSchemas();
    }, [fetchSchemas]);

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

    const handleSave = async (schemaData: { name: string, description?: string }) => {
        // This modal is only for editing name/description
        if (!editingSchema) return;
        try {
            await apiClient(`/schemas/${editingSchema.id}`, { method: 'PUT', body: schemaData });
            fetchSchemas();
            handleCloseModal();
        } catch(err: any) {
            alert(`Failed to save model: ${err.message}`);
        }
    };

    const handleDelete = async (schemaId: string, schemaName: string) => {
        if (window.confirm(`Are you sure you want to delete the model "${schemaName}"? This will delete all its fields.`)) {
            try {
                await apiClient(`/schemas/${schemaId}`, { method: 'DELETE' });
                fetchSchemas();
            } catch(err: any) {
                alert(`Failed to delete model: ${err.message}`);
            }
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
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 disabled:opacity-50"><ChevronLeft size={16}/></button>
                <span className="px-2">Page {currentPage} of {totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="p-2 disabled:opacity-50"><ChevronRight size={16}/></button>
            </div>
        </div>
    );

    return (
        <div>
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Schemas / Models</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">High-level data models used across the API.</p>
                </div>
                {isBackend && (
                    <button onClick={() => navigate(`/${serviceId}/schemas/create`)}
                        className="flex items-center bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg w-full sm:w-auto mt-4 sm:mt-0"
                    >
                        <Plus size={18} className="mr-2" /> Add New Model
                    </button>
                )}
            </div>

            {error && <p className="text-center text-red-500 mb-4">{error}</p>}
            <div className="overflow-x-auto bg-white dark:bg-gray-900 border rounded-lg shadow-sm">
                {isLoading ? (<div className="text-center p-8">Loading models...</div>) : (
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Model Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Description</th>
                                <th className="px-6 py-3 text-right text-xs font-medium uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                            {paginatedSchemas.map(schema => (
                                <tr key={schema.id}>
                                    <td className="px-6 py-4">{schema.name}</td>
                                    <td className="px-6 py-4">{schema.description}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => navigate(`/${serviceId}/schemas/${schema.id}`)} className="text-blue-600 mr-4 inline-flex items-center"><Eye size={16} className="mr-1"/> View</button>
                                        {isBackend && (
                                            <>
                                                <button onClick={() => handleOpenModal(schema)} className="text-primary-600 mr-4"><Edit size={16}/></button>
                                                <button onClick={() => handleDelete(schema.id, schema.name)} className="text-red-600"><Trash2 size={16}/></button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                {!isLoading && paginatedSchemas.length > 0 && <Pagination />}
            </div>
             {isBackend && (
                <ModelFormModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSave} editingSchema={editingSchema} />
            )}
        </div>
    );
};


const ModelFormModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (data: { name: string, description?: string }) => void; editingSchema: Schema | null; }> = ({ isOpen, onClose, onSave, editingSchema }) => {
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
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Model">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label>Model Name</label>
                    <input value={name} onChange={e => setName(e.target.value)} className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-800 border rounded-md" required />
                </div>
                 <div>
                    <label>Description</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-800 border rounded-md"></textarea>
                </div>
                <div className="flex justify-end pt-4">
                    <button type="button" onClick={onClose} className="mr-2 px-4 py-2 rounded-md">Cancel</button>
                    <button type="submit" className="px-4 py-2 text-white bg-primary-600 rounded-md">Save Changes</button>
                </div>
            </form>
        </Modal>
    );
};

export default SchemasPage;

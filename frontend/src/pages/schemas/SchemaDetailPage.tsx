import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { User, SchemaField, Schema } from '../../types.ts';
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import Modal from '../../components/ui/Modal.tsx';
import Switch from '../../components/ui/Switch.tsx';
import { apiClient } from '../../services/apiClient.ts';
import { useDashboardContext } from '../../components/layout/DashboardLayout.tsx';
import Loading from '../../components/ui/Loading.tsx';

const ITEMS_PER_PAGE = 10;

const SchemaDetailPage: React.FC = () => {
    const { user } = useDashboardContext();
    const { schemaId } = useParams<{ schemaId: string }>();

    const [schema, setSchema] = useState<Schema | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingField, setEditingField] = useState<SchemaField | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    
    const isBackend = user.role === 'backend';

    const fetchSchema = useCallback(async () => {
        if (!schemaId) return;
        setIsLoading(true);
        try {
            const response = await apiClient<{ data: Schema }>(`/schemas/${schemaId}`);
            setSchema(response.data);
        } catch (err: any) {
            setError(err.message || `Failed to fetch schema`);
        } finally {
            setIsLoading(false);
        }
    }, [schemaId]);

    useEffect(() => {
        fetchSchema();
    }, [fetchSchema]);

    const modelFields = useMemo(() => schema?.fields || [], [schema]);

    const totalPages = Math.ceil(modelFields.length / ITEMS_PER_PAGE);
    const paginatedFields = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return modelFields.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [modelFields, currentPage]);

    const handleOpenModal = (field: SchemaField | null) => {
        setEditingField(field);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingField(null);
    };

    const handleSave = async (fieldData: Omit<SchemaField, 'id'>) => {
        if (!schemaId) return;
        try {
            if (editingField) {
                await apiClient(`/schemas/${schemaId}/fields/${editingField.id}`, { method: 'PUT', body: fieldData });
            } else {
                await apiClient(`/schemas/${schemaId}/fields`, { method: 'POST', body: fieldData });
            }
            fetchSchema();
            handleCloseModal();
        } catch (err: any) {
            alert(`Failed to save field: ${err.message}`);
        }
    };

    const handleDelete = async (fieldId: string) => {
        if (!schemaId) return;
        if (window.confirm(`Are you sure you want to delete this field?`)) {
            try {
                await apiClient(`/schemas/${schemaId}/fields/${fieldId}`, { method: 'DELETE' });
                fetchSchema();
            } catch (err: any) {
                alert(`Failed to delete field: ${err.message}`);
            }
        }
    };

    const Pagination = () => (
        <div className="flex justify-between items-center mt-4 px-6 pb-4 text-sm">
            <div>
                <span className="text-gray-600 dark:text-gray-400">
                    Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, modelFields.length)} to {Math.min(currentPage * ITEMS_PER_PAGE, modelFields.length)} of {modelFields.length} results
                </span>
            </div>
            <div className="flex items-center">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 disabled:opacity-50"><ChevronLeft size={16}/></button>
                <span className="px-2">Page {currentPage} of {totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="p-2 disabled:opacity-50"><ChevronRight size={16}/></button>
            </div>
        </div>
    );
    
    if (isLoading) return <Loading />;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div>
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Schema: {schema?.name}</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">{schema?.description}</p>
                </div>
                {isBackend && (
                    <button onClick={() => handleOpenModal(null)}
                        className="flex items-center bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg w-full sm:w-auto mt-4 sm:mt-0">
                        <Plus size={18} className="mr-2" /> Add New Field
                    </button>
                )}
            </div>

            <div className="overflow-x-auto bg-white dark:bg-gray-900 border rounded-lg shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Field Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Required</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Constraints</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Description</th>
                            {isBackend && <th className="px-6 py-3 text-right text-xs font-medium uppercase">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                        {paginatedFields.map(field => (
                            <tr key={field.id}>
                                <td className="px-6 py-4 font-mono">{field.name}</td>
                                <td className="px-6 py-4 font-mono">{field.type}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 inline-flex text-xs font-semibold rounded-full ${field.required ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {field.required ? 'Yes' : 'No'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">{field.constraints}</td>
                                <td className="px-6 py-4">{field.description}</td>
                                {isBackend && (
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => handleOpenModal(field)} className="text-primary-600 mr-4"><Edit size={16}/></button>
                                        <button onClick={() => handleDelete(field.id)} className="text-red-600"><Trash2 size={16}/></button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {paginatedFields.length > 0 && <Pagination />}
            </div>

            {isBackend && (
                <SchemaFieldFormModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSave} editingField={editingField} />
            )}
        </div>
    );
};


const SchemaFieldFormModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (fieldData: Omit<SchemaField, 'id'>) => void; editingField: SchemaField | null; }> = ({ isOpen, onClose, onSave, editingField }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState('string');
    const [required, setRequired] = useState(false);
    const [constraints, setConstraints] = useState('');
    const [description, setDescription] = useState('');
    
    const fieldTypes = ['string', 'integer', 'boolean', 'datetime', 'uuid', 'enum', 'object', 'array'];

    React.useEffect(() => {
        if (isOpen) {
            setName(editingField?.name || '');
            setType(editingField?.type || 'string');
            setRequired(editingField?.required || false);
            setConstraints(editingField?.constraints || '');
            setDescription(editingField?.description || '');
        }
    }, [isOpen, editingField]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ name, type, required, constraints, description });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={editingField ? 'Edit Field' : 'Create Field'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                    <label>Field Name</label>
                    <input value={name} onChange={e => setName(e.target.value)} className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-800 border rounded-md" required />
                </div>
                 <div>
                    <label>Field Type</label>
                    <select value={type} onChange={e => setType(e.target.value)} className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-800 border rounded-md">
                        {fieldTypes.map(t => <option key={t}>{t}</option>)}
                    </select>
                </div>
                 <div>
                    <label>Validation Rules</label>
                    <input value={constraints} onChange={e => setConstraints(e.target.value)} className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-800 border rounded-md" />
                </div>
                 <div>
                    <label>Description</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-800 border rounded-md"></textarea>
                </div>
                <div className="flex items-center space-x-2">
                    <Switch id="required-switch" checked={required} onChange={setRequired} />
                    <label htmlFor="required-switch">Required</label>
                </div>
                <div className="flex justify-end pt-4">
                    <button type="button" onClick={onClose} className="mr-2 px-4 py-2 rounded-md">Cancel</button>
                    <button type="submit" className="px-4 py-2 text-white bg-primary-600 rounded-md">Save Field</button>
                </div>
            </form>
        </Modal>
    );
};

export default SchemaDetailPage;

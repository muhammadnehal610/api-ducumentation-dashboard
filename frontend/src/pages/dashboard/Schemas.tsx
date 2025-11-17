import React, { useState, useMemo } from 'react';
// FIX: Changed alias imports to relative paths with extensions for module resolution.
import { schemas as initialSchemas } from '../../constants/dummyData.ts';
import { User, SchemaField } from '../../types.ts';
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import Modal from '../../components/ui/Modal.tsx';
import Switch from '../../components/ui/Switch.tsx';

interface SchemasProps {
    user: User;
    modelName: string;
}

const ITEMS_PER_PAGE = 10;

const Schemas: React.FC<SchemasProps> = ({ user, modelName }) => {
    const [schemas, setSchemas] = useState(initialSchemas);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingField, setEditingField] = useState<SchemaField | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    
    const isBackend = user.role === 'backend';

    const modelFields = useMemo(() => {
        const model = schemas.find(s => s.name === modelName);
        return model ? model.fields : [];
    }, [schemas, modelName]);

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

    const handleSave = (fieldData: Omit<SchemaField, 'id'>) => {
        setSchemas(prevSchemas => {
            return prevSchemas.map(schema => {
                if (schema.name === modelName) {
                    let newFields;
                    if (editingField) { // Editing existing field
                        newFields = schema.fields.map(f => f.id === editingField.id ? { ...editingField, ...fieldData } : f);
                    } else { // Adding new field
                        const newField = { ...fieldData, id: `field_${Date.now()}` };
                        newFields = [...schema.fields, newField];
                    }
                    return { ...schema, fields: newFields };
                }
                return schema;
            });
        });
        handleCloseModal();
    };

    const handleDelete = (fieldId: string) => {
        if (window.confirm(`Are you sure you want to delete this field?`)) {
            setSchemas(prevSchemas => {
                return prevSchemas.map(schema => {
                     if (schema.name === modelName) {
                         return { ...schema, fields: schema.fields.filter(f => f.id !== fieldId) };
                     }
                     return schema;
                });
            });
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
                    <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Schema: {modelName}</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Fields for the <span className="font-semibold">{modelName}</span> model.
                    </p>
                </div>
                {isBackend && (
                    <button
                        onClick={() => handleOpenModal(null)}
                        className="flex items-center bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg w-full sm:w-auto mt-4 sm:mt-0"
                    >
                        <Plus size={18} className="mr-2" /> Add New Field
                    </button>
                )}
            </div>

            <div className="overflow-x-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Field Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Field Type</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Required</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Validation Rules</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                            {isBackend && <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                        {paginatedFields.map(field => (
                            <tr key={field.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100 font-mono">{field.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-mono">{field.type}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${field.required ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                                        {field.required ? 'Yes' : 'No'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{field.constraints}</td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{field.description}</td>
                                {isBackend && (
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleOpenModal(field)} className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 mr-4"><Edit size={16}/></button>
                                        <button onClick={() => handleDelete(field.id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"><Trash2 size={16}/></button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {paginatedFields.length > 0 && <Pagination />}
            </div>

            {isBackend && (
                <SchemaFieldFormModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                    editingField={editingField}
                />
            )}
        </div>
    );
};


interface SchemaFieldFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (fieldData: Omit<SchemaField, 'id'>) => void;
    editingField: SchemaField | null;
}

const SchemaFieldFormModal: React.FC<SchemaFieldFormModalProps> = ({ isOpen, onClose, onSave, editingField }) => {
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Field Name</label>
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g., first_name" className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md" required />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Field Type</label>
                    <select value={type} onChange={e => setType(e.target.value)} className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md">
                        {fieldTypes.map(t => <option key={t}>{t}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Validation Rules / Constraints</label>
                    <input value={constraints} onChange={e => setConstraints(e.target.value)} placeholder="e.g., max:255, unique" className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="A brief description of the field." className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md"></textarea>
                </div>
                <div className="flex items-center space-x-2">
                    <Switch id="required-switch" checked={required} onChange={setRequired} />
                    <label htmlFor="required-switch" className="text-sm font-medium text-gray-700 dark:text-gray-300">Required</label>
                </div>
                <div className="flex justify-end pt-4">
                    <button type="button" onClick={onClose} className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">Cancel</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">Save Field</button>
                </div>
            </form>
        </Modal>
    );
};

export default Schemas;

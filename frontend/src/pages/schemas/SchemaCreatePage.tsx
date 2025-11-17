import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X } from 'lucide-react';
import Card from '../../components/ui/Card.tsx';
import { apiClient } from '../../services/apiClient.ts';

const SchemaCreatePage: React.FC = () => {
    const { serviceId } = useParams<{ serviceId: string }>();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!serviceId) {
            setError('Service ID is missing.');
            return;
        }
        try {
            await apiClient('/schemas', {
                method: 'POST',
                body: { name, description, fields: [], serviceId }
            });
            navigate(`/${serviceId}/schemas`);
        } catch (err: any) {
            setError(err.message || 'Failed to create schema.');
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Schema</h1>
                <div className="flex items-center gap-2 mt-4 sm:mt-0">
                    <button onClick={() => navigate(-1)} className="flex items-center justify-center bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-bold py-2 px-4 rounded-lg">
                        <X size={16} className="mr-2" /> Cancel
                    </button>
                    <button onClick={handleSave} className="flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg">
                        <Save size={16} className="mr-2" /> Create Schema
                    </button>
                </div>
            </div>
            
            {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{error}</p>}
            
            <Card>
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Schema Name</label>
                        <input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g., User"
                            className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={4}
                            placeholder="A brief description of the data model."
                            className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md"
                        ></textarea>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default SchemaCreatePage;

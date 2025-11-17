import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Lock, Unlock } from 'lucide-react';
import { Endpoint, Module } from '../../types.ts';
import Badge from '../../components/ui/Badge.tsx';
import { apiClient } from '../../services/apiClient.ts';
import Loading from '../../components/ui/Loading.tsx';

const ModuleDetailPage: React.FC = () => {
    const { serviceId, moduleId } = useParams<{ serviceId: string, moduleId: string }>();
    const navigate = useNavigate();

    const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
    const [module, setModule] = useState<Module | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchModuleData = useCallback(async () => {
        if (!serviceId || !moduleId) return;
        setIsLoading(true);
        setError(null);
        try {
            const modulesPromise = apiClient<{ data: Module[] }>(`/modules?serviceId=${serviceId}`);
            const endpointsPromise = apiClient<{ data: Endpoint[] }>(`/endpoints?serviceId=${serviceId}`);
            
            const [modulesRes, endpointsRes] = await Promise.all([modulesPromise, endpointsPromise]);
            
            const currentModule = modulesRes.data.find(m => m.id === moduleId);
            if (!currentModule) {
                setError("Module not found.");
                return;
            }
            setModule(currentModule);

            const moduleEndpoints = endpointsRes.data.filter(ep => ep.moduleId === moduleId);
            setEndpoints(moduleEndpoints);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch module data.');
        } finally {
            setIsLoading(false);
        }
    }, [serviceId, moduleId]);

    useEffect(() => {
        fetchModuleData();
    }, [fetchModuleData]);

    if (isLoading) return <Loading />;
    if (error) return <div className="text-center p-8 text-red-500">{error}</div>;
    if (!module) return <div className="text-center p-8 text-gray-500">Module not found.</div>;

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Module: {module.name}</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                    {module.description || `A list of all endpoints within the ${module.name} module.`}
                </p>
            </div>
            
            <div className="overflow-x-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Endpoint</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Auth</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        {endpoints.length > 0 ? endpoints.map(endpoint => (
                        <tr key={endpoint.id} onClick={() => navigate(`/${serviceId}/endpoints/${endpoint.id}`)} className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                            <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                                <Badge method={endpoint.method} />
                                <span className="ml-4 font-mono text-sm font-semibold text-gray-800 dark:text-gray-200">{endpoint.path}</span>
                            </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-sm truncate">{endpoint.description}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                {endpoint.authRequired ? <Lock size={16} className="text-yellow-500 inline-block"/> : <Unlock size={16} className="text-green-500 inline-block"/>}
                            </td>
                        </tr>
                        )) : (
                            <tr>
                                <td colSpan={3} className="text-center p-8 text-gray-500 dark:text-gray-400">
                                    No endpoints found in this module.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ModuleDetailPage;

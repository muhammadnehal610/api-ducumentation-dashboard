import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Search, Lock, Unlock, Plus, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { HttpMethod, User, Endpoint } from '../../types.ts';
import Badge from '../../components/ui/Badge.tsx';
import { apiClient } from '../../services/apiClient.ts';
import { useDashboardContext } from '../../components/layout/DashboardLayout.tsx';

const methodFilters: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
const ITEMS_PER_PAGE = 10;

const EndpointsPage: React.FC = () => {
  const { user } = useDashboardContext();
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();

  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<Set<HttpMethod>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  const fetchEndpoints = useCallback(async () => {
    if (!serviceId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient<{ data: Endpoint[] }>(`/endpoints?serviceId=${serviceId}`);
      setEndpoints(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch endpoints.');
    } finally {
      setIsLoading(false);
    }
  }, [serviceId]);

  useEffect(() => {
    fetchEndpoints();
  }, [fetchEndpoints]);


  const toggleFilter = (method: HttpMethod) => {
    const newFilters = new Set(activeFilters);
    if (newFilters.has(method)) {
      newFilters.delete(method);
    } else {
      newFilters.add(method);
    }
    setActiveFilters(newFilters);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const filteredEndpoints = useMemo(() => {
    return endpoints.filter(endpoint => {
      const matchesSearch = endpoint.path.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            endpoint.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = activeFilters.size === 0 || activeFilters.has(endpoint.method);
      return matchesSearch && matchesFilter;
    });
  }, [endpoints, searchTerm, activeFilters]);
  
  const totalPages = Math.ceil(filteredEndpoints.length / ITEMS_PER_PAGE);
  const paginatedEndpoints = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredEndpoints.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredEndpoints, currentPage]);
  
  const handleDelete = async (e: React.MouseEvent, endpointId: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this endpoint?')) {
        try {
            await apiClient(`/endpoints/${endpointId}`, { method: 'DELETE' });
            fetchEndpoints(); // Refresh list
        } catch (err: any) {
            alert(`Failed to delete endpoint: ${err.message}`);
        }
    }
  }

  const Pagination = () => (
    <div className="flex justify-between items-center mt-4 px-6 pb-4 text-sm">
        <div>
            <span className="text-gray-600 dark:text-gray-400">
                Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredEndpoints.length)} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredEndpoints.length)} of {filteredEndpoints.length} results
            </span>
        </div>
        <div className="flex items-center">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"><ChevronLeft size={16}/></button>
            <span className="px-2">Page {currentPage} of {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="p-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"><ChevronRight size={16}/></button>
        </div>
    </div>
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
        <div>
            <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Endpoints</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
                A list of all available API endpoints for this service.
            </p>
        </div>
        {user.role === 'backend' && (
            <button 
              onClick={() => navigate(`/${serviceId}/endpoints/create`)}
              className="flex items-center bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg w-full sm:w-auto mt-4 sm:mt-0"
            >
                <Plus size={18} className="mr-2"/>
                Add Endpoint
            </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search endpoints..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex items-center space-x-2">
          {methodFilters.map(method => (
            <button key={method} onClick={() => toggleFilter(method)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activeFilters.has(method) ? 'bg-primary-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
              {method}
            </button>
          ))}
        </div>
      </div>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <div className="overflow-x-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm">
        {isLoading ? (
            <div className="text-center p-8">Loading endpoints...</div>
        ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Endpoint</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Auth</th>
                {user.role === 'backend' && <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>}
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {paginatedEndpoints.map(endpoint => (
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
                    {user.role === 'backend' && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button onClick={(e) => { e.stopPropagation(); navigate(`/${serviceId}/endpoints/${endpoint.id}/edit`); }} className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 mr-4"><Edit size={18}/></button>
                            <button onClick={(e) => handleDelete(e, endpoint.id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"><Trash2 size={18}/></button>
                        </td>
                    )}
                </tr>
                ))}
            </tbody>
            </table>
        )}
         {!isLoading && paginatedEndpoints.length > 0 && <Pagination />}
      </div>
      {!isLoading && filteredEndpoints.length === 0 && (
        <div className="text-center p-8 text-gray-500 dark:text-gray-400">
          No endpoints match your criteria.
        </div>
      )}
    </div>
  );
};

export default EndpointsPage;

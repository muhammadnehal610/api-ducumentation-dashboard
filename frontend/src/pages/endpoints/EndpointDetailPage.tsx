
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PlayCircle, Edit, ChevronDown, ChevronRight } from 'lucide-react';
import Badge from '../../components/ui/Badge.tsx';
import ParamTable from '../../components/ui/ParamTable.tsx';
import JsonViewer from '../../components/ui/JsonViewer.tsx';
import { User, ResponseExample, Endpoint, Module, Field } from '../../types.ts';
import Card from '../../components/ui/Card.tsx';
import { apiClient } from '../../services/apiClient.ts';
import { useDashboardContext } from '../../components/layout/DashboardLayout.tsx';
import Loading from '../../components/ui/Loading.tsx';


const FieldRowDisplay: React.FC<{ field: Field, level?: number }> = ({ field, level = 0 }) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <>
            <tr className="group">
                <td className="px-6 py-3 text-sm font-mono text-gray-800 dark:text-gray-200" style={{ paddingLeft: `${1.5 + level * 1.5}rem` }}>
                    <div className="flex items-center">
                        {field.children && field.children.length > 0 ? (
                            <button onClick={() => setIsOpen(!isOpen)} className="-ml-6 mr-1 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                                {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </button>
                        ) : <div className="w-5"></div>}
                        {field.name}
                    </div>
                </td>
                <td className="px-6 py-3 text-sm font-mono text-gray-500 dark:text-gray-400">{field.type}</td>
                <td className="px-6 py-3 text-sm">{field.description}</td>
                <td className="px-6 py-3 text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${field.required ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                    {field.required ? 'Yes' : 'No'}
                  </span>
                </td>
            </tr>
            {isOpen && field.children && field.children.map((child, index) => (
                <FieldRowDisplay key={index} field={child} level={level + 1} />
            ))}
        </>
    );
};

const SchemaTree: React.FC<{ title: string; fields?: Field[] }> = ({ title, fields }) => {
    if (!fields || fields.length === 0) {
        return null;
    }
    return (
        <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">{title}</h3>
            <div className="overflow-x-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Required</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        {fields.map((field, index) => <FieldRowDisplay key={index} field={field} />)}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


const ResponseDisplay: React.FC<{ response: ResponseExample }> = ({ response }) => (
    <div className="mb-6">
        <div className="flex items-center gap-4 mb-3 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-t-lg">
            <span className={`font-mono font-bold px-2 py-1 rounded-md text-sm ${
                response.code >= 200 && response.code < 300 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
            }`}>
                {response.code}
            </span>
            <p className="font-semibold text-gray-700 dark:text-gray-300">{response.description}</p>
        </div>
        <div className="border border-t-0 border-gray-200 dark:border-gray-700 rounded-b-lg p-4 space-y-4">
            <SchemaTree title="Response Schema" fields={response.fields} />
            <div>
              <h4 className="text-md font-semibold mb-2 text-gray-700 dark:text-gray-300">Example Body</h4>
              <JsonViewer data={response.body} />
            </div>
        </div>
    </div>
);

const EndpointDetailPage: React.FC = () => {
  const { user } = useDashboardContext();
  const { serviceId, endpointId } = useParams<{ serviceId: string, endpointId: string }>();
  const navigate = useNavigate();

  const [endpoint, setEndpoint] = useState<Endpoint | null>(null);
  const [moduleName, setModuleName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEndpoint = async () => {
      if (!endpointId || !serviceId) return;
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient<{ data: Endpoint }>(`/endpoints/${endpointId}`);
        const endpointData = response.data;
        setEndpoint(endpointData);
        if (endpointData) {
            const modulesRes = await apiClient<{ data: Module[] }>(`/modules?serviceId=${serviceId}`);
            const module = modulesRes.data.find(m => m.id === endpointData.moduleId);
            setModuleName(module ? module.name : 'Unknown');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch endpoint details.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchEndpoint();
  }, [endpointId, serviceId]);

  if (isLoading) return <Loading />;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;
  if (!endpoint) return <div className="text-center p-8 text-gray-500">Endpoint not found.</div>;

  const hasContent = (arr: any[] | undefined) => arr && arr.length > 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Badge method={endpoint.method} />
            <span className="text-xl md:text-2xl font-mono font-semibold text-gray-800 dark:text-gray-200">{endpoint.path}</span>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400">{endpoint.description}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
           {user.role === 'backend' && (
                <button onClick={() => navigate(`/${serviceId}/endpoints/${endpoint.id}/edit`)} className="flex items-center justify-center bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-lg">
                    <Edit size={16} className="mr-2"/>
                    Edit
                </button>
            )}
            <button 
              onClick={() => navigate(`/${serviceId}/api-playground/${endpoint.id}`)}
              className="flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg"
            >
                <PlayCircle size={16} className="mr-2"/>
                Try
            </button>
        </div>
      </div>

      <Card>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Module</h4>
                <p className="text-gray-800 dark:text-gray-200">{moduleName}</p>
            </div>
            <div>
                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Auth Required</h4>
                <p className={`font-semibold ${endpoint.authRequired ? 'text-red-500' : 'text-green-500'}`}>
                    {endpoint.authRequired ? 'Yes' : 'No'}
                </p>
            </div>
        </div>
      </Card>

      {/* Parameters */}
      <div className="space-y-8">
        <SchemaTree title="Path Parameters" fields={endpoint.pathParams as Field[]} />
        <ParamTable title="Headers" params={endpoint.headers as Field[]} />
        <ParamTable title="Query Parameters" params={endpoint.queryParams as Field[]} />
        
        {hasContent(endpoint.bodyParams) ? (
            <div>
                <SchemaTree title="Request Body Schema" fields={endpoint.bodyParams as Field[]} />
                {endpoint.bodyExample && (
                     <div className="mt-4">
                        <h4 className="text-md font-semibold mb-2 text-gray-700 dark:text-gray-300">Example Body</h4>
                        <JsonViewer data={JSON.parse(endpoint.bodyExample)} />
                     </div>
                )}
            </div>
        ) : (
             <Card>
                <p className="text-gray-500 dark:text-gray-400">No request body defined for this endpoint.</p>
            </Card>
        )}
      </div>
      
      {/* Responses */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Success Responses</h3>
            {hasContent(endpoint.successResponses) ? (
                 endpoint.successResponses?.map((res, i) => <ResponseDisplay key={`${res.code}-${i}`} response={res} />)
            ) : (
                <p className="text-gray-500 dark:text-gray-400">No success responses defined.</p>
            )}
        </div>
         <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Error Responses</h3>
            {hasContent(endpoint.errorResponses) ? (
                 endpoint.errorResponses?.map((res, i) => <ResponseDisplay key={`${res.code}-${i}`} response={res} />)
            ) : (
                <p className="text-gray-500 dark:text-gray-400">No error responses defined.</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default EndpointDetailPage;
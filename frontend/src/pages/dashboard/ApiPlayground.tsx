import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Send } from 'lucide-react';
import Card from '../../components/ui/Card.tsx';
import JsonViewer from '../../components/ui/JsonViewer.tsx';
import { Endpoint } from '../../types.ts';
import { apiClient } from '../../services/apiClient.ts';

const ApiPlayground: React.FC = () => {
  const { serviceId, endpointId: initialEndpointId } = useParams<{ serviceId: string, endpointId?: string }>();
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [endpointId, setEndpointId] = useState('');
  const [headers, setHeaders] = useState('{\n  "Authorization": "Bearer YOUR_API_KEY"\n}');
  const [body, setBody] = useState('');
  const [response, setResponse] = useState<object | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedEndpoint = endpoints.find(e => e.id === endpointId);

  useEffect(() => {
    const fetchEndpoints = async () => {
        if (!serviceId) return;
        try {
            const res = await apiClient<{ data: Endpoint[] }>(`/endpoints?serviceId=${serviceId}`);
            setEndpoints(res.data);
            if (initialEndpointId) {
                setEndpointId(initialEndpointId);
            } else if (res.data.length > 0) {
                setEndpointId(res.data[0].id);
            }
        } catch (err) {
            setError('Failed to load endpoints.');
        }
    };
    fetchEndpoints();
  }, [serviceId, initialEndpointId]);

  useEffect(() => {
    if (!selectedEndpoint) return;
    const defaultBody = selectedEndpoint.bodyParams && selectedEndpoint.bodyParams.length > 0
        ? JSON.stringify(selectedEndpoint.bodyParams.reduce((acc, param) => ({...acc, [param.name]: param.type}), {}), null, 2)
        : '{}';
    setBody(defaultBody);
    setResponse(null);
  }, [endpointId, selectedEndpoint]);
  
  const handleSendRequest = () => {
    if (!selectedEndpoint) return;
    setIsLoading(true);
    setResponse(null);
    setTimeout(() => {
      const resp = selectedEndpoint.successResponses?.[0]?.body ?? selectedEndpoint.errorResponses?.[0]?.body ?? { message: "No example." };
      setResponse(resp);
      setIsLoading(false);
    }, 1000);
  };

  if (error) return <div className="text-red-500 text-center">{error}</div>;
  if (endpoints.length === 0) return <div className="text-center">Loading playground...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">API Playground</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Request">
          <div className="space-y-6">
            <div><label className="block text-sm font-medium mb-1">Endpoint</label><select value={endpointId} onChange={(e) => setEndpointId(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-800 border rounded-md p-2">{endpoints.map(ep => (<option key={ep.id} value={ep.id}>{ep.method} {ep.path}</option>))}</select></div>
            <div><label className="block text-sm font-medium mb-1">Headers</label><textarea value={headers} onChange={(e) => setHeaders(e.target.value)} rows={4} className="w-full font-mono text-sm p-2 bg-gray-800 text-white rounded-md border"/></div>
            {selectedEndpoint?.bodyParams && (<div><label className="block text-sm font-medium mb-1">Body</label><textarea value={body} onChange={(e) => setBody(e.target.value)} rows={8} className="w-full font-mono text-sm p-2 bg-gray-800 text-white rounded-md border"/></div>)}
            <button onClick={handleSendRequest} disabled={isLoading} className="w-full flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50"><Send size={16} className="mr-2"/>{isLoading ? 'Sending...' : 'Send Request'}</button>
          </div>
        </Card>
        <Card title="Response">
          {isLoading && (<div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div></div>)}
          {response && (<JsonViewer data={response} />)}
          {!isLoading && !response && (<div className="text-center text-gray-500 h-full flex items-center justify-center"><p>Send a request to see the response.</p></div>)}
        </Card>
      </div>
    </div>
  );
};

export default ApiPlayground;

import React, { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import Card from '../../components/ui/Card';
import JsonViewer from '../../components/ui/JsonViewer';
import { endpoints } from '../../constants/dummyData';
import { Endpoint, User } from '../../types';

interface ApiPlaygroundProps {
    selectedEndpointId: string | null;
    user: User;
}

const ApiPlayground: React.FC<ApiPlaygroundProps> = ({ selectedEndpointId, user }) => {
  const [endpointId, setEndpointId] = useState(selectedEndpointId || endpoints[0].id);
  const [headers, setHeaders] = useState('{\n  "Authorization": "Bearer YOUR_API_KEY"\n}');
  const [body, setBody] = useState('');
  const [response, setResponse] = useState<object | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const selectedEndpoint = endpoints.find(e => e.id === endpointId) as Endpoint;

  useEffect(() => {
    if(selectedEndpointId) setEndpointId(selectedEndpointId);
  }, [selectedEndpointId]);

  useEffect(() => {
    const defaultBody = selectedEndpoint.bodyParams 
        ? JSON.stringify(
            selectedEndpoint.bodyParams.reduce((acc, param) => {
                acc[param.name] = param.type;
                return acc;
            }, {} as Record<string, any>),
            null,
            2
        ) : '{}';
    setBody(defaultBody);
    setResponse(null);
  }, [endpointId, selectedEndpoint.bodyParams]);
  
  const handleSendRequest = () => {
    setIsLoading(true);
    setResponse(null);
    setTimeout(() => {
      setResponse(selectedEndpoint.successResponse);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">API Playground</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Request Panel */}
        <Card title="Request" className="lg:col-span-1">
          <div className="space-y-6">
            <div>
              <label htmlFor="endpoint-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Endpoint</label>
              <select
                id="endpoint-select"
                value={endpointId}
                onChange={(e) => setEndpointId(e.target.value)}
                className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md p-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {endpoints.map(ep => (
                  <option key={ep.id} value={ep.id}>{ep.method} {ep.path}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="headers-editor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Headers</label>
              <textarea
                id="headers-editor"
                value={headers}
                onChange={(e) => setHeaders(e.target.value)}
                rows={4}
                className="w-full font-mono text-sm p-2 bg-gray-800 text-white rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {selectedEndpoint.bodyParams && (
              <div>
                <label htmlFor="body-editor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Body</label>
                <textarea
                  id="body-editor"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={8}
                  className="w-full font-mono text-sm p-2 bg-gray-800 text-white rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            )}
            
            <button
              onClick={handleSendRequest}
              disabled={isLoading}
              className="w-full flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors disabled:bg-primary-800 disabled:cursor-not-allowed"
            >
              <Send size={16} className="mr-2"/>
              {isLoading ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </Card>

        {/* Response Panel */}
        <Card title="Response" className="lg:col-span-1">
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          )}
          {response && (
            <JsonViewer data={response} />
          )}
          {!isLoading && !response && (
            <div className="text-center text-gray-500 dark:text-gray-400 h-full flex items-center justify-center">
              <p>Send a request to see the response here.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ApiPlayground;
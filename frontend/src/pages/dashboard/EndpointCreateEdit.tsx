import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Save, X, Plus, Trash2 } from 'lucide-react';
// FIX: Changed alias imports to relative paths with extensions for module resolution.
import { Page, User, Param, HttpMethod, ResponseExample, Endpoint, Module } from '../../types.ts';
import Card from '../../components/ui/Card.tsx';
import Switch from '../../components/ui/Switch.tsx';
import JsonEditor from '../../components/ui/JsonEditor.tsx';
import { apiClient } from '../../services/apiClient.ts';

// --- Helper Types & Functions (top-level) ---

type FormParam = Omit<Param, 'id'> & { id: string | number };
type FormResponse = {
  id: string | number;
  code: number;
  description: string;
  fields: FormParam[];
  body: string; // JSON string for the editor
};

const getUniqueId = () => `item-${Date.now()}-${Math.random()}`;
const paramTypeOptions = ['string', 'number', 'boolean', 'object', 'array'];
const bodyParamTypeOptions = [...paramTypeOptions, 'file'];

const emptyParam: Omit<FormParam, 'id'> = { name: '', type: 'string', required: false, description: '' };
const emptyResponse: Omit<FormResponse, 'id'> = { code: 200, description: '', fields: [], body: '{}' };

interface ListManager<T extends { id: string | number }> {
    update: (id: string | number, field: keyof Omit<T, 'id'>, value: any) => void;
    add: (newItem: Omit<T, 'id'>) => void;
    remove: (id: string | number) => void;
}

const createListUpdater = <T extends { id: string | number }>(
    setList: React.Dispatch<React.SetStateAction<T[]>>
): ListManager<T> => ({
    update: (id, field, value) => {
        setList(prevList => prevList.map(item => (item.id === id ? { ...item, [field]: value } : item)));
    },
    add: (newItem) => {
        setList(prevList => [...prevList, { ...newItem, id: getUniqueId() } as T]);
    },
    remove: (id) => {
        setList(prevList => prevList.filter(item => item.id !== id));
    },
});

// --- Child Components (top-level to prevent re-creation on render) ---

const DynamicParamTable: React.FC<{
    title: string;
    items: FormParam[];
    manager: ListManager<FormParam>;
    typeOptions: string[];
}> = ({ title, items, manager, typeOptions }) => (
    <div className="space-y-2">
        <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mt-4">{title}</h4>
        <div className="hidden md:grid md:grid-cols-[2fr,1.5fr,3fr,auto,auto] gap-2 items-center px-2 text-xs font-medium text-gray-500 dark:text-gray-400">
            <span>Name</span>
            <span>Type</span>
            <span>Description</span>
            <span className="text-center">Required?</span>
            <span></span>
        </div>
        {items.map((item) => (
            <div key={item.id} className="grid grid-cols-1 md:grid-cols-[2fr,1.5fr,3fr,auto,auto] gap-2 items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <input value={item.name} onChange={e => manager.update(item.id, 'name', e.target.value)} placeholder="Name" className="w-full p-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm" />
                <select value={item.type} onChange={e => manager.update(item.id, 'type', e.target.value)} className="w-full p-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm">
                    {typeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <input value={item.description} onChange={e => manager.update(item.id, 'description', e.target.value)} placeholder="Description" className="w-full p-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm" />
                <div className="flex items-center justify-center space-x-2">
                    <Switch id={`required-${title}-${item.id}`} checked={item.required} onChange={checked => manager.update(item.id, 'required', checked)} />
                </div>
                <button type="button" onClick={() => manager.remove(item.id)} className="text-red-500 hover:text-red-700 p-1 justify-self-end md:justify-self-center"><Trash2 size={16}/></button>
            </div>
        ))}
        <button type="button" onClick={() => manager.add(emptyParam)} className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline mt-2 flex items-center"><Plus size={16} className="mr-1"/> Add {title.replace(/s$/, '')}</button>
    </div>
);


const ResponseEditor: React.FC<{
    title: string;
    items: FormResponse[];
    manager: {
        update: (id: string | number, field: keyof Omit<FormResponse, 'id' | 'fields'>, value: any) => void;
        addField: (responseId: string | number) => void;
        removeField: (responseId: string | number, fieldId: string | number) => void;
        updateField: (responseId: string | number, fieldId: string | number, fieldProp: keyof Omit<FormParam, 'id'>, value: any) => void;
        add: (newItem: Omit<FormResponse, 'id'>) => void;
        remove: (id: string | number) => void;
    };
}> = ({ title, items, manager }) => (
    <Card title={title}>
        {items.map((res) => {
            const fieldManager: ListManager<FormParam> = {
                update: (fieldId, fieldProp, value) => manager.updateField(res.id, fieldId, fieldProp, value),
                add: () => manager.addField(res.id),
                remove: (fieldId) => manager.removeField(res.id, fieldId),
            };
            return (
                <div key={res.id} className="space-y-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg mb-4 relative">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Status Code</label>
                            <input type="number" value={res.code} onChange={e => manager.update(res.id, 'code', parseInt(e.target.value))} className="w-full p-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Description / Notes</label>
                            <input value={res.description} onChange={e => manager.update(res.id, 'description', e.target.value)} className="w-full p-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md"/>
                        </div>
                    </div>
                    <DynamicParamTable title="Response Fields (Schema)" items={res.fields} manager={fieldManager} typeOptions={paramTypeOptions} />
                    <div>
                        <label className="block text-sm font-medium mb-1 mt-4">Example Body (JSON)</label>
                        <JsonEditor value={res.body} onChange={value => manager.update(res.id, 'body', value)} />
                    </div>
                    {items.length > 0 && (
                        <button type="button" onClick={() => manager.remove(res.id)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1"><Trash2 size={16}/></button>
                    )}
                </div>
            );
        })}
        <button type="button" onClick={() => manager.add(emptyResponse)} className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline mt-2 flex items-center"><Plus size={16} className="mr-1"/> Add Response</button>
    </Card>
);

// --- Main Component ---
interface EndpointCreateEditProps {
  endpointId: string | null;
  onNavigate: (page: Page) => void;
  user: User;
  serviceId: string;
}

const EndpointCreateEdit: React.FC<EndpointCreateEditProps> = ({ endpointId, onNavigate, serviceId }) => {
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [path, setPath] = useState('');
  const [description, setDescription] = useState('');
  const [moduleId, setModuleId] = useState('');
  const [modules, setModules] = useState<Module[]>([]);
  const [authRequired, setAuthRequired] = useState(false);

  const [headers, setHeaders] = useState<FormParam[]>([]);
  const [queryParams, setQueryParams] = useState<FormParam[]>([]);
  const [bodyParams, setBodyParams] = useState<FormParam[]>([]);
  const [bodyExample, setBodyExample] = useState('{}');
  
  const [successResponses, setSuccessResponses] = useState<FormResponse[]>([{ ...emptyResponse, id: getUniqueId() }]);
  const [errorResponses, setErrorResponses] = useState<FormResponse[]>([{...emptyResponse, code: 400, body: '{\n  "error": "Bad Request"\n}', id: getUniqueId() }]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');


  const populateForm = useCallback((endpoint: Endpoint) => {
    setMethod(endpoint.method);
    setPath(endpoint.path);
    setDescription(endpoint.description);
    setModuleId(endpoint.moduleId);
    setAuthRequired(endpoint.authRequired);
    setBodyExample(endpoint.bodyExample || '{}');

    const mapParams = (params: Param[] | undefined): FormParam[] => 
        params?.map(p => ({ ...p, id: getUniqueId() })) || [];
    
    const mapResponses = (responses: ResponseExample[] | undefined, defaultResponse: Omit<FormResponse, 'id'>): FormResponse[] => {
        if (responses && responses.length > 0) {
            return responses.map(r => ({ 
                id: getUniqueId(), 
                code: r.code, 
                description: r.description, 
                fields: mapParams(r.fields),
                body: JSON.stringify(r.body, null, 2)
            }));
        }
        return [{ ...defaultResponse, id: getUniqueId() }];
    };

    setHeaders(mapParams(endpoint.headers));
    setQueryParams(mapParams(endpoint.queryParams));
    setBodyParams(mapParams(endpoint.bodyParams));
    setSuccessResponses(mapResponses(endpoint.successResponses, emptyResponse));
    setErrorResponses(mapResponses(endpoint.errorResponses, {...emptyResponse, code: 400, body: '{\n  "error": "Bad Request"\n}'}));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const moduleRes = await apiClient<{ data: Module[] }>(`/modules?serviceId=${serviceId}`);
            setModules(moduleRes.data);

            if (endpointId) {
                const endpointRes = await apiClient<{ data: Endpoint }>(`/endpoints/${endpointId}`);
                populateForm(endpointRes.data);
            } else {
                 if (moduleRes.data.length > 0) {
                    setModuleId(moduleRes.data[0].id);
                }
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load data.');
        } finally {
            setIsLoading(false);
        }
    };
    fetchData();
  }, [endpointId, populateForm, serviceId]);
  
  const handleSave = async () => {
    setError('');
    const transformFormState = (items: (FormParam[] | FormResponse[])) => {
        return items.map(({ id, ...rest }: any) => {
            if (rest.body) {
                try {
                    rest.body = JSON.parse(rest.body);
                } catch (e) {
                    setError('Invalid JSON in one of the response bodies.');
                    throw e; // Stop execution
                }
            }
            if (rest.fields) {
                rest.fields = rest.fields.map(({id: fieldId, ...fieldRest}: any) => fieldRest);
            }
            return rest;
        });
    };
    
    try {
        const payload = {
            method, path, description, moduleId, authRequired, bodyExample, serviceId,
            headers: transformFormState(headers),
            queryParams: transformFormState(queryParams),
            bodyParams: transformFormState(bodyParams),
            successResponses: transformFormState(successResponses),
            errorResponses: transformFormState(errorResponses),
        };
        
        if (endpointId) {
            await apiClient(`/endpoints/${endpointId}`, { method: 'PUT', body: payload });
        } else {
            await apiClient('/endpoints', { method: 'POST', body: payload });
        }
        onNavigate('Endpoints');
    } catch (err: any) {
        console.error('Save failed:', err);
        if (!error) { // Don't overwrite JSON parsing error
             setError(err.message || 'Failed to save endpoint.');
        }
    }
  };
  
  const headerManager = useMemo(() => createListUpdater(setHeaders), []);
  const queryParamManager = useMemo(() => createListUpdater(setQueryParams), []);
  const bodyParamManager = useMemo(() => createListUpdater(setBodyParams), []);

  const createResponseManager = (setList: React.Dispatch<React.SetStateAction<FormResponse[]>>) => ({
      ...createListUpdater(setList),
      addField: (responseId: string | number) => {
          setList(list => list.map(res => res.id === responseId ? { ...res, fields: [...res.fields, { ...emptyParam, id: getUniqueId() }] } : res ));
      },
      removeField: (responseId: string | number, fieldId: string | number) => {
          setList(list => list.map(res => res.id === responseId ? { ...res, fields: res.fields.filter(f => f.id !== fieldId) } : res ));
      },
      updateField: (responseId: string | number, fieldId: string | number, fieldProp: keyof Omit<FormParam, 'id'>, value: any) => {
          setList(list => list.map(res => res.id === responseId ? { ...res, fields: res.fields.map(f => f.id === fieldId ? { ...f, [fieldProp]: value } : f) } : res ));
      }
  });

  const successResponseManager = useMemo(() => createResponseManager(setSuccessResponses), []);
  const errorResponseManager = useMemo(() => createResponseManager(setErrorResponses), []);
  
  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{endpointId ? 'Edit Endpoint' : 'Create New Endpoint'}</h1>
        <div className="flex items-center gap-2 mt-4 sm:mt-0">
          <button onClick={() => onNavigate('Endpoints')} className="flex items-center justify-center bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-lg">
            <X size={16} className="mr-2"/> Cancel
          </button>
          <button onClick={handleSave} className="flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg">
            <Save size={16} className="mr-2"/> Save Changes
          </button>
        </div>
      </div>
      {error && <p className="text-red-500 bg-red-100 dark:bg-red-900 p-3 rounded-md">{error}</p>}
        
      <Card title="General Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                  <label className="block text-sm font-medium mb-1">HTTP Method</label>
                  <select value={method} onChange={e => setMethod(e.target.value as HttpMethod)} className="w-full p-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md">
                      {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map(m => <option key={m}>{m}</option>)}
                  </select>
              </div>
              <div>
                  <label className="block text-sm font-medium mb-1">URL Path</label>
                  <input value={path} onChange={e => setPath(e.target.value)} placeholder="/v1/users/{id}" className="w-full p-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md" required />
              </div>
              <div>
                  <label className="block text-sm font-medium mb-1">Module</label>
                  <select value={moduleId} onChange={e => setModuleId(e.target.value)} className="w-full p-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md">
                      {modules.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
              </div>
              <div className="flex items-center space-x-2 pt-5">
                  <Switch id="authRequired" checked={authRequired} onChange={setAuthRequired} />
                  <label htmlFor="authRequired" className="text-sm font-medium">Authentication Required?</label>
              </div>
              <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="A brief description of the endpoint." rows={3} className="w-full p-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md"></textarea>
              </div>
          </div>
      </Card>

      <Card title="Request Parameters">
          <DynamicParamTable title="Headers" items={headers} manager={headerManager} typeOptions={paramTypeOptions} />
          <DynamicParamTable title="Query Parameters" items={queryParams} manager={queryParamManager} typeOptions={paramTypeOptions} />
      </Card>

      <Card title="Request Body">
         <DynamicParamTable title="Body Parameters (Schema)" items={bodyParams} manager={bodyParamManager} typeOptions={bodyParamTypeOptions} />
         <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Example Body (JSON)</label>
            <JsonEditor value={bodyExample} onChange={setBodyExample} />
         </div>
      </Card>
      
      <ResponseEditor title="Success Responses" items={successResponses} manager={successResponseManager} />
      <ResponseEditor title="Error Responses" items={errorResponses} manager={errorResponseManager} />
    </div>
  );
};

export default EndpointCreateEdit;
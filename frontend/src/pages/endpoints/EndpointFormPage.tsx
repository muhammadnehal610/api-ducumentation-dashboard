
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X, Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { Field, HttpMethod, ResponseExample, Endpoint, Module, FieldType } from '../../types.ts';
import Card from '../../components/ui/Card.tsx';
import Switch from '../../components/ui/Switch.tsx';
import JsonViewer from '../../components/ui/JsonViewer.tsx';
import { apiClient } from '../../services/apiClient.ts';
import Loading from '../../components/ui/Loading.tsx';
import ParamTable from '../../components/ui/ParamTable.tsx';

type FormField = Omit<Field, 'id' | 'children'> & { id: string | number; children?: FormField[] };
type FormResponse = {
  id: string | number;
  code: number;
  description: string;
  fields: FormField[];
  body: string; // JSON string for the preview
};

// FIX: Added a recursive ApiField type to correctly type the payload for the API, resolving a complex recursive type error.
interface ApiField extends Omit<Field, 'id' | 'children'> {
    children?: ApiField[];
}

const getUniqueId = () => `item-${Date.now()}-${Math.random()}`;
const fieldTypeOptions: FieldType[] = ['string', 'number', 'boolean', 'object', 'array'];
const emptyField: Omit<FormField, 'id'> = { name: '', type: 'string', required: false, description: '', exampleValue: '' };
const emptyResponse: Omit<FormResponse, 'id'> = { code: 200, description: '', fields: [], body: '{}' };

const generateJsonFromFields = (fields: FormField[]): any => {
    const obj: { [key: string]: any } = {};
    for (const field of fields) {
        if (!field.name) continue;
        if (field.type === 'object' && field.children && field.children.length > 0) {
            obj[field.name] = generateJsonFromFields(field.children);
        } else if (field.type === 'array' && field.children && field.children.length > 0) {
            obj[field.name] = [generateJsonFromFields(field.children)];
        } else {
            const val = field.exampleValue || '';
            if (field.type === 'number') obj[field.name] = parseFloat(val) || 0;
            else if (field.type === 'boolean') obj[field.name] = val.toLowerCase() === 'true';
            else obj[field.name] = val;
        }
    }
    return obj;
};

const FieldsBuilder: React.FC<{ fields: FormField[]; onFieldsChange: (fields: FormField[]) => void; level?: number; }> = ({ fields, onFieldsChange, level = 0 }) => {
    const [openStates, setOpenStates] = useState<Record<string | number, boolean>>({});

    useEffect(() => {
        // Initialize open states for fields with children
        const initialStates: Record<string | number, boolean> = {};
        fields.forEach(f => {
            if (f.children && f.children.length > 0) initialStates[f.id] = true;
        });
        setOpenStates(initialStates);
    }, []); // Run only once

    const updateField = (index: number, newField: FormField) => {
        const newFields = [...fields];
        newFields[index] = newField;
        onFieldsChange(newFields);
    };
    
    const handleTypeChange = (index: number, type: FieldType) => {
        const field = { ...fields[index], type };
        if (type === 'object' || type === 'array') {
            if (!field.children) field.children = [];
        } else {
            delete field.children;
        }
        updateField(index, field);
    };

    return (
        <div className="space-y-2" style={{ paddingLeft: level > 0 ? '1rem' : '0' }}>
            {fields.map((field, index) => (
                <div key={field.id} className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-[1.5fr,1fr,1.5fr,2.5fr,auto,auto] gap-2 items-center">
                        <input value={field.name} onChange={e => updateField(index, { ...field, name: e.target.value })} placeholder="Field Name" className="input-field" />
                        <select value={field.type} onChange={e => handleTypeChange(index, e.target.value as FieldType)} className="input-field">
                            {fieldTypeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                        <input value={field.exampleValue} onChange={e => updateField(index, { ...field, exampleValue: e.target.value })} placeholder="Example Value" className="input-field" />
                        <input value={field.description} onChange={e => updateField(index, { ...field, description: e.target.value })} placeholder="Description" className="input-field" />
                        <div className="flex items-center justify-center"><Switch id={`req-${field.id}`} checked={field.required} onChange={c => updateField(index, { ...field, required: c })} /></div>
                        <div className="flex items-center justify-end">
                          {(field.type === 'object' || field.type === 'array') && (
                              <button type="button" onClick={() => setOpenStates(s => ({...s, [field.id]: !s[field.id]}))} className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 mr-2">
                                  {openStates[field.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                              </button>
                          )}
                          <button type="button" onClick={() => onFieldsChange(fields.filter(f => f.id !== field.id))} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={16}/></button>
                        </div>
                    </div>
                    {openStates[field.id] && (field.type === 'object' || field.type === 'array') && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                             <h5 className="text-xs font-semibold mb-2 text-gray-500 dark:text-gray-400 pl-1">CHILD FIELDS FOR `{field.name}` ({field.type === 'array' ? 'items in array' : 'properties'})</h5>
                            <FieldsBuilder fields={field.children || []} onFieldsChange={children => updateField(index, { ...field, children })} level={level + 1} />
                        </div>
                    )}
                </div>
            ))}
            <button type="button" onClick={() => onFieldsChange([...fields, { ...emptyField, id: getUniqueId() }])} className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline mt-2 flex items-center"><Plus size={16} className="mr-1"/> Add Field</button>
        </div>
    );
};

const ResponseEditor: React.FC<{ items: FormResponse[]; onItemsChange: (items: FormResponse[]) => void; }> = ({ items, onItemsChange }) => {
    const updateResponse = (index: number, newResponse: FormResponse) => {
        const newItems = [...items];
        newItems[index] = newResponse;
        onItemsChange(newItems);
    };

    useEffect(() => {
        const newItems = items.map(res => {
            const newBody = JSON.stringify(generateJsonFromFields(res.fields), null, 2);
            if (newBody !== res.body) return { ...res, body: newBody };
            return res;
        });
        if (JSON.stringify(newItems) !== JSON.stringify(items)) {
            onItemsChange(newItems);
        }
    }, [items, onItemsChange]);

    return (
      <>
        {items.map((res, index) => (
            <Card key={res.id} title={`Response: ${res.code}`} collapsible defaultOpen={res.code < 400}>
                <div className="space-y-4 p-4 border dark:border-gray-700 rounded-lg mb-4 relative">
                    <button type="button" onClick={() => onItemsChange(items.filter(r => r.id !== res.id))} className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1"><Trash2 size={16}/></button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="label">Status Code</label><input type="number" value={res.code} onChange={e => updateResponse(index, {...res, code: parseInt(e.target.value)})} className="input-field"/></div>
                        <div><label className="label">Description</label><input value={res.description} onChange={e => updateResponse(index, {...res, description: e.target.value})} className="input-field"/></div>
                    </div>
                    <div>
                        <h4 className="label mb-2">Response Body Fields</h4>
                        <FieldsBuilder fields={res.fields} onFieldsChange={fields => updateResponse(index, {...res, fields})} />
                    </div>
                    <div>
                        <label className="label mb-2">Example Body Preview (Auto-generated)</label>
                        <JsonViewer data={JSON.parse(res.body)} />
                    </div>
                </div>
            </Card>
        ))}
        <button type="button" onClick={() => onItemsChange([...items, { ...emptyResponse, id: getUniqueId() }])} className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline mt-2 flex items-center"><Plus size={16} className="mr-1"/> Add Response Example</button>
      </>
    );
};


const EndpointFormPage: React.FC = () => {
  const { serviceId, endpointId } = useParams<{ serviceId: string, endpointId?: string }>();
  const navigate = useNavigate();

  const [method, setMethod] = useState<HttpMethod>('GET');
  const [path, setPath] = useState('');
  const [description, setDescription] = useState('');
  const [moduleId, setModuleId] = useState('');
  const [modules, setModules] = useState<Module[]>([]);
  const [authRequired, setAuthRequired] = useState(false);
  
  const [pathParams, setPathParams] = useState<FormField[]>([]);
  const [headers, setHeaders] = useState<FormField[]>([]);
  const [queryParams, setQueryParams] = useState<FormField[]>([]);
  const [bodyParams, setBodyParams] = useState<FormField[]>([]);
  const [bodyExample, setBodyExample] = useState('{}');
  
  const [successResponses, setSuccessResponses] = useState<FormResponse[]>([{ ...emptyResponse, id: getUniqueId() }]);
  const [errorResponses, setErrorResponses] = useState<FormResponse[]>([{...emptyResponse, code: 400, body: '{\n  "error": "Bad Request"\n}', id: getUniqueId() }]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const isEditMode = !!endpointId;

  const populateForm = useCallback((endpoint: Endpoint) => {
    const mapFields = (fields: Field[] = []): FormField[] => fields.map(f => ({ ...f, id: getUniqueId(), children: f.children ? mapFields(f.children) : undefined }));
    const mapResponses = (responses: ResponseExample[] = [], defaultResp: Omit<FormResponse, 'id'>): FormResponse[] => 
        responses.length > 0
            ? responses.map(r => ({ ...r, id: getUniqueId(), fields: mapFields(r.fields), body: JSON.stringify(r.body, null, 2) }))
            : [{ ...defaultResp, id: getUniqueId() }];
    
    setMethod(endpoint.method); setPath(endpoint.path); setDescription(endpoint.description); setModuleId(endpoint.moduleId);
    setAuthRequired(endpoint.authRequired);
    setPathParams(mapFields(endpoint.pathParams)); setHeaders(mapFields(endpoint.headers)); setQueryParams(mapFields(endpoint.queryParams)); setBodyParams(mapFields(endpoint.bodyParams));
    setBodyExample(endpoint.bodyExample || '{}');
    setSuccessResponses(mapResponses(endpoint.successResponses, emptyResponse));
    setErrorResponses(mapResponses(endpoint.errorResponses, {...emptyResponse, code: 400, body: '{\n  "error": "Bad Request"\n}'}));
  }, []);

  useEffect(() => {
    const newBody = JSON.stringify(generateJsonFromFields(bodyParams), null, 2);
    if (newBody !== bodyExample) setBodyExample(newBody);
  }, [bodyParams, bodyExample]);

  useEffect(() => {
    const fetchData = async () => {
        if (!serviceId) return navigate('/');
        try {
            const moduleRes = await apiClient<{ data: Module[] }>(`/modules?serviceId=${serviceId}`);
            setModules(moduleRes.data);
            if (isEditMode) {
                const endpointRes = await apiClient<{ data: Endpoint }>(`/endpoints/${endpointId}`);
                populateForm(endpointRes.data);
            } else if (moduleRes.data.length > 0) setModuleId(moduleRes.data[0].id);
        } catch (err: any) { setError(err.message || 'Failed to load data.');
        } finally { setIsLoading(false); }
    };
    fetchData();
  }, [endpointId, isEditMode, populateForm, serviceId, navigate]);
  
  const handleSave = async () => {
    setError('');
    const transformFields = (fields: FormField[]): ApiField[] => {
        return fields.map(({ id, children, ...rest }) => ({
            ...rest,
            children: children ? transformFields(children) : undefined,
        }));
    };
    const transformResponses = (responses: FormResponse[]) => responses.map(({ id, ...rest }) => ({...rest, fields: transformFields(rest.fields), body: JSON.parse(rest.body) }));
    
    try {
        const payload = {
            method, path, description, moduleId, authRequired, serviceId,
            pathParams: transformFields(pathParams), headers: transformFields(headers), queryParams: transformFields(queryParams), bodyParams: transformFields(bodyParams),
            bodyExample: bodyExample,
            successResponses: transformResponses(successResponses),
            errorResponses: transformResponses(errorResponses),
        };
        if (isEditMode) await apiClient(`/endpoints/${endpointId}`, { method: 'PUT', body: payload });
        else await apiClient('/endpoints', { method: 'POST', body: payload });
        navigate(`/${serviceId}/endpoints`);
    } catch (err: any) { setError(err.message || 'Failed to save.'); }
  };
  
  if (isLoading) return <Loading />;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-center"><h1 className="text-3xl font-bold">{isEditMode ? 'Edit Endpoint' : 'Create New Endpoint'}</h1><div className="flex gap-2"><button onClick={() => navigate(-1)} className="btn-secondary"><X size={16} className="mr-2"/> Cancel</button><button onClick={handleSave} className="btn-primary"><Save size={16} className="mr-2"/> Save</button></div></div>
      {error && <p className="text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}
      
      <style>{`.input-field { width: 100%; padding: 0.5rem; background-color: white; border: 1px solid #cbd5e1; border-radius: 0.375rem; font-size: 0.875rem; } .dark .input-field { background-color: #374151; border-color: #4b5563; } .label { display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.25rem; }`}</style>
      
      <Card title="General Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="label">HTTP Method</label><select value={method} onChange={e => setMethod(e.target.value as HttpMethod)} className="input-field">{['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'].map(m => <option key={m}>{m}</option>)}</select></div>
              <div><label className="label">URL Path</label><input value={path} onChange={e => setPath(e.target.value)} placeholder="/v1/users/{id}" className="input-field" required /></div>
              <div><label className="label">Module</label><select value={moduleId} onChange={e => setModuleId(e.target.value)} className="input-field">{modules.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
              <div className="flex items-center pt-5"><Switch id="authRequired" checked={authRequired} onChange={setAuthRequired} /><label htmlFor="authRequired" className="ml-2 text-sm font-medium">Auth Required?</label></div>
              <div className="md:col-span-2"><label className="label">Description</label><textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="input-field"></textarea></div>
          </div>
      </Card>

      <Card title="Request Parameters" collapsible defaultOpen={true}>
        <ParamTable title="Path Parameters" params={pathParams} />
        <ParamTable title="Headers" params={headers} />
        <ParamTable title="Query Parameters" params={queryParams} />
      </Card>
      
      <Card title="Request Body" collapsible defaultOpen={true}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
                <h3 className="text-lg font-semibold mb-2">Fields Builder</h3>
                <p className="text-sm text-gray-500 mb-4">Define the schema for the request body here. The example preview will update automatically.</p>
                <FieldsBuilder fields={bodyParams} onFieldsChange={setBodyParams} />
            </div>
            <div>
                 <h3 className="text-lg font-semibold mb-2">Example Preview</h3>
                 <p className="text-sm text-gray-500 mb-4">A read-only preview of the example request body.</p>
                 <JsonViewer data={JSON.parse(bodyExample)} />
            </div>
        </div>
      </Card>

      <ResponseEditor items={successResponses} onItemsChange={setSuccessResponses} />
      <ResponseEditor items={errorResponses} onItemsChange={setErrorResponses} />
    </div>
  );
};

export default EndpointFormPage;
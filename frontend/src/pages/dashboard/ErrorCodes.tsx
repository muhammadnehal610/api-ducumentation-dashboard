import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { User } from '../../types.ts';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Modal from '../../components/ui/Modal.tsx';
import { apiClient } from '../../services/apiClient.ts';

interface ErrorCode {
    id: string;
    code: number;
    meaning: string;
    context: string;
}

interface OutletContextType {
    user: User;
}

const ErrorCodes: React.FC = () => {
    const { user } = useOutletContext<OutletContextType>();
    const { serviceId } = useParams<{ serviceId: string }>();

    const [errorCodes, setErrorCodes] = useState<ErrorCode[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCode, setEditingCode] = useState<ErrorCode | null>(null);

    const fetchErrorCodes = useCallback(async () => {
        if (!serviceId) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiClient<{ data: ErrorCode[] }>(`/error-codes?serviceId=${serviceId}`);
            setErrorCodes(response.data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch error codes.');
        } finally {
            setIsLoading(false);
        }
    }, [serviceId]);

    useEffect(() => {
        fetchErrorCodes();
    }, [fetchErrorCodes]);

    const handleOpenModal = (code: ErrorCode | null) => {
        setEditingCode(code);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCode(null);
    };

    const handleSave = async (codeData: Omit<ErrorCode, 'id'>) => {
        try {
            if (editingCode) {
                await apiClient(`/error-codes/${editingCode.id}`, { method: 'PUT', body: codeData });
            } else {
                await apiClient('/error-codes', { method: 'POST', body: { ...codeData, serviceId } });
            }
            fetchErrorCodes();
            handleCloseModal();
        } catch (err: any) {
            alert(`Failed to save error code: ${err.message}`);
        }
    };
    
    const handleDelete = async (codeId: string, code: number) => {
        if(window.confirm(`Are you sure you want to delete error code ${code}?`)){
            try {
                await apiClient(`/error-codes/${codeId}`, { method: 'DELETE' });
                fetchErrorCodes();
            } catch (err: any) {
                alert(`Failed to delete error code: ${err.message}`);
            }
        }
    }

  return (
    <div>
        <div className="flex justify-between items-center mb-6">
            <div><h1 className="text-3xl font-bold mb-2">Error Codes</h1><p className="text-lg text-gray-600">A list of possible error codes and their meanings.</p></div>
            {user.role === 'backend' && (<button onClick={() => handleOpenModal(null)} className="flex items-center bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg"><Plus size={18} className="mr-2" />Add Error Code</button>)}
        </div>
        
        {error && <p className="text-center text-red-500 mb-4">{error}</p>}
        <div className="overflow-x-auto bg-white dark:bg-gray-900 border rounded-lg shadow-sm">
        {isLoading ? (<div className="text-center p-8">Loading...</div>) : (
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 dark:bg-gray-800"><tr><th className="px-6 py-3 text-left text-xs font-medium uppercase">Code</th><th className="px-6 py-3 text-left text-xs font-medium uppercase">Meaning</th><th className="px-6 py-3 text-left text-xs font-medium uppercase">Context</th>{user.role === 'backend' && <th className="px-6 py-3 text-right text-xs font-medium uppercase">Actions</th>}</tr></thead>
                <tbody className="divide-y divide-gray-200">
                    {errorCodes.map((e) => (<tr key={e.id}><td className="px-6 py-4"><span className="font-mono text-sm font-semibold bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 px-2 py-1 rounded-md">{e.code}</span></td><td className="px-6 py-4">{e.meaning}</td><td className="px-6 py-4">{e.context}</td>{user.role === 'backend' && (<td className="px-6 py-4 text-right"><button onClick={() => handleOpenModal(e)} className="text-primary-600 hover:text-primary-800 mr-4"><Edit size={18}/></button><button onClick={() => handleDelete(e.id, e.code)} className="text-red-600 hover:text-red-800"><Trash2 size={18}/></button></td>)}</tr>))}
                </tbody>
            </table>
        )}
      </div>
       {user.role === 'backend' && (<ErrorCodeFormModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSave} editingCode={editingCode} />)}
    </div>
  );
};

const ErrorCodeFormModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (data: Omit<ErrorCode, 'id'>) => void; editingCode: ErrorCode | null; }> = ({ isOpen, onClose, onSave, editingCode }) => {
    const [code, setCode] = useState(0); const [meaning, setMeaning] = useState(''); const [context, setContext] = useState('');
    useEffect(() => { setCode(editingCode?.code || 0); setMeaning(editingCode?.meaning || ''); setContext(editingCode?.context || ''); }, [editingCode, isOpen]);
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave({ code, meaning, context }); };
    return (<Modal isOpen={isOpen} onClose={onClose} title={editingCode ? "Edit Error Code" : "Create Error Code"}>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div><label>Code</label><input type="number" value={code} onChange={e => setCode(Number(e.target.value))} className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-800 border rounded-md" /></div>
            <div><label>Meaning</label><input type="text" value={meaning} onChange={e => setMeaning(e.target.value)} className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-800 border rounded-md" /></div>
            <div><label>Description</label><textarea rows={3} value={context} onChange={e => setContext(e.target.value)} className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-800 border rounded-md"></textarea></div>
            <div className="flex justify-end pt-4"><button type="button" onClick={onClose} className="mr-2 px-4 py-2 rounded-md">Cancel</button><button type="submit" className="px-4 py-2 text-white bg-primary-600 rounded-md hover:bg-primary-700">Save</button></div>
        </form>
    </Modal>);
}

export default ErrorCodes;

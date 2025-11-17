import React, { useState } from 'react';
import { errorCodes as initialErrorCodes } from '@/constants/dummyData';
import { User } from '@/types';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';


interface ErrorCodesProps {
    user: User;
}

const ErrorCodes: React.FC<ErrorCodesProps> = ({ user }) => {
    const [errorCodes, setErrorCodes] = useState(initialErrorCodes);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleDelete = (code: number) => {
        if(window.confirm(`Are you sure you want to delete error code ${code}?`)){
            setErrorCodes(errorCodes.filter(ec => ec.code !== code));
        }
    }

  return (
    <div>
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
            <div>
                <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Error Codes</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                    A list of possible error codes and their meanings.
                </p>
            </div>
            {user.role === 'backend' && (
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg w-full sm:w-auto"
                >
                    <Plus size={18} className="mr-2" />
                    Add Error Code
                </button>
            )}
        </div>

      <div className="overflow-x-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Code</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Meaning</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">When it happens</th>
              {user.role === 'backend' && <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {errorCodes.map((error) => (
              <tr key={error.code}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="font-mono text-sm font-semibold bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 px-2 py-1 rounded-md">{error.code}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{error.meaning}</td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{error.context}</td>
                {user.role === 'backend' && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => setIsModalOpen(true)} className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 mr-4"><Edit size={18}/></button>
                        <button onClick={() => handleDelete(error.code)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"><Trash2 size={18}/></button>
                    </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

       {user.role === 'backend' && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create/Edit Error Code">
            <form className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Code</label>
                    <input type="number" placeholder="404" className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Meaning</label>
                    <input type="text" placeholder="Not Found" className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                    <textarea placeholder="The server can not find the requested resource." rows={3} className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md"></textarea>
                </div>
                <div className="flex justify-end pt-4">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">Cancel</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">Save Error Code</button>
                </div>
            </form>
        </Modal>
      )}
    </div>
  );
};

export default ErrorCodes;

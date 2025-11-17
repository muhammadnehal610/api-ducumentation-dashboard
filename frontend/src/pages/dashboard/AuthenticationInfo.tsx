import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Card from '../../components/ui/Card.tsx';
import { Key, RefreshCcw, Edit } from 'lucide-react';
import { User } from '../../types.ts';
import Modal from '../../components/ui/Modal.tsx';

interface OutletContextType {
    user: User;
}

const AuthenticationInfo: React.FC = () => {
  const { user } = useOutletContext<OutletContextType>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const tokenExample = `Authorization: Bearer <YOUR_ACCESS_TOKEN>`;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Authentication</h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        Our API uses Bearer Tokens for authentication. You must include an `Authorization` header in all your requests.
      </p>

      <Card className="mb-8">
        <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Example Token Header</h3>
             {user.role === 'backend' && (
                <button onClick={() => setIsModalOpen(true)} className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 p-1"><Edit size={18}/></button>
            )}
        </div>
        <div className="bg-gray-800 text-white rounded-md p-4 font-mono text-sm mt-4">
          {tokenExample}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
            <div className="flex justify-between items-start">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-full mr-4"><Key className="text-primary-600 dark:text-primary-300" size={24} /></div>
                <h3 className="text-xl font-semibold">Login Flow</h3>
              </div>
              {user.role === 'backend' && (<button onClick={() => setIsModalOpen(true)} className="text-primary-600 p-1"><Edit size={18}/></button>)}
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">To obtain an access token, send a POST request to `/v1/auth/login` with user credentials.</p>
            <ol className="list-decimal list-inside space-y-2"><li>User provides email and password.</li><li>Server validates credentials.</li><li>If valid, server returns an `access_token` and a `refresh_token`.</li><li>Store these tokens securely on the client.</li></ol>
        </Card>

        <Card>
           <div className="flex justify-between items-start">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full mr-4"><RefreshCcw className="text-green-600 dark:text-green-300" size={24} /></div>
                <h3 className="text-xl font-semibold">Refresh Flow</h3>
              </div>
              {user.role === 'backend' && (<button onClick={() => setIsModalOpen(true)} className="text-primary-600 p-1"><Edit size={18}/></button>)}
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Access tokens are short-lived. Use the `refresh_token` to get a new access token without re-authenticating.</p>
            <ol className="list-decimal list-inside space-y-2"><li>When an API call returns a 401 Unauthorized, the access token may have expired.</li><li>Send a POST request to `/v1/auth/refresh` with the `refresh_token`.</li><li>The server returns a new `access_token`.</li><li>Retry the original API request with the new token.</li></ol>
        </Card>
      </div>

       {user.role === 'backend' && (<Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Edit Authentication Info"><p>Form to edit content.</p></Modal>)}
    </div>
  );
};

export default AuthenticationInfo;

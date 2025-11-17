import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ArrowRight, UserCheck, LogIn, ShoppingCart, CreditCard, Plus, Edit, Trash2 } from 'lucide-react';
import Card from '../../components/ui/Card.tsx';
import { User } from '../../types.ts';
import Modal from '../../components/ui/Modal.tsx';

interface OutletContextType {
    user: User;
}

const FlowNode: React.FC<{ icon: React.ElementType, title: string, children: React.ReactNode, isBackend: boolean }> = ({ icon: Icon, title, children, isBackend }) => (
    <div className="relative bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-center group">
        <div className="flex justify-center mb-2"><div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-full"><Icon className="text-primary-600 dark:text-primary-300" size={20} /></div></div>
        <h4 className="font-semibold">{title}</h4><p className="text-xs text-gray-500">{children}</p>
        {isBackend && (<div className="absolute top-1 right-1 flex space-x-1 opacity-0 group-hover:opacity-100"><button className="p-1 rounded-full"><Edit size={12}/></button><button className="p-1 rounded-full"><Trash2 size={12}/></button></div>)}
    </div>
);

const FlowArrow: React.FC = () => (<div className="flex-1 flex items-center justify-center"><ArrowRight className="text-gray-400" /></div>);

const Flows: React.FC = () => {
  const { user } = useOutletContext<OutletContextType>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isBackend = user.role === 'backend';

  return (
    <div>
        <div className="flex justify-between items-center mb-8">
            <div><h1 className="text-3xl font-bold mb-2">Flows</h1><p className="text-lg text-gray-600">Visual representations of common user and data flows.</p></div>
             {isBackend && (<button onClick={() => setIsModalOpen(true)} className="flex items-center bg-primary-600 text-white font-bold py-2 px-4 rounded-lg"><Plus size={18} className="mr-2" /> Add Flow</button>)}
        </div>
      <div className="space-y-12">
        <Card>
            <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-semibold">Login & Signup Flow</h3>{isBackend && (<div className="space-x-2"><button><Plus size={18}/></button><button><Trash2 size={18}/></button></div>)}</div>
            <div className="flex flex-col sm:flex-row items-stretch gap-2"><FlowNode icon={UserCheck} title="User Signup" isBackend={isBackend}>Enter name, email, password</FlowNode><FlowArrow /><FlowNode icon={LogIn} title="Login" isBackend={isBackend}>Submit credentials</FlowNode><FlowArrow /><FlowNode icon={CreditCard} title="Get Token" isBackend={isBackend}>Receive Bearer Token</FlowNode></div>
        </Card>
        <Card>
            <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-semibold">Payment Checkout Flow</h3>{isBackend && (<div className="space-x-2"><button><Plus size={18}/></button><button><Trash2 size={18}/></button></div>)}</div>
            <div className="flex flex-col sm:flex-row items-stretch gap-2"><FlowNode icon={ShoppingCart} title="Add to Cart" isBackend={isBackend}>User selects products</FlowNode><FlowArrow /><FlowNode icon={CreditCard} title="Enter Payment" isBackend={isBackend}>Submit card details</FlowNode><FlowArrow /><FlowNode icon={LogIn} title="Process Payment" isBackend={isBackend}>API call to `/v1/payments`</FlowNode><FlowArrow /><FlowNode icon={UserCheck} title="Confirmation" isBackend={isBackend}>Receive success or failure</FlowNode></div>
        </Card>
      </div>
       {isBackend && (<Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create/Edit Flow"><p>UI for building a new flow diagram.</p></Modal>)}
    </div>
  );
};

export default Flows;

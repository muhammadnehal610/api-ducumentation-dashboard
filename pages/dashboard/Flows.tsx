import React, { useState } from 'react';
import { ArrowRight, UserCheck, LogIn, ShoppingCart, CreditCard, Plus, Edit, Trash2 } from 'lucide-react';
import Card from '../../components/ui/Card';
import { User } from '../../types';
import Modal from '../../components/ui/Modal';

interface FlowsProps {
    user: User;
}

const FlowNode: React.FC<{ icon: React.ElementType, title: string, children: React.ReactNode, isBackend: boolean }> = ({ icon: Icon, title, children, isBackend }) => (
    <div className="relative bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-center group">
        <div className="flex justify-center mb-2">
            <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-full">
                <Icon className="text-primary-600 dark:text-primary-300" size={20} />
            </div>
        </div>
        <h4 className="font-semibold text-gray-800 dark:text-gray-200">{title}</h4>
        <p className="text-xs text-gray-500 dark:text-gray-400">{children}</p>
        {isBackend && (
            <div className="absolute top-1 right-1 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1 bg-gray-200 dark:bg-gray-700 rounded-full text-primary-600 hover:bg-gray-300"><Edit size={12}/></button>
                <button className="p-1 bg-gray-200 dark:bg-gray-700 rounded-full text-red-600 hover:bg-gray-300"><Trash2 size={12}/></button>
            </div>
        )}
    </div>
);

const FlowArrow: React.FC = () => (
    <div className="flex-1 flex items-center justify-center">
        <ArrowRight className="text-gray-400" />
    </div>
);

const Flows: React.FC<FlowsProps> = ({ user }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isBackend = user.role === 'backend';

  return (
    <div>
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8">
            <div>
                <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Flows</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                    Visual representations of common user and data flows.
                </p>
            </div>
             {isBackend && (
                <button onClick={() => setIsModalOpen(true)} className="flex items-center bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg w-full sm:w-auto">
                    <Plus size={18} className="mr-2" /> Add Flow
                </button>
            )}
        </div>

      <div className="space-y-12">
        <Card>
            <div className="flex justify-between items-center -mt-2 mb-4">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Login & Signup Flow</h3>
                {isBackend && (
                    <div className="space-x-2">
                        <button className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 p-1"><Plus size={18}/><span className="sr-only">Add Step</span></button>
                        <button className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1"><Trash2 size={18}/><span className="sr-only">Delete Flow</span></button>
                    </div>
                )}
            </div>
            <div className="flex flex-col sm:flex-row items-stretch gap-2">
               <FlowNode icon={UserCheck} title="User Signup" isBackend={isBackend}>Enter name, email, password</FlowNode>
               <FlowArrow />
               <FlowNode icon={LogIn} title="Login" isBackend={isBackend}>Submit credentials</FlowNode>
               <FlowArrow />
               <FlowNode icon={CreditCard} title="Get Token" isBackend={isBackend}>Receive Bearer Token</FlowNode>
            </div>
        </Card>

        <Card>
            <div className="flex justify-between items-center -mt-2 mb-4">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Payment Checkout Flow</h3>
                 {isBackend && (
                    <div className="space-x-2">
                        <button className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 p-1"><Plus size={18}/><span className="sr-only">Add Step</span></button>
                        <button className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1"><Trash2 size={18}/><span className="sr-only">Delete Flow</span></button>
                    </div>
                )}
            </div>
            <div className="flex flex-col sm:flex-row items-stretch gap-2">
               <FlowNode icon={ShoppingCart} title="Add to Cart" isBackend={isBackend}>User selects products</FlowNode>
               <FlowArrow />
               <FlowNode icon={CreditCard} title="Enter Payment" isBackend={isBackend}>Submit card details</FlowNode>
                <FlowArrow />
                <FlowNode icon={LogIn} title="Process Payment" isBackend={isBackend}>API call to `/v1/payments`</FlowNode>
               <FlowArrow />
               <FlowNode icon={UserCheck} title="Confirmation" isBackend={isBackend}>Receive success or failure</FlowNode>
            </div>
        </Card>
      </div>

       {isBackend && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create/Edit Flow">
            <p>UI for building a new flow diagram step-by-step.</p>
        </Modal>
      )}
    </div>
  );
};

export default Flows;
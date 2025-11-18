import React from 'react';
import Modal from '../ui/Modal.tsx';
import { Module } from '../../types.ts';
import { AlertTriangle } from 'lucide-react';

interface DeleteModuleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    module: Module | null;
}

const DeleteModuleModal: React.FC<DeleteModuleModalProps> = ({ isOpen, onClose, onConfirm, module }) => {
    if (!module) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Delete Module">
            <div className="space-y-4">
                <div className="flex items-start p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-red-500 dark:text-red-400 mr-3 flex-shrink-0" />
                    <div>
                        <h3 className="text-lg font-semibold text-red-800 dark:text-red-300">Are you sure?</h3>
                        <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                            You are about to delete the "<strong>{module.name}</strong>" module.
                            This will also permanently delete all endpoints associated with it. This action cannot be undone.
                        </p>
                    </div>
                </div>
                
                <div className="flex justify-end pt-4 space-x-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">
                        Cancel
                    </button>
                    <button 
                        type="button" 
                        onClick={onConfirm} 
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                    >
                        Delete Module
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default DeleteModuleModal;

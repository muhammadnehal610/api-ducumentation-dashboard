
import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal.tsx';
import { Service } from '../../types.ts';
import { AlertTriangle } from 'lucide-react';

interface DeleteServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    service: Service | null;
}

const DeleteServiceModal: React.FC<DeleteServiceModalProps> = ({ isOpen, onClose, onConfirm, service }) => {
    const [confirmationText, setConfirmationText] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setConfirmationText('');
        }
    }, [isOpen]);

    if (!service) return null;

    const isConfirmed = confirmationText === service.name;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Delete Service">
            <div className="space-y-4">
                <div className="flex items-start p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-red-500 dark:text-red-400 mr-3 flex-shrink-0" />
                    <div>
                        <h3 className="text-lg font-semibold text-red-800 dark:text-red-300">This action is irreversible.</h3>
                        <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                            Deleting the "<strong>{service.name}</strong>" service will permanently remove all of its associated data, including all modules, endpoints, and data schemas.
                        </p>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        To confirm, please type "<strong>{service.name}</strong>" in the box below.
                    </label>
                    <input 
                        type="text" 
                        value={confirmationText}
                        onChange={(e) => setConfirmationText(e.target.value)}
                        className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-red-500"
                    />
                </div>
                <div className="flex justify-end pt-4 space-x-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">
                        Cancel
                    </button>
                    <button 
                        type="button" 
                        onClick={onConfirm} 
                        disabled={!isConfirmed}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-red-400 dark:disabled:bg-red-800 disabled:cursor-not-allowed"
                    >
                        Delete Service
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default DeleteServiceModal;

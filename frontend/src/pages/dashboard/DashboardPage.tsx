
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import Card from '../../components/ui/Card.tsx';
import { User, OverviewCard, CardType } from '../../types.ts';
import Modal from '../../components/ui/Modal.tsx';
import { apiClient } from '../../services/apiClient.ts';
import { useDashboardContext } from '../../components/layout/DashboardLayout.tsx';
import Loading from '../../components/ui/Loading.tsx';

// A subset of icons from lucide-react for the picker
const availableIcons: { [key: string]: React.ElementType } = {
    Server: LucideIcons.Server,
    Lock: LucideIcons.Lock,
    GitMerge: LucideIcons.GitMerge,
    Info: LucideIcons.Info,
    Key: LucideIcons.Key,
    Book: LucideIcons.Book,
    Code: LucideIcons.Code,
    Link: LucideIcons.Link,
    Terminal: LucideIcons.Terminal,
    GitBranch: LucideIcons.GitBranch,
};
const iconNames = Object.keys(availableIcons);

const cardTypeOptions: { value: CardType, label: string, placeholder: string, fieldLabel: string }[] = [
    { value: 'custom', label: 'Custom Card', placeholder: 'Enter markdown-supported content...', fieldLabel: 'Content' },
    { value: 'baseUrl', label: 'Base URL', placeholder: 'https://api.example.com/v1', fieldLabel: 'URL' },
    { value: 'auth', label: 'Authentication', placeholder: 'API Keys are passed in the Authorization header...', fieldLabel: 'Authentication Details' },
    { value: 'version', label: 'Current Version', placeholder: 'v1.2.3', fieldLabel: 'Version Number' }
];

const DashboardPage: React.FC = () => {
  const { user } = useDashboardContext();
  const { serviceId } = useParams<{ serviceId: string }>();

  const [cards, setCards] = useState<OverviewCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<OverviewCard | null>(null);

  const [cardToDelete, setCardToDelete] = useState<OverviewCard | null>(null);

  const isBackend = user.role === 'backend';

  const fetchCards = useCallback(async () => {
    if (!serviceId) return;
    setIsLoading(true);
    setError(null);
    try {
        const response = await apiClient<{ data: OverviewCard[] }>(`/overview-cards?serviceId=${serviceId}`);
        setCards(response.data);
    } catch (err: any) {
        setError(err.message || 'Failed to fetch overview cards.');
    } finally {
        setIsLoading(false);
    }
  }, [serviceId]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleOpenModal = (card: OverviewCard | null) => {
    setEditingCard(card);
    setFormModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setFormModalOpen(false);
    setEditingCard(null);
  }

  const handleSaveCard = async (formData: Omit<OverviewCard, 'id'>) => {
    const payload = { ...formData, serviceId };
    try {
        if (editingCard) {
            await apiClient(`/overview-cards/${editingCard.id}`, { method: 'PUT', body: payload });
        } else {
            await apiClient('/overview-cards', { method: 'POST', body: payload });
        }
        fetchCards();
        handleCloseModal();
    } catch (err: any)
{
        alert(`Failed to save card: ${err.message}`);
    }
  };

  const handleDeleteCard = async () => {
    if (!cardToDelete) return;
    try {
        await apiClient(`/overview-cards/${cardToDelete.id}`, { method: 'DELETE' });
        fetchCards();
        setCardToDelete(null);
    } catch (err: any) {
        alert(`Failed to delete card: ${err.message}`);
    }
  }
  
  const CardIcon: React.FC<{iconName: string}> = ({ iconName }) => {
    const Icon = availableIcons[iconName] || LucideIcons.Info;
    return (
        <div className="p-2 rounded-full mr-4 bg-primary-100 dark:bg-primary-900/50">
            <Icon className="text-primary-600 dark:text-primary-400" />
        </div>
    );
  };

  if (isLoading) return <Loading />;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold mb-1 text-gray-900 dark:text-white">Project Overview</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">Welcome to the API documentation dashboard. You are logged in as a <span className="font-semibold capitalize">{user.role}</span> developer.</p>
        </div>
         {isBackend && (
            <button
                onClick={() => handleOpenModal(null)}
                className="flex items-center bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg mt-4 sm:mt-0 w-full sm:w-auto"
            >
                <LucideIcons.Plus size={18} className="mr-2"/>
                Add New Card
            </button>
         )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map(card => (
            <Card key={card.id}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <CardIcon iconName={card.icon} />
                        <h3 className="text-lg font-semibold">{card.title}</h3>
                    </div>
                     {isBackend && (
                        <div className="flex items-center space-x-2">
                            <button onClick={() => handleOpenModal(card)} className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 p-1"><LucideIcons.Edit size={18}/></button>
                            <button onClick={() => setCardToDelete(card)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1"><LucideIcons.Trash2 size={18}/></button>
                        </div>
                    )}
                </div>
                {card.cardType === 'baseUrl' ? (
                     <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-2 rounded-md">
                        <code className="text-sm text-gray-700 dark:text-gray-300 truncate">{card.content}</code>
                        <button onClick={() => handleCopy(card.content)} className="p-1.5 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
                        <LucideIcons.Copy size={16} />
                        </button>
                    </div>
                ) : (
                     <p className="text-sm text-gray-600 dark:text-gray-400">{card.content}</p>
                )}
            </Card>
        ))}
      </div>
      
      {isBackend && (
        <>
            <CardFormModal 
                isOpen={isFormModalOpen} 
                onClose={handleCloseModal} 
                onSave={handleSaveCard}
                card={editingCard}
            />
            <DeleteConfirmationModal
                isOpen={!!cardToDelete}
                onClose={() => setCardToDelete(null)}
                onConfirm={handleDeleteCard}
                cardName={cardToDelete?.title || ''}
            />
        </>
      )}
    </div>
  );
};

// --- Modals ---

const CardFormModal: React.FC<{
    isOpen: boolean,
    onClose: () => void,
    onSave: (data: Omit<OverviewCard, 'id'>) => void,
    card: OverviewCard | null
}> = ({ isOpen, onClose, onSave, card }) => {
    const [cardType, setCardType] = useState<CardType>('custom');
    const [title, setTitle] = useState('');
    const [icon, setIcon] = useState(iconNames[0]);
    const [content, setContent] = useState('');
    const [error, setError] = useState('');
    
    const selectedCardType = cardTypeOptions.find(opt => opt.value === cardType) || cardTypeOptions[0];

    useEffect(() => {
        if (isOpen) {
            setCardType(card?.cardType || 'custom');
            setTitle(card?.title || '');
            setIcon(card?.icon || iconNames[0]);
            setContent(card?.content || '');
            setError('');
        }
    }, [card, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!title.trim() || !content.trim() || !icon) {
            setError('All fields are required.');
            return;
        }
        onSave({ cardType, title, icon, content });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={card ? 'Edit Card' : 'Add New Card'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">Card Type</label>
                        <select value={cardType} onChange={e => setCardType(e.target.value as CardType)} className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-800 border rounded-md">
                            {cardTypeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Card Icon</label>
                        <select value={icon} onChange={e => setIcon(e.target.value)} className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-800 border rounded-md">
                            {iconNames.map(name => <option key={name} value={name}>{name}</option>)}
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium">Card Title</label>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Staging Environment" className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-800 border rounded-md" required />
                </div>
                 <div>
                    <label className="block text-sm font-medium">{selectedCardType.fieldLabel}</label>
                    <textarea value={content} onChange={e => setContent(e.target.value)} placeholder={selectedCardType.placeholder} rows={cardType === 'baseUrl' || cardType === 'version' ? 1 : 4} className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-800 border rounded-md" required></textarea>
                </div>
                <div className="flex justify-end pt-4">
                    <button type="button" onClick={onClose} className="mr-2 px-4 py-2 rounded-md">Cancel</button>
                    <button type="submit" className="px-4 py-2 text-white bg-primary-600 rounded-md">Save Card</button>
                </div>
            </form>
        </Modal>
    );
};

const DeleteConfirmationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    cardName: string;
}> = ({ isOpen, onClose, onConfirm, cardName }) => (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Card">
        <div className="space-y-4">
            <p>Are you sure you want to permanently delete the "<strong>{cardName}</strong>" card? This action cannot be undone.</p>
            <div className="flex justify-end pt-4 space-x-2">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-md">Cancel</button>
                <button type="button" onClick={onConfirm} className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700">Delete</button>
            </div>
        </div>
    </Modal>
);

export default DashboardPage;

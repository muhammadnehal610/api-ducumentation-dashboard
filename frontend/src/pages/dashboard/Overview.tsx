import React, { useState } from 'react';
import { Copy, Server, Lock, GitMerge, Edit, Trash2, Plus, Info } from 'lucide-react';
// FIX: Changed alias imports to relative paths with extensions for module resolution.
import Card from '../../components/ui/Card.tsx';
import { User } from '../../types.ts';
import Modal from '../../components/ui/Modal.tsx';

interface OverviewCardData {
  id: number;
  title: string;
  content: string;
  icon: React.ElementType;
  iconColor: string;
  isCode?: boolean;
}

const initialCards: OverviewCardData[] = [
    { id: 1, title: 'Base URL', content: 'https://api.example.com', icon: Server, iconColor: 'primary', isCode: true },
    { id: 2, title: 'Authentication', content: 'This API uses Bearer Token authentication. Include your token in the `Authorization` header.', icon: Lock, iconColor: 'green' },
    { id: 3, title: 'Current Version', content: 'v2.1.0', icon: GitMerge, iconColor: 'yellow' },
];

interface OverviewProps {
  user: User;
}

const Overview: React.FC<OverviewProps> = ({ user }) => {
  const [cards, setCards] = useState<OverviewCardData[]>(initialCards);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<OverviewCardData | null>(null);

  const isBackend = user.role === 'backend';

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleOpenModal = (card: OverviewCardData | null) => {
    setEditingCard(card);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCard(null);
  }

  const handleSaveCard = (formData: { title: string, content: string }) => {
    if (editingCard && editingCard.id) {
        // Editing existing card
        setCards(cards.map(c => c.id === editingCard.id ? { ...c, ...formData } : c));
    } else {
        // Adding new card
        const newCard: OverviewCardData = {
            id: Date.now(),
            ...formData,
            icon: Info,
            iconColor: 'gray',
        };
        setCards([...cards, newCard]);
    }
    handleCloseModal();
  };

  const handleDeleteCard = (cardId: number) => {
    if (window.confirm('Are you sure you want to delete this card?')) {
        setCards(cards.filter(c => c.id !== cardId));
    }
  }
  
  const CardIcon: React.FC<{icon: React.ElementType, color: string}> = ({ icon: Icon, color }) => (
    <div className={`p-2 bg-${color}-100 dark:bg-${color}-900 rounded-full mr-4`}>
        <Icon className={`text-${color}-600 dark:text-${color}-300`} />
    </div>
  );

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
                <Plus size={18} className="mr-2"/>
                Add New Card
            </button>
         )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map(card => (
            <Card key={card.id}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <CardIcon icon={card.icon} color={card.iconColor} />
                        <h3 className="text-lg font-semibold">{card.title}</h3>
                    </div>
                     {isBackend && (
                        <div className="flex items-center space-x-2">
                            <button onClick={() => handleOpenModal(card)} className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 p-1"><Edit size={18}/></button>
                            <button onClick={() => handleDeleteCard(card.id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1"><Trash2 size={18}/></button>
                        </div>
                    )}
                </div>
                {card.isCode ? (
                     <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-2 rounded-md">
                        <code className="text-sm text-gray-700 dark:text-gray-300 truncate">{card.content}</code>
                        <button onClick={() => handleCopy(card.content)} className="p-1.5 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
                        <Copy size={16} />
                        </button>
                    </div>
                ) : card.title === 'Current Version' ? (
                     <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{card.content}</p>
                ) : (
                     <p className="text-sm text-gray-600 dark:text-gray-400">{card.content}</p>
                )}
            </Card>
        ))}
      </div>
      
      <Card title="App Flow Diagram">
          <div className="p-8 text-center bg-gray-100 dark:bg-gray-800 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400">[Placeholder for a visual diagram of the application flow]</p>
              <p className="text-sm text-gray-400 mt-2">This could be an image or a mermaid.js chart showing how services interact.</p>
          </div>
      </Card>
      
      {isBackend && (
        <OverviewModal 
            isOpen={isModalOpen} 
            onClose={handleCloseModal} 
            onSave={handleSaveCard}
            card={editingCard}
        />
      )}
    </div>
  );
};

// Modal Component specific to this page for form management
const OverviewModal: React.FC<{
    isOpen: boolean,
    onClose: () => void,
    onSave: (data: {title: string, content: string}) => void,
    card: OverviewCardData | null
}> = ({ isOpen, onClose, onSave, card }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    React.useEffect(() => {
        if (card) {
            setTitle(card.title);
            setContent(card.content);
        } else {
            setTitle('');
            setContent('');
        }
    }, [card, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ title, content });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={card ? 'Edit Card' : 'Add New Card'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Card Title</label>
                    <input 
                        type="text" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Staging URL"
                        className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md" 
                        required
                    />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Card Content</label>
                    <textarea 
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Enter card content or description" 
                        rows={4}
                        className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md"
                        required
                    ></textarea>
                </div>
                <div className="flex justify-end pt-4">
                    <button type="button" onClick={onClose} className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">Cancel</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">Save Card</button>
                </div>
            </form>
        </Modal>
    );
};

export default Overview;

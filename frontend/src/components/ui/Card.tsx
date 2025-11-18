import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', title, collapsible = false, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const handleToggle = () => {
      if (collapsible) setIsOpen(prev => !prev);
  }

  return (
    <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm ${className}`}>
      {title && (
        <div 
          className={`px-6 py-4 flex justify-between items-center ${isOpen ? 'border-b border-gray-200 dark:border-gray-800' : ''} ${collapsible ? 'cursor-pointer' : ''}`} 
          onClick={handleToggle}
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          {collapsible && (
            <span>
                {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </span>
          )}
        </div>
      )}
      {(!collapsible || isOpen) && (
        <div className="p-6">
          {children}
        </div>
      )}
    </div>
  );
};

export default Card;
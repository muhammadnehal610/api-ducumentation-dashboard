import React from 'react';
import { ChevronRight } from 'lucide-react';
// FIX: Changed alias import to relative path with extension for module resolution.
import { Breadcrumb, Page } from '../../types.ts';

interface BreadcrumbsProps {
  items: Breadcrumb[];
  onNavigate: (page: Page, breadcrumbs?: Breadcrumb[]) => void;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, onNavigate }) => {
  return (
    <nav className="flex items-center text-sm text-gray-500 dark:text-gray-400" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        {items.map((item, index) => (
          <li key={index} className="inline-flex items-center">
            {index > 0 && <ChevronRight className="w-4 h-4 mx-1" />}
            <button
              onClick={() => onNavigate(item.page, items.slice(0, index + 1))}
              className={`inline-flex items-center font-medium ${
                index === items.length - 1
                  ? 'text-gray-700 dark:text-gray-200'
                  : 'hover:text-primary-600 dark:hover:text-primary-400'
              }`}
              disabled={index === items.length - 1}
            >
              {item.name}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;

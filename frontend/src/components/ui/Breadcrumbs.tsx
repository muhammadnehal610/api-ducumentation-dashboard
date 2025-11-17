import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Breadcrumb } from '../../types.ts';

interface BreadcrumbsProps {
  items: Breadcrumb[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav className="flex items-center text-sm text-gray-500 dark:text-gray-400" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        {items.map((item, index) => (
          <li key={index} className="inline-flex items-center">
            {index > 0 && <ChevronRight className="w-4 h-4 mx-1" />}
            {index === items.length - 1 ? (
                 <span className="inline-flex items-center font-medium text-gray-700 dark:text-gray-200">
                    {item.name}
                 </span>
            ) : (
                <Link
                    to={item.page} // The page property should now be a URL path
                    className="inline-flex items-center font-medium hover:text-primary-600 dark:hover:text-primary-400"
                >
                    {item.name}
                </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
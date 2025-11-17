import React from 'react';
import { HttpMethod } from '../../types';

interface BadgeProps {
  method: HttpMethod;
}

const Badge: React.FC<BadgeProps> = ({ method }) => {
  const colorClasses = {
    GET: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    POST: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    PUT: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    DELETE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    PATCH: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  };

  return (
    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${colorClasses[method]}`}>
      {method}
    </span>
  );
};

export default Badge;

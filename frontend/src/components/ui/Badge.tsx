import React from 'react';
// FIX: Changed alias import to relative path with extension for module resolution.
import { HttpMethod } from '../../types.ts';

interface BadgeProps {
  method: HttpMethod;
}

const Badge: React.FC<BadgeProps> = ({ method }) => {
  const colorClasses: Record<HttpMethod, string> = {
    GET: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    POST: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    PUT: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    DELETE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    PATCH: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    OPTIONS: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    HEAD: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
    CONNECT: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
    TRACE: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  };

  return (
    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${colorClasses[method] || colorClasses.GET}`}>
      {method}
    </span>
  );
};

export default Badge;
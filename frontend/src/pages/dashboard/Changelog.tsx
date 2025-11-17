import React from 'react';
import { Plus, Edit, AlertTriangle, Bug } from 'lucide-react';
import { changelogItems } from '@/constants/dummyData';
import { User } from '@/types';

interface ChangelogProps {
    user: User;
}

const changeTypeMap = {
  new: { icon: Plus, color: 'green', label: 'New' },
  update: { icon: Edit, color: 'blue', label: 'Update' },
  breaking: { icon: AlertTriangle, color: 'red', label: 'Breaking' },
  fix: { icon: Bug, color: 'yellow', label: 'Fix' },
};

const Changelog: React.FC<ChangelogProps> = ({ user }) => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Changelog</h1>
       <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        A timeline of new features, updates, and breaking changes. This is system-generated and cannot be edited.
      </p>
      <div className="relative pl-8">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
        
        {changelogItems.map((item, index) => (
          <div key={index} className="mb-12">
            <div className="absolute left-0 -translate-x-1/2 mt-1.5 w-8 h-8 bg-primary-500 rounded-full border-4 border-gray-100 dark:border-gray-950 flex items-center justify-center">
                <span className="text-white text-xs font-bold">{item.version.split('.')[0]}</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">{item.date}</p>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">{item.version}</h2>
              <div className="space-y-4">
                {item.changes.map((change, changeIndex) => {
                  const { icon: Icon, color, label } = changeTypeMap[change.type as keyof typeof changeTypeMap];
                  return (
                    <div key={changeIndex} className="flex items-start">
                        <div className={`mr-4 mt-1 p-1.5 bg-${color}-100 dark:bg-${color}-900 rounded-full`}>
                             <Icon className={`w-4 h-4 text-${color}-600 dark:text-${color}-300`} />
                        </div>
                      <div className="flex-1">
                        <span className={`text-sm font-semibold text-${color}-600 dark:text-${color}-300`}>{label}</span>
                        <p className="text-gray-600 dark:text-gray-400">{change.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Changelog;

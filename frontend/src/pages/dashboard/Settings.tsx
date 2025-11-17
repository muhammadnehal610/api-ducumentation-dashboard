import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import { Eye, EyeOff } from 'lucide-react';
import { User } from '@/types';

interface SettingsProps {
    user: User;
}

const Settings: React.FC<SettingsProps> = ({ user }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const dummyToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    }
    setIsDarkMode(!isDarkMode);
  };
  
  const handleClearToken = () => {
    alert("Authentication token cleared. You would typically be logged out now.");
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Settings</h1>
      <div className="space-y-8 max-w-2xl">
        <Card title="Appearance">
          <div className="flex items-center justify-between">
            <p className="text-gray-700 dark:text-gray-300">Theme</p>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Light</span>
              <label htmlFor="theme-toggle" className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" id="theme-toggle" className="sr-only peer" checked={isDarkMode} onChange={toggleDarkMode} />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
              <span className="text-sm text-gray-500">Dark</span>
            </div>
          </div>
        </Card>

        <Card title="Authentication">
            <div className="space-y-4">
                <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">Stored Auth Token</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">This is the token used for making authenticated requests in the API Playground.</p>
                    <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-3 rounded-md font-mono text-sm">
                        <span className="truncate pr-4 text-gray-700 dark:text-gray-300">
                          {showToken ? dummyToken : '••••••••••••••••••••••••••••••••'}
                        </span>
                        <button onClick={() => setShowToken(!showToken)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                           {showToken ? <EyeOff size={18}/> : <Eye size={18} />}
                        </button>
                    </div>
                </div>
                 <button 
                  onClick={handleClearToken}
                  className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
                >
                  Clear Token
                </button>
            </div>
        </Card>
      </div>
    </div>
  );
};

export default Settings;

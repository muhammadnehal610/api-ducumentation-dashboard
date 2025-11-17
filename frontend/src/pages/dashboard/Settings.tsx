
import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card.tsx';
import { Eye, EyeOff } from 'lucide-react';

const Settings: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const dummyToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

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

  // FIX: Moved Icon component inside Settings component to access state.
  const Icon = () => showToken ? <EyeOff size={18}/> : <Eye size={18} />;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <div className="space-y-8 max-w-2xl">
        <Card title="Appearance">
          <div className="flex items-center justify-between">
            <p>Theme</p>
            <div className="flex items-center space-x-2">
              <span>Light</span>
              <label htmlFor="theme-toggle" className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" id="theme-toggle" className="sr-only peer" checked={isDarkMode} onChange={toggleDarkMode} />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
              <span>Dark</span>
            </div>
          </div>
        </Card>
        <Card title="Authentication">
            <div className="space-y-4">
                <div>
                    <h4 className="font-semibold">Stored Auth Token</h4>
                    <p className="text-sm text-gray-500 mb-2">Token for API Playground requests.</p>
                    <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-3 rounded-md font-mono text-sm">
                        <span className="truncate pr-4">{showToken ? dummyToken : '•••••••••••••••••'}</span>
                        <button onClick={() => setShowToken(!showToken)}><Icon /></button>
                    </div>
                </div>
                 <button onClick={handleClearToken} className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg">Clear Token</button>
            </div>
        </Card>
      </div>
    </div>
  );
};

export default Settings;

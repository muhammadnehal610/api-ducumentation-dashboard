import React, { useState } from 'react';
import { Book } from 'lucide-react';
import { User, UserRole } from '../../types';

interface RegisterPageProps {
  onRegister: (user: Omit<User, 'id' | 'status'>) => Promise<void>;
  onSwitchToLogin: () => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onRegister, onSwitchToLogin }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<UserRole>('frontend');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState('');

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            await onRegister({ name, email, password, role });
            setSuccess('Registration successful! Please log in.');
            // Clear form or redirect after a delay
            setTimeout(() => {
                onSwitchToLogin();
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
            <div className="flex items-center">
                 <Book size={40} className="text-primary-500" />
                 <h1 className="text-4xl font-bold ml-3 text-gray-800 dark:text-gray-200">API Docs</h1>
            </div>
        </div>
        <div className="bg-white dark:bg-gray-900 shadow-xl rounded-lg p-8">
          <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-200">Create Account</h2>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-8">Get started with your new account</p>
          <form onSubmit={handleRegister}>
            {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
            {success && <p className="text-green-500 text-sm text-center mb-4">{success}</p>}
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="name">
                Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-2 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
                disabled={isLoading}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
                disabled={isLoading}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
                disabled={isLoading}
              />
            </div>
            <div className="mb-6">
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="role">
                    Role
                </label>
                <select id="role" value={role} onChange={e => setRole(e.target.value as UserRole)}
                    className="w-full px-4 py-2 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    disabled={isLoading}>
                    <option value="frontend">Frontend Developer</option>
                    <option value="backend">Backend Developer</option>
                </select>
            </div>
            <button
              type="submit"
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-6">
            Already have an account?{' '}
            <button onClick={onSwitchToLogin} className="font-bold text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
              Log in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

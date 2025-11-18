import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage.tsx';
import RegisterPage from './pages/auth/RegisterPage.tsx';
import DashboardLayout from './components/layout/DashboardLayout.tsx';
import Loading from './components/ui/Loading.tsx';
import { User } from './types.ts';
import { apiClient } from './services/apiClient.ts';

// Lazy-loaded page components as per the new architecture
const ServiceListPage = lazy(() => import('./pages/ServiceListPage.tsx'));
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage.tsx'));
const ModulesPage = lazy(() => import('./pages/modules/ModulesPage.tsx'));
const ModuleDetailPage = lazy(() => import('./pages/modules/ModuleDetailPage.tsx'));
const EndpointsPage = lazy(() => import('./pages/endpoints/EndpointsPage.tsx'));
const EndpointFormPage = lazy(() => import('./pages/endpoints/EndpointFormPage.tsx'));
const EndpointDetailPage = lazy(() => import('./pages/endpoints/EndpointDetailPage.tsx'));
const SchemasPage = lazy(() => import('./pages/schemas/SchemasPage.tsx'));
const SchemaCreatePage = lazy(() => import('./pages/schemas/SchemaCreatePage.tsx'));
const SchemaDetailPage = lazy(() => import('./pages/schemas/SchemaDetailPage.tsx'));
const UserManagementPage = lazy(() => import('./pages/user-management/UserManagementPage.tsx'));
const ApiPlayground = lazy(() => import('./pages/dashboard/ApiPlayground.tsx'));
const AuthenticationInfo = lazy(() => import('./pages/dashboard/AuthenticationInfo.tsx'));
const Flows = lazy(() => import('./pages/dashboard/Flows.tsx'));
const ErrorCodes = lazy(() => import('./pages/dashboard/ErrorCodes.tsx'));
const Changelog = lazy(() => import('./pages/dashboard/Changelog.tsx'));
const Settings = lazy(() => import('./pages/dashboard/Settings.tsx'));


const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authPage, setAuthPage] = useState< 'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Theme initialization
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Check for persisted user session
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('accessToken');

    if (storedUser && storedToken) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse session from localStorage", error);
        handleLogout();
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = async (email: string, password: string): Promise<void> => {
    const response = await apiClient<{ success: true, accessToken: string, user: User }>('/auth/signin', {
        method: 'POST',
        body: { email, password },
    });
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('user', JSON.stringify(response.user));
    setCurrentUser(response.user);
  };

  const handleRegister = async (userData: Omit<User, 'id' | 'status'>) => {
     await apiClient('/auth/signup', {
        method: 'POST',
        body: userData,
    });
    setAuthPage('login');
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    localStorage.removeItem('selectedService'); // Also clear service on logout
    setCurrentUser(null);
    apiClient('/auth/logout', { method: 'POST' }).catch(err => console.error("Logout failed on server:", err));
  };

  if (isLoading) {
    return <Loading />;
  }
  
  if (!currentUser) {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage onLogin={handleLogin} onSwitchToRegister={() => setAuthPage('register')} />} />
            <Route path="/register" element={<RegisterPage onRegister={handleRegister} onSwitchToLogin={() => setAuthPage('login')} />} />
            <Route path="*" element={<Navigate to={authPage === 'login' ? '/login' : '/register'} />} />
        </Routes>
    );
  }

  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/:serviceId" element={<DashboardLayout user={currentUser} onLogout={handleLogout} />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="modules" element={<ModulesPage />} />
            <Route path="modules/:moduleId" element={<ModuleDetailPage />} />
            <Route path="endpoints" element={<EndpointsPage />} />
            <Route path="endpoints/create" element={<EndpointFormPage />} />
            <Route path="endpoints/:endpointId" element={<EndpointDetailPage />} />
            <Route path="endpoints/:endpointId/edit" element={<EndpointFormPage />} />
            <Route path="schemas" element={<SchemasPage />} />
            <Route path="schemas/create" element={<SchemaCreatePage />} />
            <Route path="schemas/:schemaId" element={<SchemaDetailPage />} />
            <Route path="user-management" element={<UserManagementPage />} />
            <Route path="api-playground" element={<ApiPlayground />} />
            <Route path="api-playground/:endpointId" element={<ApiPlayground />} />
            <Route path="authentication" element={<AuthenticationInfo />} />
            <Route path="flows" element={<Flows />} />
            <Route path="error-codes" element={<ErrorCodes />} />
            <Route path="changelog" element={<Changelog />} />
            <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="/" element={<ServiceListPage user={currentUser} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Suspense>
  );
};

export default App;
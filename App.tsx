import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from './components/layout/DashboardLayout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import Overview from './pages/dashboard/Overview';
import EndpointsList from './pages/dashboard/EndpointsList';
import EndpointDetail from './pages/dashboard/EndpointDetail';
import EndpointCreateEdit from './pages/dashboard/EndpointCreateEdit';
import ApiPlayground from './pages/dashboard/ApiPlayground';
import Models from './pages/dashboard/Models';
import Schemas from './pages/dashboard/Schemas';
import AuthenticationInfo from './pages/dashboard/AuthenticationInfo';
import Flows from './pages/dashboard/Flows';
import ErrorCodes from './pages/dashboard/ErrorCodes';
import Changelog from './pages/dashboard/Changelog';
import Settings from './pages/dashboard/Settings';
import Modules from './pages/dashboard/Modules';
import UserManagement from './pages/dashboard/UserManagement';
import { Page, AuthPage, User, Breadcrumb } from './types';
import { endpoints } from './constants/dummyData';
import { apiClient, ApiError } from './services/apiClient';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authPage, setAuthPage] = useState<AuthPage>('login');
  
  const [page, setPage] = useState<Page>('Overview');
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([{ name: 'Home', page: 'Overview' }]);
  
  const [selectedEndpointId, setSelectedEndpointId] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [selectedModelName, setSelectedModelName] = useState<string | null>(null);

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
        console.error("Failed to parse user from localStorage", error);
        handleLogout();
      }
    }

  }, []);

  const handleNavigate = useCallback((newPage: Page, newBreadcrumbs?: Breadcrumb[]) => {
    setPage(newPage);
    if (!['Endpoint Details', 'Endpoints', 'Endpoint Form', 'SchemaDetails', 'Schemas'].includes(newPage)) {
        setSelectedEndpointId(null);
        setSelectedModule(null);
        setSelectedModelName(null);
    }

    if (newBreadcrumbs) {
      setBreadcrumbs(newBreadcrumbs);
    } else {
      // Default breadcrumb handling
      if (newPage === 'Overview') {
        setBreadcrumbs([{ name: 'Home', page: 'Overview' }]);
      } else if (newPage === 'Schemas') {
        setBreadcrumbs([{ name: 'Home', page: 'Overview' }, { name: 'Schemas', page: 'Schemas' }]);
      }
      else {
        setBreadcrumbs([{ name: 'Home', page: 'Overview' }, { name: newPage, page: newPage }]);
      }
    }
  }, []);

  const handleSelectEndpoint = (endpointId: string) => {
    const endpoint = endpoints.find(e => e.id === endpointId);
    if (!endpoint) return;
    setSelectedEndpointId(endpointId);
    
    const newBreadcrumbs = [
        { name: 'Home', page: 'Overview' as Page },
        { name: 'Endpoints', page: 'Endpoints' as Page },
        { name: endpoint.path, page: 'Endpoint Details' as Page }
    ];
    handleNavigate('Endpoint Details', newBreadcrumbs);
  };
  
  const handleSelectModule = (moduleName: string) => {
    setSelectedModule(moduleName);
    setPage('Endpoints');
    setBreadcrumbs([
      { name: 'Home', page: 'Overview' },
      { name: 'Modules', page: 'Modules' },
      { name: moduleName, page: 'Endpoints' }
    ]);
  };
  
  const handleSelectModel = (modelName: string) => {
    setSelectedModelName(modelName);
    handleNavigate('SchemaDetails', [
      { name: 'Home', page: 'Overview' },
      { name: 'Schemas', page: 'Schemas' },
      { name: modelName, page: 'SchemaDetails' }
    ]);
  };

  const handleCreateEndpoint = () => {
    setSelectedEndpointId(null);
    handleNavigate('Endpoint Form', [
        { name: 'Home', page: 'Overview' },
        { name: 'Endpoints', page: 'Endpoints' },
        { name: 'Create', page: 'Endpoint Form' }
    ]);
  };

  const handleEditEndpoint = (endpointId: string) => {
    const endpoint = endpoints.find(e => e.id === endpointId);
    if (!endpoint) return;
    setSelectedEndpointId(endpointId);
    handleNavigate('Endpoint Form', [
        { name: 'Home', page: 'Overview' },
        { name: 'Endpoints', page: 'Endpoints' },
        { name: 'Edit', page: 'Endpoint Form' }
    ]);
  };

  const handleLogin = async (email: string, password: string):Promise<void> => {
    // Fix: Pass the body as a plain object. The `apiClient` handles stringification.
    const response = await apiClient<{ success: true, accessToken: string, user: User }>('/auth/signin', {
        method: 'POST',
        body: { email, password },
    });
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('user', JSON.stringify(response.user));
    setCurrentUser(response.user);
  };

  const handleRegister = async (userData: Omit<User, 'id' | 'status'>) => {
    // Fix: Pass the body as a plain object. The `apiClient` handles stringification.
     await apiClient('/auth/signup', {
        method: 'POST',
        body: userData,
    });
    setAuthPage('login');
  };

  const handleLogout = () => {
    // Optimistically clear client state
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setPage('Overview');
    setBreadcrumbs([{ name: 'Home', page: 'Overview' }]);
    // Inform backend (optional, for session invalidation if using refresh tokens)
    apiClient('/auth/logout', { method: 'POST' }).catch(err => console.error("Logout failed on server:", err));
  }
  
  const renderContent = () => {
    if (!currentUser) return null;

    const pageProps = { user: currentUser };

    if (page === 'Endpoint Form') {
      return <EndpointCreateEdit
        endpointId={selectedEndpointId}
        onNavigate={handleNavigate}
        user={currentUser}
      />;
    }

    if (page === 'Endpoint Details' && selectedEndpointId) {
        return <EndpointDetail 
            endpointId={selectedEndpointId} 
            onNavigateToPlayground={() => handleNavigate('API Playground')} 
            onEditEndpoint={handleEditEndpoint}
            user={currentUser}
        />;
    }
    
    if (page === 'SchemaDetails' && selectedModelName) {
        return <Schemas
            modelName={selectedModelName}
            user={currentUser}
        />
    }

    const pages = {
        'Overview': <Overview {...pageProps} />,
        'Modules': <Modules {...pageProps} onSelectModule={handleSelectModule} />,
        'Endpoints': <EndpointsList {...pageProps} onSelectEndpoint={handleSelectEndpoint} selectedModule={selectedModule} onCreateEndpoint={handleCreateEndpoint} onEditEndpoint={handleEditEndpoint} />,
        'API Playground': <ApiPlayground {...pageProps} selectedEndpointId={selectedEndpointId} />,
        'Schemas': <Models {...pageProps} onSelectModel={handleSelectModel} />,
        'Authentication': <AuthenticationInfo {...pageProps} />,
        'Flows': <Flows {...pageProps} />,
        'Error Codes': <ErrorCodes {...pageProps} />,
        'Changelog': <Changelog {...pageProps} />,
        'Settings': <Settings {...pageProps} />,
        'User Management': currentUser.role === 'backend' ? <UserManagement {...pageProps} /> : <Overview {...pageProps} />,
    };

    return pages[page] || <Overview {...pageProps} />;
  };

  if (!currentUser) {
    return authPage === 'login' ? (
      <LoginPage 
        onLogin={handleLogin}
        onSwitchToRegister={() => setAuthPage('register')} 
      />
    ) : (
      <RegisterPage 
        onRegister={handleRegister} 
        onSwitchToLogin={() => setAuthPage('login')} 
      />
    );
  }

  return (
    <DashboardLayout 
      user={currentUser}
      onLogout={handleLogout}
      breadcrumbs={breadcrumbs}
      onNavigate={handleNavigate}
    >
      {renderContent()}
    </DashboardLayout>
  );
};

export default App;
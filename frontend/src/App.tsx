
import React, { useState, useEffect, useCallback } from 'react';
// FIX: Changed alias imports to relative paths with extensions for module resolution.
import DashboardLayout from './components/layout/DashboardLayout.tsx';
import LoginPage from './pages/auth/LoginPage.tsx';
import RegisterPage from './pages/auth/RegisterPage.tsx';
import ServiceSelector from './pages/ServiceSelector.tsx';
import Overview from './pages/dashboard/Overview.tsx';
import EndpointsList from './pages/dashboard/EndpointsList.tsx';
import EndpointDetail from './pages/dashboard/EndpointDetail.tsx';
import EndpointCreateEdit from './pages/dashboard/EndpointCreateEdit.tsx';
import ApiPlayground from './pages/dashboard/ApiPlayground.tsx';
import Models from './pages/dashboard/Models.tsx';
import Schemas from './pages/dashboard/Schemas.tsx';
import AuthenticationInfo from './pages/dashboard/AuthenticationInfo.tsx';
import Flows from './pages/dashboard/Flows.tsx';
import ErrorCodes from './pages/dashboard/ErrorCodes.tsx';
import Changelog from './pages/dashboard/Changelog.tsx';
import Settings from './pages/dashboard/Settings.tsx';
import Modules from './pages/dashboard/Modules.tsx';
import UserManagement from './pages/dashboard/UserManagement.tsx';
import { Page, AuthPage, User, Breadcrumb, Service } from './types.ts';
import { apiClient } from './services/apiClient.ts';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authPage, setAuthPage] = useState<AuthPage>('login');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  
  const [page, setPage] = useState<Page>('Overview');
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([{ name: 'Home', page: 'Overview' }]);
  
  const [selectedEndpointId, setSelectedEndpointId] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
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
    const storedService = localStorage.getItem('selectedService');

    if (storedUser && storedToken) {
      try {
        setCurrentUser(JSON.parse(storedUser));
        if (storedService) {
            setSelectedService(JSON.parse(storedService));
        }
      } catch (error) {
        console.error("Failed to parse session from localStorage", error);
        handleLogout();
      }
    }

  }, []);

  const handleSelectService = (service: Service) => {
    setSelectedService(service);
    localStorage.setItem('selectedService', JSON.stringify(service));
    handleNavigate('Overview');
  };
  
  const handleSwitchService = () => {
    setSelectedService(null);
    localStorage.removeItem('selectedService');
  };

  const handleNavigate = useCallback((newPage: Page, newBreadcrumbs?: Breadcrumb[]) => {
    setPage(newPage);
    if (!['Endpoint Details', 'Endpoints', 'Endpoint Form', 'SchemaDetails', 'Schemas'].includes(newPage)) {
        setSelectedEndpointId(null);
        setSelectedModule(null);
        setSelectedModelId(null);
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

  const handleSelectEndpoint = (endpointId: string, endpointPath: string) => {
    setSelectedEndpointId(endpointId);
    
    const newBreadcrumbs = [
        { name: 'Home', page: 'Overview' as Page },
        { name: 'Endpoints', page: 'Endpoints' as Page },
        { name: endpointPath, page: 'Endpoint Details' as Page }
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
  
  const handleSelectModel = (modelId: string, modelName: string) => {
    setSelectedModelId(modelId);
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
    setSelectedEndpointId(endpointId);
    handleNavigate('Endpoint Form', [
        { name: 'Home', page: 'Overview' },
        { name: 'Endpoints', page: 'Endpoints' },
        { name: 'Edit', page: 'Endpoint Form' }
    ]);
  };

  const handleLogin = async (email: string, password: string):Promise<void> => {
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
    // Optimistically clear client state
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    localStorage.removeItem('selectedService');
    setCurrentUser(null);
    setSelectedService(null);
    setPage('Overview');
    setBreadcrumbs([{ name: 'Home', page: 'Overview' }]);
    // Inform backend (optional, for session invalidation if using refresh tokens)
    apiClient('/auth/logout', { method: 'POST' }).catch(err => console.error("Logout failed on server:", err));
  }
  
  const renderContent = () => {
    if (!currentUser || !selectedService) return null;

    const pageProps = { user: currentUser, serviceId: selectedService.id };

    if (page === 'Endpoint Form') {
      return <EndpointCreateEdit
        endpointId={selectedEndpointId}
        onNavigate={handleNavigate}
        user={currentUser}
        // FIX: Pass serviceId to the component.
        serviceId={selectedService.id}
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
    
    if (page === 'SchemaDetails' && selectedModelId && selectedModelName) {
        return <Schemas
            modelId={selectedModelId}
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

  if (!selectedService) {
    return <ServiceSelector onSelectService={handleSelectService} user={currentUser} />;
  }

  return (
    <DashboardLayout 
      user={currentUser}
      onLogout={handleLogout}
      breadcrumbs={breadcrumbs}
      onNavigate={handleNavigate}
      service={selectedService}
      onSwitchService={handleSwitchService}
    >
      {renderContent()}
    </DashboardLayout>
  );
};

export default App;
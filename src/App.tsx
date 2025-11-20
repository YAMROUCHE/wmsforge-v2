import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { SidebarProvider, useSidebar } from './contexts/SidebarContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Sidebar from './components/layout/Sidebar';
import ToastNotifications from './components/ToastNotifications';
import ProtectedRoute from './components/ProtectedRoute';

// Import test page directly (not lazy) for debugging
import TestPage from './pages/TestPage';

// Lazy load pages for better performance
const Landing = lazy(() => import('./pages/Landing'));
const Auth = lazy(() => import('./pages/Auth'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Products = lazy(() => import('./pages/Products'));
const Inventory = lazy(() => import('./pages/Inventory'));
const Orders = lazy(() => import('./pages/Orders'));
const Locations = lazy(() => import('./pages/Locations'));
const Waves = lazy(() => import('./pages/Waves'));
const Tasks = lazy(() => import('./pages/Tasks'));
const Labor = lazy(() => import('./pages/Labor'));
const Reports = lazy(() => import('./pages/Reports'));
const Settings = lazy(() => import('./pages/Settings'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const OnboardingSimple = lazy(() => import('./pages/OnboardingSimple'));
const WarehouseDashboard = lazy(() => import('./pages/WarehouseDashboard'));
const EnterpriseTest = lazy(() => import('./pages/EnterpriseTest'));
const Integrations = lazy(() => import('./pages/Integrations'));

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // Data fresh for 30s
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppRoutes() {
  const { isCollapsed } = useSidebar();
  const location = useLocation();

  // Public routes without sidebar
  const isPublicRoute = location.pathname === '/' || location.pathname === '/auth';

  // Calculate main content classes
  const getMainClasses = () => {
    if (isPublicRoute) {
      return 'flex-1 transition-all duration-300';
    }
    const marginClass = isCollapsed ? 'ml-16' : 'ml-60';
    return `flex-1 transition-all duration-300 bg-gray-50 dark:bg-gray-950 min-h-screen ${marginClass}`;
  };

  return (
    <div className="flex">
      {!isPublicRoute && <Sidebar />}
      <main className={getMainClasses()}>
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-screen">
              <div className="text-gray-600 dark:text-gray-300">Chargement...</div>
            </div>
          }
        >
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />

            {/* Protected routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
            <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            <Route path="/locations" element={<ProtectedRoute><Locations /></ProtectedRoute>} />
            <Route path="/waves" element={<ProtectedRoute><Waves /></ProtectedRoute>} />
            <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
            <Route path="/labor" element={<ProtectedRoute><Labor /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/integrations" element={<ProtectedRoute><Integrations /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route path="/onboarding-simple" element={<ProtectedRoute><OnboardingSimple /></ProtectedRoute>} />
            <Route path="/warehouse-dashboard" element={<ProtectedRoute><WarehouseDashboard /></ProtectedRoute>} />
            <Route path="/enterprise-test" element={<ProtectedRoute><EnterpriseTest /></ProtectedRoute>} />
            <Route path="/test" element={<ProtectedRoute><TestPage /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </main>
      <ToastNotifications />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <NotificationProvider>
          <AuthProvider>
            <SidebarProvider>
              <Router>
                <AppRoutes />
              </Router>
            </SidebarProvider>
          </AuthProvider>
        </NotificationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

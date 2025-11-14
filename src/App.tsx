import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import Locations from './pages/Locations';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Onboarding from './pages/Onboarding';
import WarehouseDashboard from './pages/WarehouseDashboard';
import { AuthProvider } from './contexts/AuthContext';
import { SidebarProvider, useSidebar } from './contexts/SidebarContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Sidebar from './components/layout/Sidebar';

function MainContent() {
  const { isCollapsed } = useSidebar();

  return (
    <main className={`flex-1 transition-all duration-300 bg-gray-50 dark:bg-gray-950 min-h-screen ${isCollapsed ? 'ml-16' : 'ml-60'}`}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/locations" element={<Locations />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/warehouse-dashboard" element={<WarehouseDashboard />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </main>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SidebarProvider>
          <Router>
            <div className="flex">
              <Sidebar />
              <MainContent />
            </div>
          </Router>
        </SidebarProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

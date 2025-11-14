import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Inventory from './pages/Inventory';
import Onboarding from './pages/Onboarding';
import WarehouseDashboard from './pages/WarehouseDashboard';
import { AuthProvider } from './contexts/AuthContext';
import Sidebar from './components/layout/Sidebar';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex">
          <Sidebar />
          <main className="flex-1 ml-16">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/warehouse-dashboard" element={<WarehouseDashboard />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

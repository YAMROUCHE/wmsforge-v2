import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Boxes, 
  ShoppingCart, 
  MapPin, 
  BarChart3, 
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/products', icon: Package, label: 'Produits' },
    { path: '/inventory', icon: Boxes, label: 'Inventaire' },
    { path: '/orders', icon: ShoppingCart, label: 'Commandes' },
    { path: '/locations', icon: MapPin, label: 'Emplacements' },
    { path: '/reports', icon: BarChart3, label: 'Rapports' },
    { path: '/settings', icon: Settings, label: 'Paramètres' }
  ];

  return (
    <aside 
      className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 flex flex-col ${
        isCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Toggle Button */}
      <div className="h-16 flex items-center justify-end px-4 border-b border-gray-200">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 mx-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && (
              <span className="ml-3 font-medium">{item.label}</span>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

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
  ChevronRight,
  Sun,
  Moon,
  Bell,
  FlaskConical
} from 'lucide-react';
import { useSidebar } from '../../contexts/SidebarContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotifications } from '../../contexts/NotificationContext';
import NotificationCenter from '../NotificationCenter';

export default function Sidebar() {
  const { isCollapsed, toggleSidebar } = useSidebar();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/products', icon: Package, label: 'Produits' },
    { path: '/inventory', icon: Boxes, label: 'Inventaire' },
    { path: '/orders', icon: ShoppingCart, label: 'Commandes' },
    { path: '/locations', icon: MapPin, label: 'Emplacements' },
    { path: '/reports', icon: BarChart3, label: 'Rapports' },
    { path: '/enterprise-test', icon: FlaskConical, label: 'Tests Enterprise' },
    { path: '/settings', icon: Settings, label: 'Paramètres' }
  ];

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 flex flex-col ${
        isCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Toggle Button */}
      <div className="h-16 flex items-center justify-end px-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
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
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
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

      {/* Notifications Button */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="w-full flex items-center justify-center px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors relative"
          title="Notifications"
        >
          <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          {!isCollapsed && (
            <span className="ml-3 font-medium text-gray-700 dark:text-gray-300">Notifications</span>
          )}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Theme Toggle */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-center px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title={theme === 'light' ? 'Passer en mode sombre' : 'Passer en mode clair'}
        >
          {theme === 'light' ? (
            <>
              <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              {!isCollapsed && (
                <span className="ml-3 font-medium text-gray-700 dark:text-gray-300">Mode sombre</span>
              )}
            </>
          ) : (
            <>
              <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              {!isCollapsed && (
                <span className="ml-3 font-medium text-gray-700 dark:text-gray-300">Mode clair</span>
              )}
            </>
          )}
        </button>
      </div>

      {/* NotificationCenter Modal */}
      <NotificationCenter
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </aside>
  );
}

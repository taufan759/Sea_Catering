import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  // Simplified menu items based on requirements
  const getMenuItems = () => {
    const baseItems = [
      { title: 'Dashboard', path: '/dashboard', icon: '📊' },
    ];

    if (user?.role === 'admin' || user?.role === 'super_admin') {
      return [
        ...baseItems,
        { title: 'Admin Dashboard', path: '/admin', icon: '👨‍💼' },
      ];
    }

    // For regular users
    return [
      ...baseItems,
      { title: 'My Subscriptions', path: '/my-subscriptions', icon: '📋' },
      { title: 'Profile', path: '/profile', icon: '👤' },
    ];
  };

  const menuItems = getMenuItems();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  // Get user initial for avatar
  const getUserInitial = () => {
    if (user?.name) {
      return user.name.charAt(0).toUpperCase();
    }
    return 'U';
  };

  // Determine user role display
  const getUserRoleDisplay = () => {
    if (user?.role === 'super_admin') {
      return 'Super Admin';
    } else if (user?.role === 'admin') {
      return 'Admin';
    }
    return 'Customer';
  };

  return (
    <div className="bg-primary text-white w-64 min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-primary-light">
        <Link to="/" className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-secondary to-yellow-400 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">🍽️</span>
          </div>
          <div>
            <span className="text-xl font-bold">SEA Catering</span>
            <p className="text-xs text-gray-300">
              {user?.role === 'admin' || user?.role === 'super_admin' ? 'Admin Panel' : 'Customer Portal'}
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-grow p-4">
        <ul className="space-y-2">
          {menuItems.map((item, index) => (
            <li key={index}>
              <Link
                to={item.path}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-secondary text-white shadow-lg'
                    : 'hover:bg-primary-light'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.title}</span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Quick Actions for Users */}
        {user?.role === 'user' && (
          <div className="mt-8 p-4 bg-white/10 rounded-lg backdrop-blur">
            <h4 className="text-sm font-semibold mb-3 text-gray-300">Quick Actions</h4>
            <div className="space-y-2">
              <Link 
                to="/" 
                className="block text-sm text-gray-300 hover:text-white transition-colors p-2 rounded hover:bg-white/10"
              >
                🍽️ Browse Meal Plans
              </Link>
              <Link 
                to="/my-subscriptions" 
                className="block text-sm text-gray-300 hover:text-white transition-colors p-2 rounded hover:bg-white/10"
              >
                📋 Manage Subscriptions
              </Link>
            </div>
          </div>
        )}

        {/* Admin Quick Stats */}
        {(user?.role === 'admin' || user?.role === 'super_admin') && (
          <div className="mt-8 p-4 bg-white/10 rounded-lg backdrop-blur">
            <h4 className="text-sm font-semibold mb-3 text-gray-300">Quick Stats</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Total Users:</span>
                <span className="text-white font-medium">1,247</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Active Subscriptions:</span>
                <span className="text-white font-medium">856</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">This Month:</span>
                <span className="text-green-400 font-medium">+15%</span>
              </div>
            </div>
            <Link 
              to="/admin"
              className="block mt-3 text-sm bg-secondary/20 hover:bg-secondary/30 text-white px-3 py-2 rounded transition-colors text-center"
            >
              View Full Dashboard
            </Link>
          </div>
        )}

        {/* Help & Support */}
        <div className="mt-8 p-4 bg-white/5 rounded-lg">
          <h4 className="text-sm font-semibold mb-3 text-gray-300">Need Help?</h4>
          <div className="space-y-2 text-sm">
            <div className="text-gray-300">
              📱 <span className="ml-2">08123456789</span>
            </div>
            <div className="text-gray-300">
              📧 <span className="ml-2">hello@seacatering.id</span>
            </div>
            <div className="text-gray-300">
              ⏰ <span className="ml-2">7AM - 10PM</span>
            </div>
          </div>
        </div>
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-primary-light">
        <div className="mb-3">
          <Link 
            to="/profile" 
            className="block hover:bg-primary-light p-3 rounded-lg transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-white font-semibold text-lg">
                  {getUserInitial()}
                </div>
                <div>
                  <p className="font-medium text-white">{user?.name || 'User'}</p>
                  <p className="text-sm text-gray-300">{getUserRoleDisplay()}</p>
                  <p className="text-xs text-gray-400">{user?.email}</p>
                </div>
              </div>
              <button className="p-1 hover:bg-primary-dark rounded">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
            </div>
          </Link>
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full text-left hover:bg-primary-light p-3 rounded-lg transition-colors flex items-center space-x-3"
        >
          <span className="text-xl">🚪</span>
          <span className="font-medium">Logout</span>
        </button>

        {/* Back to Home Link */}
        <Link
          to="/"
          className="w-full text-left hover:bg-primary-light p-3 rounded-lg transition-colors flex items-center space-x-3 mt-2"
        >
          <span className="text-xl">🏠</span>
          <span className="font-medium">Back to Home</span>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
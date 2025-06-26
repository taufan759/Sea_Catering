import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Protected User Pages
import Dashboard from './pages/Dashboard';
import UserSubscriptions from './pages/UserSubscriptions';

// Common Components
import AppLayouts from './components/AppLayouts';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes - Accessible without login */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected User Dashboard Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['user', 'admin', 'super_admin']}>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/my-subscriptions" 
            element={
              <ProtectedRoute allowedRoles={['user', 'admin', 'super_admin']}>
                <UserSubscriptions />
              </ProtectedRoute>
            } 
          />
          
          {/* Profile and Settings */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute allowedRoles={['user', 'admin', 'super_admin']}>
                <AppLayouts>
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h1 className="text-2xl font-bold mb-6">Profile</h1>
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold">
                        U
                      </div>
                      <div>
                        <p className="text-xl font-medium">User Profile</p>
                        <p className="text-gray-600">Manage your account settings</p>
                        <p className="text-sm text-gray-500 mt-2">Feature coming soon...</p>
                      </div>
                    </div>
                  </div>
                </AppLayouts>
              </ProtectedRoute>
            } 
          />
          
          {/* Admin Dashboard Route */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                <AppLayouts>
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
                    <p className="text-gray-600 mb-6">Monitor subscription metrics and business performance</p>
                    
                    {/* Date Range Selector */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold mb-3">Date Range Selector</h3>
                      <div className="flex space-x-4">
                        <input type="date" className="border rounded px-3 py-2" />
                        <span className="self-center">to</span>
                        <input type="date" className="border rounded px-3 py-2" />
                        <button className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-light">
                          Apply Filter
                        </button>
                      </div>
                    </div>
                    
                    {/* Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="border rounded-lg p-6 text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-2">0</div>
                        <h3 className="font-semibold text-gray-700">New Subscriptions</h3>
                        <p className="text-sm text-gray-600">This period</p>
                      </div>
                      <div className="border rounded-lg p-6 text-center">
                        <div className="text-3xl font-bold text-green-600 mb-2">Rp 0</div>
                        <h3 className="font-semibold text-gray-700">Monthly Recurring Revenue</h3>
                        <p className="text-sm text-gray-600">MRR from active subscriptions</p>
                      </div>
                      <div className="border rounded-lg p-6 text-center">
                        <div className="text-3xl font-bold text-purple-600 mb-2">0</div>
                        <h3 className="font-semibold text-gray-700">Reactivations</h3>
                        <p className="text-sm text-gray-600">Cancelled then restarted</p>
                      </div>
                      <div className="border rounded-lg p-6 text-center">
                        <div className="text-3xl font-bold text-orange-600 mb-2">0</div>
                        <h3 className="font-semibold text-gray-700">Subscription Growth</h3>
                        <p className="text-sm text-gray-600">Total active subscriptions</p>
                      </div>
                    </div>
                    
                    <div className="mt-8">
                      <p className="text-sm text-gray-500">* Connect to backend API to populate real data</p>
                    </div>
                  </div>
                </AppLayouts>
              </ProtectedRoute>
            } 
          />
          
          {/* Error Pages */}
          <Route 
            path="/unauthorized" 
            element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🚫</div>
                  <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
                  <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
                  <button 
                    onClick={() => window.history.back()}
                    className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-light transition-colors"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            } 
          />
          
          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
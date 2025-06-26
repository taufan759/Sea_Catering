// pages/Dashboard.jsx - SEA Catering Dashboard
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppLayouts from '../components/AppLayouts';
import AppSettings from '../AppSettings';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    totalTestimonials: 0,
    avgRating: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      await Promise.all([
        loadUserSubscriptions(),
        loadTestimonials()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserSubscriptions = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const response = await fetch(`${AppSettings.api}/my-subscriptions`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (response.ok) {
          const data = await response.json();
          setSubscriptions(data);
          setStats(prev => ({ 
            ...prev, 
            totalSubscriptions: data.length,
            activeSubscriptions: data.filter(s => s.status === 'active').length
          }));
        }
      }
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    }
  };

  const loadTestimonials = async () => {
    try {
      const response = await fetch(`${AppSettings.api}/testimonials`);
      if (response.ok) {
        const data = await response.json();
        setTestimonials(data);
        
        // Calculate average rating
        const avgRating = data.length > 0 
          ? data.reduce((sum, t) => sum + t.rating, 0) / data.length 
          : 0;
        
        setStats(prev => ({ 
          ...prev, 
          totalTestimonials: data.length,
          avgRating: avgRating.toFixed(1)
        }));
      }
    } catch (error) {
      console.error('Error loading testimonials:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const renderStars = (rating) => {
    return '⭐'.repeat(Math.floor(rating));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'paused': return 'text-yellow-600';
      case 'cancelled': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <AppLayouts>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AppLayouts>
    );
  }

  return (
    <AppLayouts>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-lg">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-semibold">Welcome back, {user?.name}! 🍽️</h2>
              <p className="text-gray-600">
                {user?.role === 'admin' || user?.role === 'super_admin' 
                  ? 'Monitor your business performance and manage subscriptions.'
                  : 'Ready for your next healthy meal? Manage your subscriptions or explore new plans.'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-700">My Subscriptions</h3>
                <div className="text-3xl font-bold text-primary">{stats.totalSubscriptions}</div>
                <p className="text-sm text-gray-500">Total subscriptions</p>
              </div>
              <div className="text-4xl">📋</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-700">Active Plans</h3>
                <div className="text-3xl font-bold text-green-600">{stats.activeSubscriptions}</div>
                <p className="text-sm text-gray-500">Currently active</p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-700">Customer Reviews</h3>
                <div className="text-3xl font-bold text-primary">{stats.totalTestimonials}</div>
                <p className="text-sm text-gray-500">Total reviews</p>
              </div>
              <div className="text-4xl">⭐</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-700">Average Rating</h3>
                <div className="text-3xl font-bold text-primary">{stats.avgRating}/5</div>
                <p className="text-sm text-gray-500">{renderStars(stats.avgRating)}</p>
              </div>
              <div className="text-4xl">🏆</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/"
              className="bg-primary hover:bg-primary-light text-white p-4 rounded-lg text-center transition-colors"
            >
              <div className="text-2xl mb-2">🥗</div>
              <div className="font-semibold">Browse Meal Plans</div>
              <div className="text-sm opacity-90">Discover healthy options</div>
            </Link>

            <Link
              to="/my-subscriptions"
              className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-lg text-center transition-colors"
            >
              <div className="text-2xl mb-2">📋</div>
              <div className="font-semibold">My Subscriptions</div>
              <div className="text-sm opacity-90">Manage your plans</div>
            </Link>

            <Link
              to="/profile"
              className="bg-yellow-500 hover:bg-yellow-600 text-white p-4 rounded-lg text-center transition-colors"
            >
              <div className="text-2xl mb-2">👤</div>
              <div className="font-semibold">My Profile</div>
              <div className="text-sm opacity-90">Update your info</div>
            </Link>
          </div>
        </div>

        {/* My Subscriptions Overview */}
        {subscriptions.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">My Subscriptions Overview</h3>
              <Link 
                to="/my-subscriptions"
                className="text-primary hover:text-primary-light font-medium"
              >
                View All →
              </Link>
            </div>
            <div className="space-y-4">
              {subscriptions.slice(0, 3).map((subscription) => (
                <div key={subscription.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{subscription.mealPlan?.icon || '🍽️'}</span>
                      <div>
                        <h4 className="font-semibold">{subscription.mealPlan?.name || 'Unknown Plan'}</h4>
                        <p className="text-sm text-gray-600">
                          {subscription.mealTypes?.join(', ')} • {subscription.deliveryDays?.length} days/week
                        </p>
                        <span className={`text-sm font-medium ${getStatusColor(subscription.status)}`}>
                          {subscription.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary">
                        {formatCurrency(subscription.totalPrice)}
                      </div>
                      <div className="text-sm text-gray-500">per month</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Subscriptions State */}
        {subscriptions.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Subscriptions Yet</h3>
            <p className="text-gray-500 mb-4">Start your healthy journey by subscribing to a meal plan!</p>
            <Link 
              to="/"
              className="bg-primary hover:bg-primary-light text-white px-6 py-3 rounded-lg font-medium transition-colors inline-block"
            >
              Browse Meal Plans
            </Link>
          </div>
        )}

        {/* Recent Reviews */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Recent Customer Reviews</h3>
          {testimonials.length > 0 ? (
            <div className="space-y-4">
              {testimonials.slice(0, 3).map((testimonial) => (
                <div key={testimonial.id} className="border-l-4 border-primary pl-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold">{testimonial.customerName}</div>
                    <div className="text-yellow-400">{renderStars(testimonial.rating)} ({testimonial.rating}/5)</div>
                  </div>
                  <p className="text-gray-600 italic">"{testimonial.reviewMessage}"</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">⭐</div>
              <h4 className="text-lg font-semibold text-gray-600 mb-2">No reviews yet</h4>
              <p className="text-gray-500">Be the first to leave a review!</p>
            </div>
          )}
          
          {testimonials.length > 3 && (
            <div className="mt-4 text-center">
              <Link
                to="/#testimonials"
                className="text-primary hover:text-primary-light font-medium"
              >
                View All Reviews →
              </Link>
            </div>
          )}
        </div>

        {/* Admin Quick Access */}
        {(user?.role === 'admin' || user?.role === 'super_admin') && (
          <div className="bg-gradient-to-r from-primary to-secondary text-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">Admin Quick Access</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/20 rounded-lg p-4">
                <div className="text-2xl font-bold">{stats.totalTestimonials}</div>
                <div className="text-sm opacity-90">Customer Reviews</div>
              </div>
              <div className="bg-white/20 rounded-lg p-4">
                <div className="text-2xl font-bold">{stats.avgRating}/5</div>
                <div className="text-sm opacity-90">Average Rating</div>
              </div>
            </div>
            <div className="mt-4">
              <Link
                to="/admin"
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Go to Admin Dashboard →
              </Link>
            </div>
          </div>
        )}
      </div>
    </AppLayouts>
  );
};

export default Dashboard;
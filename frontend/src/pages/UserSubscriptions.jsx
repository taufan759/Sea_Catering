// pages/UserSubscriptions.jsx - User Dashboard
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppLayouts from '../components/AppLayouts';
import AppSettings from '../AppSettings';

const UserSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [pauseModal, setPauseModal] = useState({ isOpen: false, subscription: null });
  const [pauseDates, setPauseDates] = useState({ startDate: '', endDate: '' });

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${AppSettings.api}/my-subscriptions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSubscriptions(data);
      } else if (response.status === 401) {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return '✅';
      case 'paused': return '⏸️';
      case 'cancelled': return '❌';
      default: return '📋';
    }
  };

  const handlePauseSubscription = async () => {
    if (!pauseDates.startDate || !pauseDates.endDate) {
      alert('Please select both start and end dates');
      return;
    }

    const startDate = new Date(pauseDates.startDate);
    const endDate = new Date(pauseDates.endDate);
    const today = new Date();
    
    if (startDate < today) {
      alert('Start date cannot be in the past');
      return;
    }
    
    if (endDate <= startDate) {
      alert('End date must be after start date');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${AppSettings.api}/subscriptions/${pauseModal.subscription.id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'paused',
          pausedStart: pauseDates.startDate,
          pausedEnd: pauseDates.endDate
        })
      });

      if (response.ok) {
        alert('Subscription paused successfully');
        setPauseModal({ isOpen: false, subscription: null });
        setPauseDates({ startDate: '', endDate: '' });
        loadSubscriptions();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || errorData.message}`);
      }
    } catch (error) {
      console.error('Error pausing subscription:', error);
      alert('Failed to pause subscription');
    }
  };

  const handleCancelSubscription = async (subscriptionId) => {
    if (!window.confirm('Are you sure you want to cancel this subscription? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${AppSettings.api}/subscriptions/${subscriptionId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'cancelled' })
      });

      if (response.ok) {
        alert('Subscription cancelled successfully');
        loadSubscriptions();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || errorData.message}`);
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert('Failed to cancel subscription');
    }
  };

  const handleResumeSubscription = async (subscriptionId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${AppSettings.api}/subscriptions/${subscriptionId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'active' })
      });

      if (response.ok) {
        alert('Subscription resumed successfully');
        loadSubscriptions();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || errorData.message}`);
      }
    } catch (error) {
      console.error('Error resuming subscription:', error);
      alert('Failed to resume subscription');
    }
  };

  const filteredSubscriptions = selectedStatus === 'all' 
    ? subscriptions 
    : subscriptions.filter(sub => sub.status === selectedStatus);

  const statusOptions = [
    { value: 'all', label: 'All Subscriptions', count: subscriptions.length },
    { value: 'active', label: 'Active', count: subscriptions.filter(s => s.status === 'active').length },
    { value: 'paused', label: 'Paused', count: subscriptions.filter(s => s.status === 'paused').length },
    { value: 'cancelled', label: 'Cancelled', count: subscriptions.filter(s => s.status === 'cancelled').length }
  ];

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
          <h1 className="text-3xl font-bold mb-4">My Subscriptions</h1>
          <p className="text-gray-600">Manage your meal subscriptions - view details, pause, or cancel anytime</p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {statusOptions.map((status) => (
              <div key={status.value} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{status.count}</div>
                <div className="text-sm text-gray-600">{status.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((status) => (
              <button
                key={status.value}
                onClick={() => setSelectedStatus(status.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                  selectedStatus === status.value
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{status.label}</span>
                <span className="bg-white/20 px-2 py-1 rounded-full text-xs">{status.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Subscriptions List */}
        {filteredSubscriptions.length > 0 ? (
          <div className="space-y-4">
            {filteredSubscriptions.map((subscription) => (
              <div key={subscription.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  {/* Subscription Header */}
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                    <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-2xl">
                        {subscription.mealPlan?.icon || '🍽️'}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold flex items-center space-x-2">
                          <span>Subscription #{subscription.id}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(subscription.status)}`}>
                            {getStatusIcon(subscription.status)} {subscription.status.toUpperCase()}
                          </span>
                        </h3>
                        <p className="text-gray-600">{subscription.mealPlan?.name || 'Unknown Plan'}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary">
                        {formatCurrency(subscription.totalPrice)}
                      </div>
                      <div className="text-sm text-gray-500">Monthly Total</div>
                    </div>
                  </div>

                  {/* Subscription Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Contact:</span>
                      <p className="font-semibold">{subscription.name}</p>
                      <p className="text-sm text-gray-600">{subscription.phoneNumber}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Meal Types:</span>
                      <p className="font-semibold">{subscription.mealTypes?.join(', ') || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Delivery Days:</span>
                      <p className="font-semibold">{subscription.deliveryDays?.join(', ') || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Created:</span>
                      <p className="font-semibold">{new Date(subscription.created_at).toLocaleDateString('id-ID')}</p>
                    </div>
                  </div>
                  
                  {/* Allergies */}
                  {subscription.allergies && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <span className="text-sm font-medium text-blue-700">Allergies & Dietary Restrictions:</span>
                      <p className="text-blue-800">{subscription.allergies}</p>
                    </div>
                  )}

                  {/* Pause Information */}
                  {subscription.status === 'paused' && (subscription.pausedStart || subscription.pausedEnd) && (
                    <div className="mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center text-yellow-700 mb-2">
                        <span className="text-xl mr-2">⏸️</span>
                        <span className="font-semibold">Subscription Paused</span>
                      </div>
                      <p className="text-sm text-yellow-600">
                        {subscription.pausedStart && subscription.pausedEnd && 
                          `From ${new Date(subscription.pausedStart).toLocaleDateString('id-ID')} to ${new Date(subscription.pausedEnd).toLocaleDateString('id-ID')}`
                        }
                      </p>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    {subscription.status === 'active' && (
                      <>
                        <button 
                          onClick={() => setPauseModal({ isOpen: true, subscription })}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                        >
                          <span>⏸️</span>
                          <span>Pause Subscription</span>
                        </button>
                        <button 
                          onClick={() => handleCancelSubscription(subscription.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                        >
                          <span>❌</span>
                          <span>Cancel Subscription</span>
                        </button>
                      </>
                    )}
                    
                    {subscription.status === 'paused' && (
                      <button 
                        onClick={() => handleResumeSubscription(subscription.id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                      >
                        <span>▶️</span>
                        <span>Resume Subscription</span>
                      </button>
                    )}

                    {subscription.status === 'cancelled' && (
                      <div className="bg-gray-100 text-gray-600 px-6 py-2 rounded-lg font-medium flex items-center space-x-2">
                        <span>❌</span>
                        <span>Subscription Cancelled</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No subscriptions found</h3>
            <p className="text-gray-500 mb-4">
              {selectedStatus === 'all' 
                ? "You haven't created any subscriptions yet" 
                : `No subscriptions with status "${selectedStatus}"`}
            </p>
            <Link 
              to="/" 
              className="bg-primary hover:bg-primary-light text-white px-6 py-2 rounded-lg font-medium transition-colors inline-block"
            >
              Browse Meal Plans
            </Link>
          </div>
        )}

        {/* Pause Subscription Modal */}
        {pauseModal.isOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-800">Pause Subscription</h3>
                <p className="text-gray-600 mt-1">Temporarily pause your subscription for a specific period</p>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pause Start Date *
                    </label>
                    <input
                      type="date"
                      value={pauseDates.startDate}
                      onChange={(e) => setPauseDates(prev => ({ ...prev, startDate: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pause End Date *
                    </label>
                    <input
                      type="date"
                      value={pauseDates.endDate}
                      onChange={(e) => setPauseDates(prev => ({ ...prev, endDate: e.target.value }))}
                      min={pauseDates.startDate || new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800">
                      <span className="font-medium">Note:</span> During the pause period, no charges will be applied and no meals will be delivered.
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-3 mt-6">
                  <button 
                    onClick={() => {
                      setPauseModal({ isOpen: false, subscription: null });
                      setPauseDates({ startDate: '', endDate: '' });
                    }}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-6 rounded-xl font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handlePauseSubscription}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-6 rounded-xl font-semibold transition-colors"
                  >
                    Pause Subscription
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayouts>
  );
};

export default UserSubscriptions;
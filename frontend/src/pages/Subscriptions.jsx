// pages/Subscriptions.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppLayouts from '../components/AppLayouts';
import AppSettings from '../AppSettings';

const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');

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
        // Token expired, redirect to login
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
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusUpdate = async (subscriptionId, newStatus) => {
    try {
      const token = localStorage.getItem('accessToken');
      const requestBody = { status: newStatus };
      
      // Add pause dates if pausing
      if (newStatus === 'paused') {
        const startDate = prompt('Enter pause start date (YYYY-MM-DD):');
        const endDate = prompt('Enter pause end date (YYYY-MM-DD):');
        if (startDate && endDate) {
          requestBody.pausedStart = startDate;
          requestBody.pausedEnd = endDate;
        } else {
          alert('Pause dates are required');
          return;
        }
      }

      const response = await fetch(`${AppSettings.api}/subscriptions/${subscriptionId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        alert(`Subscription ${newStatus} successfully`);
        loadSubscriptions(); // Reload data
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || errorData.message}`);
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
      alert('Failed to update subscription status');
    }
  };

  const filteredSubscriptions = selectedStatus === 'all' 
    ? subscriptions 
    : subscriptions.filter(sub => sub.status === selectedStatus);

  const statusOptions = [
    { value: 'all', label: 'All Subscriptions' },
    { value: 'active', label: 'Active' },
    { value: 'paused', label: 'Paused' },
    { value: 'cancelled', label: 'Cancelled' }
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">My Subscriptions</h1>
        <p className="text-gray-600">Manage your meal subscriptions</p>
      </div>

      {/* Status Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((status) => (
            <button
              key={status.value}
              onClick={() => setSelectedStatus(status.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedStatus === status.value
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      {/* Subscriptions List */}
      {filteredSubscriptions.length > 0 ? (
        <div className="space-y-4">
          {filteredSubscriptions.map((subscription) => (
            <div key={subscription.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-lg font-semibold">Subscription #{subscription.id}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}>
                      {subscription.status.toUpperCase()}
                    </span>
                    {subscription.mealPlan && (
                      <span className="text-2xl">{subscription.mealPlan.icon}</span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Plan:</span> {subscription.mealPlan?.name || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Contact:</span> {subscription.name}
                    </div>
                    <div>
                      <span className="font-medium">Phone:</span> {subscription.phoneNumber}
                    </div>
                    <div>
                      <span className="font-medium">Meal Types:</span> {subscription.mealTypes?.join(', ') || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Delivery Days:</span> {subscription.deliveryDays?.join(', ') || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Created:</span> {' '}
                      {new Date(subscription.created_at).toLocaleDateString('id-ID')}
                    </div>
                  </div>
                  
                  {subscription.allergies && (
                    <div className="mt-3 text-sm text-gray-600">
                      <span className="font-medium">Allergies:</span> {subscription.allergies}
                    </div>
                  )}

                  {subscription.status === 'paused' && (subscription.pausedStart || subscription.pausedEnd) && (
                    <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center text-yellow-700">
                        <span className="text-lg mr-2">⏸️</span>
                        <span className="font-medium">Subscription Paused</span>
                      </div>
                      <p className="text-sm text-yellow-600 mt-1">
                        {subscription.pausedStart && subscription.pausedEnd && 
                          `From ${new Date(subscription.pausedStart).toLocaleDateString('id-ID')} to ${new Date(subscription.pausedEnd).toLocaleDateString('id-ID')}`
                        }
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 lg:mt-0 lg:ml-6 text-right">
                  <div className="text-2xl font-bold text-primary mb-2">
                    {formatCurrency(subscription.totalPrice)}
                  </div>
                  <div className="text-sm text-gray-500 mb-3">
                    Monthly Total
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col space-y-2">
                    {subscription.status === 'active' && (
                      <>
                        <button 
                          onClick={() => handleStatusUpdate(subscription.id, 'paused')}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          Pause
                        </button>
                        <button 
                          onClick={() => {
                            if (window.confirm('Are you sure you want to cancel this subscription?')) {
                              handleStatusUpdate(subscription.id, 'cancelled');
                            }
                          }}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    
                    {subscription.status === 'paused' && (
                      <button 
                        onClick={() => handleStatusUpdate(subscription.id, 'active')}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Resume
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No subscriptions found</h3>
          <p className="text-gray-500 mb-4">
            {selectedStatus === 'all' 
              ? "You haven't created any subscriptions yet" 
              : `No subscriptions with status "${selectedStatus}"`}
          </p>
          <Link 
            to="/meal-plans" 
            className="bg-primary hover:bg-primary-light text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Browse Meal Plans
          </Link>
        </div>
      )}
    </AppLayouts>
  );
};

export default Subscriptions;
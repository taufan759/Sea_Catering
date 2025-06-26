// pages/CreateSubscription.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayouts from '../components/AppLayouts';
import AppSettings from '../AppSettings';

const CreateSubscription = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    mealTypes: [],
    deliveryDays: [],
    allergies: ''
  });

  const [errors, setErrors] = useState({});

  const mealTypeOptions = ['Breakfast', 'Lunch', 'Dinner'];
  const deliveryDayOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    if (planId) {
      loadMealPlan();
    }
  }, [planId]);

  const loadMealPlan = async () => {
    try {
      const response = await fetch(`${AppSettings.api}/meal-plans/${planId}`);
      if (response.ok) {
        const data = await response.json();
        setMealPlan(data);
      } else {
        alert('Meal plan not found');
        navigate('/meal-plans');
      }
    } catch (error) {
      console.error('Error loading meal plan:', error);
      alert('Error loading meal plan');
      navigate('/meal-plans');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCheckboxChange = (type, value) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter(item => item !== value)
        : [...prev[type], value]
    }));
    
    // Clear error when user makes selection
    if (errors[type]) {
      setErrors(prev => ({
        ...prev,
        [type]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^(\+62|62|0)8[1-9][0-9]{6,9}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid Indonesian phone number';
    }

    if (formData.mealTypes.length === 0) {
      newErrors.mealTypes = 'Please select at least one meal type';
    }

    if (formData.deliveryDays.length === 0) {
      newErrors.deliveryDays = 'Please select at least one delivery day';
    }

    if (formData.allergies && formData.allergies.length > 500) {
      newErrors.allergies = 'Allergies description must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateTotalPrice = () => {
    if (!mealPlan || formData.mealTypes.length === 0 || formData.deliveryDays.length === 0) {
      return 0;
    }
    
    // Price calculation: Plan Price × Meal Types × Delivery Days × 4.3 (weeks in month)
    return mealPlan.price * formData.mealTypes.length * formData.deliveryDays.length * 4.3;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('Please login to create a subscription');
        navigate('/login');
        return;
      }

      const response = await fetch(`${AppSettings.api}/subscriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          planId: parseInt(planId)
        })
      });

      const result = await response.json();

      if (response.ok) {
        alert('Subscription created successfully!');
        navigate('/my-subscriptions');
      } else {
        if (response.status === 401) {
          alert('Session expired. Please login again.');
          localStorage.removeItem('accessToken');
          navigate('/login');
        } else {
          alert(result.error || result.message || 'Failed to create subscription');
        }
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      alert('Network error. Please try again.');
    } finally {
      setSubmitting(false);
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

  if (!mealPlan) {
    return (
      <AppLayouts>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">Meal Plan Not Found</h2>
          <button 
            onClick={() => navigate('/meal-plans')}
            className="bg-primary text-white px-6 py-2 rounded-lg"
          >
            Back to Meal Plans
          </button>
        </div>
      </AppLayouts>
    );
  }

  return (
    <AppLayouts>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <button 
            onClick={() => navigate('/meal-plans')}
            className="text-primary hover:text-primary-light mb-4 flex items-center"
          >
            ← Back to Meal Plans
          </button>
          <h1 className="text-3xl font-bold mb-4">Create Subscription</h1>
          <p className="text-gray-600">Subscribe to your chosen meal plan</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Meal Plan Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center mb-6">
              <span className="text-6xl">{mealPlan.icon}</span>
              <h3 className="text-2xl font-bold mt-4">{mealPlan.name}</h3>
              <p className="text-gray-600 mt-2">{mealPlan.description}</p>
              <div className="text-3xl font-bold text-primary mt-4">
                {formatCurrency(mealPlan.price)}<span className="text-sm text-gray-500">/meal</span>
              </div>
            </div>

            {/* Features */}
            {mealPlan.features && (
              <div>
                <h4 className="font-semibold mb-3">Plan Features:</h4>
                <div className="space-y-2">
                  {mealPlan.features.split('|').map((feature, index) => (
                    <div key={index} className="flex items-start text-sm text-gray-600">
                      <span className="w-2 h-2 bg-primary rounded-full mr-3 mt-2 flex-shrink-0"></span>
                      {feature.trim()}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Subscription Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Info */}
              <div>
                <h4 className="font-semibold mb-4">Personal Information</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your full name"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                        errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g., 08123456789"
                    />
                    {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
                  </div>
                </div>
              </div>

              {/* Meal Types */}
              <div>
                <h4 className="font-semibold mb-2">Meal Types *</h4>
                <p className="text-sm text-gray-600 mb-3">Select which meals you want to receive</p>
                <div className="space-y-2">
                  {mealTypeOptions.map(meal => (
                    <label key={meal} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.mealTypes.includes(meal)}
                        onChange={() => handleCheckboxChange('mealTypes', meal)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="ml-2">{meal}</span>
                    </label>
                  ))}
                </div>
                {errors.mealTypes && <p className="text-red-500 text-sm mt-1">{errors.mealTypes}</p>}
              </div>

              {/* Delivery Days */}
              <div>
                <h4 className="font-semibold mb-2">Delivery Days *</h4>
                <p className="text-sm text-gray-600 mb-3">Select which days you want delivery</p>
                <div className="grid grid-cols-2 gap-2">
                  {deliveryDayOptions.map(day => (
                    <label key={day} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.deliveryDays.includes(day)}
                        onChange={() => handleCheckboxChange('deliveryDays', day)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="ml-2 text-sm">{day}</span>
                    </label>
                  ))}
                </div>
                {errors.deliveryDays && <p className="text-red-500 text-sm mt-1">{errors.deliveryDays}</p>}
              </div>

              {/* Allergies */}
              <div>
                <label className="block text-sm font-medium mb-2">Allergies & Dietary Restrictions</label>
                <textarea
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleInputChange}
                  rows="3"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.allergies ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Please specify any allergies or dietary restrictions..."
                />
                {errors.allergies && <p className="text-red-500 text-sm mt-1">{errors.allergies}</p>}
              </div>

              {/* Price Summary */}
              {(formData.mealTypes.length > 0 && formData.deliveryDays.length > 0) && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Monthly Cost Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Base price per meal:</span>
                      <span>{formatCurrency(mealPlan.price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Meal types selected:</span>
                      <span>{formData.mealTypes.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery days per week:</span>
                      <span>{formData.deliveryDays.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Weeks per month:</span>
                      <span>~4.3</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total Monthly Cost:</span>
                      <span className="text-primary">{formatCurrency(calculateTotalPrice())}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary hover:bg-primary-light text-white py-3 px-6 rounded-lg font-medium transition-colors disabled:bg-gray-400"
              >
                {submitting ? 'Creating Subscription...' : 'Create Subscription'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </AppLayouts>
  );
};

export default CreateSubscription;
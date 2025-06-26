// pages/MealPlans.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppLayouts from '../components/AppLayouts';
import AppSettings from '../AppSettings';

const MealPlans = () => {
  const [mealPlans, setMealPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    loadMealPlans();
  }, []);

  const loadMealPlans = async () => {
    try {
      const response = await fetch(`${AppSettings.api}/meal-plans`);
      if (response.ok) {
        const data = await response.json();
        setMealPlans(data);
      }
    } catch (error) {
      console.error('Error loading meal plans:', error);
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

  // Extract categories from meal plan names (since backend doesn't have category field)
  const getCategory = (name) => {
    const lowercaseName = name.toLowerCase();
    if (lowercaseName.includes('diet')) return 'diet';
    if (lowercaseName.includes('protein')) return 'protein';
    if (lowercaseName.includes('royal')) return 'royal';
    return 'other';
  };

  const filteredPlans = selectedCategory === 'all' 
    ? mealPlans 
    : mealPlans.filter(plan => getCategory(plan.name) === selectedCategory);

  const categories = [
    { value: 'all', label: 'All Plans' },
    { value: 'diet', label: 'Diet Plans' },
    { value: 'protein', label: 'Protein Plans' },
    { value: 'royal', label: 'Royal Plans' }
  ];

  const handleOrderNow = (planId) => {
    // Redirect to subscription creation page
    navigate(`/create-subscription/${planId}`);
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Meal Plans</h1>
        <p className="text-gray-600">Choose the perfect meal plan for your healthy lifestyle</p>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === category.value
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Meal Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
            <div className="relative">
              <div className="w-full h-48 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                <span className="text-6xl">{plan.icon}</span>
              </div>
              <div className="absolute top-2 right-2">
                <span className="bg-primary text-white px-2 py-1 rounded-full text-sm capitalize">
                  {getCategory(plan.name)}
                </span>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">{plan.icon}</span>
                <h3 className="text-xl font-bold">{plan.name}</h3>
              </div>
              
              <p className="text-gray-600 mb-4">{plan.description}</p>
              
              {/* Features */}
              {plan.features && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Features:</h4>
                  <div className="space-y-1">
                    {plan.features.split('|').slice(0, 3).map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                        {feature.trim()}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-primary">
                    {formatCurrency(plan.price)}
                  </span>
                  <span className="text-sm text-gray-500">/meal</span>
                </div>
                <button 
                  onClick={() => handleOrderNow(plan.id)}
                  className="bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Subscribe Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPlans.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🍽️</div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No meal plans found</h3>
          <p className="text-gray-500">Try selecting a different category</p>
        </div>
      )}
    </AppLayouts>
  );
};

export default MealPlans;
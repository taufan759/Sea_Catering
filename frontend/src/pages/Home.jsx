import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Import Header dan Footer components
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import AppSettings from '../AppSettings';

// Security utilities for Level 4 compliance
const initializeSecurity = async () => {
  if (process.env.NODE_ENV === 'development') {
    try {
      const { securityTests } = await import('../utils/csrfUtils');
      // Run security tests in development
      setTimeout(() => {
        securityTests.runAllTests(AppSettings.api);
      }, 2000);
    } catch (error) {
      console.log('Security utils not yet available');
    }
  }
};

const SEACateringHome = () => {
  const navigate = useNavigate();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleSection, setVisibleSection] = useState('hero');
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeNav, setActiveNav] = useState('home');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isTestimonialFormOpen, setIsTestimonialFormOpen] = useState(false);
  const [isSubscriptionFormOpen, setIsSubscriptionFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [testimonialForm, setTestimonialForm] = useState({
    customerName: '',
    reviewMessage: '',
    rating: 5
  });

  // Subscription form state
  const [subscriptionForm, setSubscriptionForm] = useState({
    name: '',
    phoneNumber: '',
    mealTypes: [],
    deliveryDays: [],
    allergies: '',
    selectedPlan: null
  });
  const [formErrors, setFormErrors] = useState({});

  const mealPlans = [
    {
      id: 1,
      name: 'Diet Plan',
      price: 30000,
      originalPrice: 35000,
      description: 'Perfect for weight management and healthy living. Low-calorie, nutrient-dense meals designed to help you achieve your fitness goals.',
      features: [
        'Calorie-controlled portions (1200-1500 calories)',
        'High fiber content for better digestion',
        'Fresh vegetables and lean proteins',
        'Nutritionist-approved recipes',
        'Weekly meal variety',
        '24/7 nutritionist consultation'
      ],
      icon: '🥗',
      popular: false,
      calories: '1200-1500',
      mealsPerDay: '3 meals',
      deliveryTime: '7-10 AM',
      detailedInfo: 'This comprehensive weight management plan includes carefully portioned meals with balanced macronutrients. Each meal is crafted to keep you satisfied while supporting your weight loss goals. Our team of nutritionists ensures every dish meets the highest standards for health and taste.'
    },
    {
      id: 2,
      name: 'Protein Plan',
      price: 40000,
      originalPrice: 45000,
      description: 'High-protein meals for active individuals and fitness enthusiasts. Build muscle, recover faster, and fuel your workouts.',
      features: [
        'High protein content (25-35g per meal)',
        'Supports muscle building and recovery',
        'Premium quality lean meats and fish',
        'Pre and post-workout meal timing',
        'Supplement integration guidance',
        'Fitness tracker compatibility'
      ],
      icon: '💪',
      popular: true,
      calories: '1800-2200',
      mealsPerDay: '4 meals',
      deliveryTime: '6-9 AM',
      detailedInfo: 'Designed specifically for athletes and fitness enthusiasts, this plan provides optimal protein distribution throughout the day. Each meal is timed to support your workout schedule and recovery needs. Premium ingredients ensure maximum bioavailability of nutrients.'
    },
    {
      id: 3,
      name: 'Royal Plan',
      price: 60000,
      originalPrice: 70000,
      description: 'Our premium offering with gourmet ingredients and chef-crafted recipes. Experience luxury dining with finest ingredients.',
      features: [
        'Gourmet ingredients and chef-crafted recipes',
        'Premium cuts of meat and fresh seafood',
        'Organic vegetables and superfoods',
        'Exclusive seasonal menu items',
        'Personal chef consultation',
        'Premium packaging and presentation'
      ],
      icon: '👑',
      popular: false,
      calories: '2000-2500',
      mealsPerDay: '5 meals',
      deliveryTime: '8-11 AM',
      detailedInfo: 'Experience fine dining at home with our Royal Plan. Each meal is a culinary masterpiece created by our executive chefs using only the finest ingredients. This plan includes exclusive dishes not available in other plans, with emphasis on both nutrition and gastronomic excellence.'
    }
  ];

  const [testimonials, setTestimonials] = useState([
    {
      id: 1,
      customerName: 'Sarah Martinez',
      role: 'Marketing Executive',
      rating: 5,
      reviewMessage: 'SEA Catering has completely transformed my daily routine! The meals are delicious, healthy, and always delivered on time. I\'ve lost 8kg in 3 months!',
      avatar: '👩‍💼',
      location: 'Jakarta',
      planUsed: 'Diet Plan',
      duration: '6 months'
    },
    {
      id: 2,
      customerName: 'David Lim',
      role: 'Software Developer',
      rating: 5,
      reviewMessage: 'As a busy professional, SEA Catering has been a lifesaver. No more worrying about what to eat or spending hours cooking. The protein plan is perfect for my gym routine.',
      avatar: '👨‍💻',
      location: 'Surabaya',
      planUsed: 'Protein Plan',
      duration: '4 months'
    },
    {
      id: 3,
      customerName: 'Maria Kusuma',
      role: 'Creative Director',
      rating: 5,
      reviewMessage: 'The Royal Plan is absolutely divine! Every meal feels like dining at a 5-star restaurant. The presentation and taste are unmatched.',
      avatar: '👩‍🎨',
      location: 'Bandung',
      planUsed: 'Royal Plan',
      duration: '8 months'
    },
    {
      id: 4,
      customerName: 'Ahmad Rizki',
      role: 'Fitness Trainer',
      rating: 5,
      reviewMessage: 'Perfect macros, perfect timing, perfect taste. My clients often ask about my meal plan. SEA Catering is the real deal!',
      avatar: '🏋️‍♂️',
      location: 'Medan',
      planUsed: 'Protein Plan',
      duration: '1 year'
    }
  ]);

  const features = [
    {
      icon: '🍽️',
      title: 'Meal Customization',
      description: 'Tailor your meals to your preferences and dietary needs with our smart recommendation system.',
      color: 'from-blue-400 to-blue-600'
    },
    {
      icon: '🚚',
      title: 'Delivery to Major Cities',
      description: 'We deliver fresh meals across Indonesia\'s major cities with real-time tracking and temperature control.',
      color: 'from-green-400 to-green-600'
    },
    {
      icon: '📊',
      title: 'Detailed Nutritional Information',
      description: 'Get complete macro and micronutrient breakdowns for every meal to track your health journey.',
      color: 'from-purple-400 to-purple-600'
    },
    {
      icon: '⚡',
      title: 'Flexible Scheduling',
      description: 'Pause, resume, or modify your plan anytime with our user-friendly management system.',
      color: 'from-yellow-400 to-yellow-600'
    },
    {
      icon: '🌱',
      title: 'Fresh & Sustainable',
      description: 'Locally sourced, organic ingredients with eco-friendly packaging that cares for our planet.',
      color: 'from-teal-400 to-teal-600'
    },
    {
      icon: '💰',
      title: 'Transparent Pricing',
      description: 'Clear pricing with no hidden fees, plus family discounts and loyalty rewards.',
      color: 'from-red-400 to-red-600'
    }
  ];

  const stats = [
    { number: '50K+', label: 'Happy Customers', icon: '😊' },
    { number: '1M+', label: 'Meals Delivered', icon: '🍽️' },
    { number: '25+', label: 'Cities Covered', icon: '🏙️' },
    { number: '99.8%', label: 'On-Time Delivery', icon: '⏰' }
  ];

  const mealTypeOptions = ['Breakfast', 'Lunch', 'Dinner'];
  const deliveryDayOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setScrollY(scrollPosition);
      
      const sections = ['hero', 'stats', 'features', 'meal-plans', 'testimonials'];
      sections.forEach(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setVisibleSection(section);
            if (section === 'hero') setActiveNav('home');
            else if (section === 'meal-plans') setActiveNav('plans');
            else setActiveNav(section);
          }
        }
      });
    };

    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    // Initialize security testing (Level 4 compliance)
    initializeSecurity();
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => 
        prev === testimonials.length - 1 ? 0 : prev + 1
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>
        ⭐
      </span>
    ));
  };

  const handleTestimonialSubmit = async (e) => {
    e.preventDefault();
    
    // Enhanced validation for Level 4 compliance
    if (!testimonialForm.customerName.trim()) {
      alert('Please enter your name');
      return;
    }
    
    if (testimonialForm.customerName.trim().length < 2 || testimonialForm.customerName.trim().length > 100) {
      alert('Name must be between 2 and 100 characters');
      return;
    }
    
    if (!testimonialForm.reviewMessage.trim()) {
      alert('Please enter your review');
      return;
    }
    
    if (testimonialForm.reviewMessage.trim().length < 10 || testimonialForm.reviewMessage.trim().length > 1000) {
      alert('Review must be between 10 and 1000 characters');
      return;
    }
    
    // XSS prevention check
    if (/<[^>]*>/.test(testimonialForm.customerName) || /<[^>]*>/.test(testimonialForm.reviewMessage)) {
      alert('Invalid characters detected in your input');
      return;
    }

    try {
      // Import CSRF utilities
      const { fetchWithCSRF, sanitizeInput } = await import('../utils/csrfUtils');

      // Sanitize inputs
      const sanitizedTestimonial = {
        customerName: sanitizeInput(testimonialForm.customerName),
        reviewMessage: sanitizeInput(testimonialForm.reviewMessage),
        rating: testimonialForm.rating
      };

      // Submit with CSRF protection
      const response = await fetchWithCSRF(`${AppSettings.api}/testimonials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sanitizedTestimonial)
      });

      if (response.ok) {
        const newTestimonial = {
          id: testimonials.length + 1,
          customerName: sanitizedTestimonial.customerName,
          role: 'Customer',
          rating: sanitizedTestimonial.rating,
          reviewMessage: sanitizedTestimonial.reviewMessage,
          avatar: '👤',
          location: 'Indonesia',
          planUsed: 'Custom Plan',
          duration: 'New Customer'
        };
        
        setTestimonials([...testimonials, newTestimonial]);
        setTestimonialForm({ customerName: '', reviewMessage: '', rating: 5 });
        setIsTestimonialFormOpen(false);
        
        alert('Thank you for your testimonial!');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'Failed to submit testimonial'}`);
      }
    } catch (error) {
      console.error('Error submitting testimonial:', error);
      if (error.message.includes('CSRF')) {
        alert('Security validation failed. Please refresh the page and try again.');
      } else {
        alert('Failed to submit testimonial. Please try again.');
      }
    }
  };

  // Check if user is logged in
  const isLoggedIn = () => {
    return !!localStorage.getItem('accessToken');
  };

  // Handle subscription form
  const handleSubscriptionInputChange = (e) => {
    const { name, value } = e.target;
    setSubscriptionForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCheckboxChange = (type, value) => {
    setSubscriptionForm(prev => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter(item => item !== value)
        : [...prev[type], value]
    }));
    
    if (formErrors[type]) {
      setFormErrors(prev => ({
        ...prev,
        [type]: ''
      }));
    }
  };

  const validateSubscriptionForm = () => {
    const errors = {};

    // Enhanced validation for Level 4 compliance
    if (!subscriptionForm.name.trim()) {
      errors.name = 'Name is required';
    } else if (subscriptionForm.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    } else if (subscriptionForm.name.trim().length > 100) {
      errors.name = 'Name must be less than 100 characters';
    } else if (/<[^>]*>/.test(subscriptionForm.name)) {
      errors.name = 'Name contains invalid characters';
    }

    // Enhanced phone validation
    if (!subscriptionForm.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required';
    } else if (!/^(\+62|62|0)8[1-9][0-9]{6,9}$/.test(subscriptionForm.phoneNumber)) {
      errors.phoneNumber = 'Please enter a valid Indonesian phone number (e.g., 08123456789)';
    }

    // Meal types validation
    if (subscriptionForm.mealTypes.length === 0) {
      errors.mealTypes = 'Please select at least one meal type';
    } else if (subscriptionForm.mealTypes.length > 3) {
      errors.mealTypes = 'Maximum 3 meal types allowed';
    }

    // Delivery days validation
    if (subscriptionForm.deliveryDays.length === 0) {
      errors.deliveryDays = 'Please select at least one delivery day';
    } else if (subscriptionForm.deliveryDays.length > 7) {
      errors.deliveryDays = 'Maximum 7 delivery days allowed';
    }

    // Allergies validation (XSS prevention)
    if (subscriptionForm.allergies && subscriptionForm.allergies.length > 500) {
      errors.allergies = 'Allergies description must be less than 500 characters';
    } else if (subscriptionForm.allergies && /<[^>]*>/.test(subscriptionForm.allergies)) {
      errors.allergies = 'Allergies description contains invalid characters';
    }

    // Plan validation
    if (!subscriptionForm.selectedPlan) {
      errors.selectedPlan = 'Please select a meal plan';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const calculateTotalPrice = () => {
    if (!subscriptionForm.selectedPlan || subscriptionForm.mealTypes.length === 0 || subscriptionForm.deliveryDays.length === 0) {
      return 0;
    }
    
    return subscriptionForm.selectedPlan.price * subscriptionForm.mealTypes.length * subscriptionForm.deliveryDays.length * 4.3;
  };

  const handleSubscriptionSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateSubscriptionForm()) {
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

      // Import CSRF utilities
      const { fetchWithCSRF, sanitizeInput } = await import('../utils/csrfUtils');

      // Sanitize form data to prevent XSS (Level 4 requirement)
      const sanitizedForm = {
        name: sanitizeInput(subscriptionForm.name),
        phoneNumber: subscriptionForm.phoneNumber,
        mealTypes: subscriptionForm.mealTypes,
        deliveryDays: subscriptionForm.deliveryDays,
        allergies: sanitizeInput(subscriptionForm.allergies),
        planId: subscriptionForm.selectedPlan.id
      };

      // Use CSRF-protected fetch (Level 4 requirement)
      const response = await fetchWithCSRF(`${AppSettings.api}/subscriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sanitizedForm)
      });

      const result = await response.json();

      if (response.ok) {
        alert('Subscription created successfully!');
        setIsSubscriptionFormOpen(false);
        
        // Clear form for security
        setSubscriptionForm({
          name: '',
          phoneNumber: '',
          mealTypes: [],
          deliveryDays: [],
          allergies: '',
          selectedPlan: null
        });
        
        // Redirect to dashboard if logged in
        if (isLoggedIn()) {
          navigate('/dashboard');
        }
      } else {
        if (response.status === 401) {
          alert('Session expired. Please login again.');
          localStorage.removeItem('accessToken');
          navigate('/login');
        } else if (response.status === 403) {
          alert('Security validation failed. Please refresh the page and try again.');
        } else {
          alert(result.error || result.message || 'Failed to create subscription');
        }
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      if (error.message.includes('CSRF')) {
        alert('Security validation failed. Please refresh the page and try again.');
      } else {
        alert('Network error. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubscribeClick = (plan) => {
    if (!isLoggedIn()) {
      if (window.confirm('You need to login first to subscribe. Do you want to login now?')) {
        navigate('/login');
      }
      return;
    }

    setSubscriptionForm(prev => ({
      ...prev,
      selectedPlan: plan
    }));
    setIsSubscriptionFormOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-green-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/30 rounded-full animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        <div className="text-center text-white z-10">
          <div className="text-8xl mb-6 animate-pulse">🍽️</div>
          <h2 className="text-4xl font-bold mb-4">SEA Catering</h2>
          <p className="text-xl opacity-90 mb-8">Healthy Meals, Anytime, Anywhere</p>
          
          <div className="w-64 h-2 bg-white/20 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gradient-to-r from-white to-yellow-300 rounded-full animate-pulse"></div>
          </div>
          
          <div className="mt-6 flex justify-center space-x-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 bg-white rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <section id="hero" className="relative min-h-screen flex items-center overflow-hidden pt-20">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-green-600"></div>
        
        <div className="absolute inset-0">
          <div 
            className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl"
            style={{
              transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
              left: '10%',
              top: '20%'
            }}
          />
          <div 
            className="absolute w-64 h-64 bg-yellow-300/20 rounded-full blur-3xl"
            style={{
              transform: `translate(${mousePosition.x * -0.03}px, ${mousePosition.y * -0.03}px)`,
              right: '15%',
              top: '40%'
            }}
          />
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              
              <div className="text-white">
                <div className="inline-block bg-white/20 backdrop-blur px-4 py-2 rounded-full text-sm font-medium mb-6">
                  🎉 Indonesia's #1 Healthy Meal Service
                </div>
                
                <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                  SEA <span className="text-yellow-300 relative">
                    Catering
                    <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-yellow-300 to-orange-300 rounded-full"></div>
                  </span>
                </h1>
                
                <p className="text-2xl md:text-3xl mb-4 font-medium">
                  Healthy Meals, <span className="text-yellow-300">Anytime</span>, Anywhere
                </p>
                
                <p className="text-lg md:text-xl mb-8 opacity-90 leading-relaxed max-w-2xl">
                  We are a customizable healthy meal service with delivery all across Indonesia. 
                  Transform your health journey with fresh, nutritious, and delicious meals 
                  crafted by professional chefs and approved by nutritionists.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <button
                    onClick={() => scrollToSection('meal-plans')}
                    className="group bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-8 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-2xl flex items-center justify-center"
                  >
                    <span>Explore Meal Plans</span>
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => scrollToSection('features')}
                    className="bg-white/20 backdrop-blur hover:bg-white/30 text-white px-8 py-4 rounded-full font-bold text-lg transition-all border border-white/50 hover:border-white flex items-center justify-center"
                  >
                    <span>Learn More</span>
                  </button>
                </div>

                <div className="flex items-center space-x-8 text-sm opacity-80">
                  <div className="flex items-center">
                    <div className="flex -space-x-2 mr-3">
                      {['👤', '👤', '👤'].map((avatar, i) => (
                        <div key={i} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-xs border-2 border-white/30">
                          {avatar}
                        </div>
                      ))}
                    </div>
                    <span>50,000+ happy customers</span>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="flex mr-2">
                      {renderStars(5).slice(0, 5)}
                    </div>
                    <span>4.9/5 rating</span>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="relative z-10 bg-white/10 backdrop-blur rounded-3xl p-8 border border-white/20">
                  <div className="text-center">
                    <div className="text-8xl mb-6 animate-bounce">🍽️</div>
                    <h3 className="text-2xl font-bold text-white mb-4">Start Your Journey Today</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-white/10 rounded-lg p-3">
                        <div className="font-bold text-yellow-300">Free</div>
                        <div className="text-white/80">Consultation</div>
                      </div>
                      <div className="bg-white/10 rounded-lg p-3">
                        <div className="font-bold text-yellow-300">24/7</div>
                        <div className="text-white/80">Support</div>
                      </div>
                      <div className="bg-white/10 rounded-lg p-3">
                        <div className="font-bold text-yellow-300">7 Days</div>
                        <div className="text-white/80">Trial</div>
                      </div>
                      <div className="bg-white/10 rounded-lg p-3">
                        <div className="font-bold text-yellow-300">Money</div>
                        <div className="text-white/80">Back Guarantee</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-yellow-300/30 rounded-full animate-pulse"></div>
                <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-green-300/30 rounded-full animate-pulse delay-1000"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
          <button
            onClick={() => scrollToSection('stats')}
            className="group text-white/70 hover:text-white transition-colors animate-bounce"
          >
            <div className="flex flex-col items-center">
              <span className="text-xs mb-2 opacity-80">Scroll to explore</span>
              <svg className="w-6 h-6 group-hover:translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </button>
        </div>
      </section>

      <section id="stats" className="py-20 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Trusted by Thousands</h2>
            <p className="text-xl text-gray-300">Our numbers speak for themselves</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center transform hover:scale-105 transition-transform duration-300"
              >
                <div className="text-6xl mb-4">{stat.icon}</div>
                <div className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <div className="text-gray-300 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Key Features & Services</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the future of healthy eating with our innovative features
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-gray-100 hover:border-transparent relative overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                
                <div className="relative z-10">
                  <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="meal-plans" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Choose Your Perfect Plan</h2>
            <p className="text-xl text-gray-600">Tailored nutrition for every lifestyle and goal</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {mealPlans.map((plan, index) => (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 overflow-hidden border-2 ${
                  plan.popular ? 'border-yellow-400 scale-105' : 'border-gray-100'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-yellow-400 to-orange-400 text-center py-2 text-sm font-bold text-gray-900">
                    🔥 MOST POPULAR
                  </div>
                )}

                <div className={`bg-gradient-to-br from-blue-600 to-purple-600 text-white p-8 text-center ${plan.popular ? 'pt-12' : ''}`}>
                  <div className="text-7xl mb-4">
                    {plan.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  
                  <div className="mb-4">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <span className="text-sm line-through opacity-60">{formatPrice(plan.originalPrice)}</span>
                      <span className="text-4xl font-bold">{formatPrice(plan.price)}</span>
                    </div>
                    <p className="text-sm opacity-90">per meal</p>
                    <div className="inline-block bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold mt-2">
                      Save {Math.round(((plan.originalPrice - plan.price) / plan.originalPrice) * 100)}%
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-white/10 rounded-lg p-2">
                      <div className="font-semibold">{plan.calories}</div>
                      <div className="opacity-80">calories</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-2">
                      <div className="font-semibold">{plan.mealsPerDay}</div>
                      <div className="opacity-80">daily</div>
                    </div>
                  </div>
                </div>
                
                <div className="p-8">
                  <p className="text-gray-600 mb-6 leading-relaxed">{plan.description}</p>
                  
                  <div className="mb-8">
                    <h4 className="font-semibold mb-4 text-blue-600">What's Included:</h4>
                    <ul className="space-y-3">
                      {plan.features.slice(0, 3).map((feature, idx) => (
                        <li key={idx} className="flex items-start text-sm text-gray-600">
                          <span className="text-green-500 mr-3 mt-1 flex-shrink-0">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    <button 
                      onClick={() => setSelectedPlan(plan)}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-6 rounded-xl font-semibold transition-all duration-300"
                    >
                      See More Details
                    </button>
                    <button
                      onClick={() => handleSubscribeClick(plan)}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      Subscribe to {plan.name}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Plan Details Modal */}
          {selectedPlan && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-gray-800">{selectedPlan.name} Details</h3>
                  <button 
                    onClick={() => setSelectedPlan(null)}
                    className="text-gray-500 hover:text-gray-700 p-2"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="p-6">
                  <div className="text-center mb-6">
                    <div className="text-6xl mb-4">{selectedPlan.icon}</div>
                    <div className="flex items-center justify-center space-x-2 mb-4">
                      <span className="text-lg line-through text-gray-400">{formatPrice(selectedPlan.originalPrice)}</span>
                      <span className="text-3xl font-bold text-blue-600">{formatPrice(selectedPlan.price)}</span>
                      <span className="text-gray-600">per meal</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="font-bold text-blue-600">{selectedPlan.calories}</div>
                      <div className="text-sm text-gray-600">Calories</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="font-bold text-blue-600">{selectedPlan.mealsPerDay}</div>
                      <div className="text-sm text-gray-600">Per Day</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="font-bold text-blue-600">{selectedPlan.deliveryTime}</div>
                      <div className="text-sm text-gray-600">Delivery</div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="font-semibold mb-3 text-gray-800">About This Plan</h4>
                    <p className="text-gray-600 leading-relaxed">{selectedPlan.detailedInfo}</p>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="font-semibold mb-3 text-gray-800">Complete Features</h4>
                    <ul className="space-y-2">
                      {selectedPlan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start text-sm text-gray-600">
                          <span className="text-green-500 mr-3 mt-1 flex-shrink-0">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => setSelectedPlan(null)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-6 rounded-xl font-semibold transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPlan(null);
                        handleSubscribeClick(selectedPlan);
                      }}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-6 rounded-xl font-semibold transition-all"
                    >
                      Subscribe Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Subscription Form Modal */}
          {isSubscriptionFormOpen && subscriptionForm.selectedPlan && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-gray-800">Subscribe to {subscriptionForm.selectedPlan.name}</h3>
                  <button 
                    onClick={() => setIsSubscriptionFormOpen(false)}
                    className="text-gray-500 hover:text-gray-700 p-2"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="p-6">
                  <form onSubmit={handleSubscriptionSubmit} className="space-y-6">
                    {/* Personal Info */}
                    <div>
                      <h4 className="font-semibold mb-4">Personal Information</h4>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Full Name *</label>
                          <input
                            type="text"
                            name="name"
                            value={subscriptionForm.name}
                            onChange={handleSubscriptionInputChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              formErrors.name ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Enter your full name"
                          />
                          {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Phone Number *</label>
                          <input
                            type="tel"
                            name="phoneNumber"
                            value={subscriptionForm.phoneNumber}
                            onChange={handleSubscriptionInputChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              formErrors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="e.g., 08123456789"
                          />
                          {formErrors.phoneNumber && <p className="text-red-500 text-sm mt-1">{formErrors.phoneNumber}</p>}
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
                              checked={subscriptionForm.mealTypes.includes(meal)}
                              onChange={() => handleCheckboxChange('mealTypes', meal)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2">{meal}</span>
                          </label>
                        ))}
                      </div>
                      {formErrors.mealTypes && <p className="text-red-500 text-sm mt-1">{formErrors.mealTypes}</p>}
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
                              checked={subscriptionForm.deliveryDays.includes(day)}
                              onChange={() => handleCheckboxChange('deliveryDays', day)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm">{day}</span>
                          </label>
                        ))}
                      </div>
                      {formErrors.deliveryDays && <p className="text-red-500 text-sm mt-1">{formErrors.deliveryDays}</p>}
                    </div>

                    {/* Allergies */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Allergies & Dietary Restrictions</label>
                      <textarea
                        name="allergies"
                        value={subscriptionForm.allergies}
                        onChange={handleSubscriptionInputChange}
                        rows="3"
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          formErrors.allergies ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Please specify any allergies or dietary restrictions..."
                      />
                      {formErrors.allergies && <p className="text-red-500 text-sm mt-1">{formErrors.allergies}</p>}
                    </div>

                    {/* Price Summary */}
                    {(subscriptionForm.mealTypes.length > 0 && subscriptionForm.deliveryDays.length > 0) && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Monthly Cost Summary</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Base price per meal:</span>
                            <span>{formatPrice(subscriptionForm.selectedPlan.price)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Meal types selected:</span>
                            <span>{subscriptionForm.mealTypes.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Delivery days per week:</span>
                            <span>{subscriptionForm.deliveryDays.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Weeks per month:</span>
                            <span>~4.3</span>
                          </div>
                          <hr className="my-2" />
                          <div className="flex justify-between font-bold text-lg">
                            <span>Total Monthly Cost:</span>
                            <span className="text-blue-600">{formatPrice(calculateTotalPrice())}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={() => setIsSubscriptionFormOpen(false)}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-6 rounded-xl font-semibold transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50"
                      >
                        {submitting ? 'Creating Subscription...' : 'Create Subscription'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">Not sure which plan is right for you?</p>
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors">
              Take Our Quiz 📋
            </button>
          </div>
        </div>
      </section>

      <section id="testimonials" className="py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/30"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-xl text-gray-300">Real stories from real people</p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="bg-white/10 backdrop-blur rounded-3xl p-8 md:p-12 border border-white/20">
              
              <div className="text-center mb-8">
                <div className="text-8xl mb-6 animate-pulse">
                  {testimonials[currentTestimonial].avatar}
                </div>
                
                <div className="flex justify-center mb-4">
                  {renderStars(testimonials[currentTestimonial].rating)}
                </div>
                
                <blockquote className="text-xl md:text-2xl italic text-gray-100 leading-relaxed mb-6 max-w-4xl mx-auto">
                  "{testimonials[currentTestimonial].reviewMessage}"
                </blockquote>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-yellow-300">
                    {testimonials[currentTestimonial].customerName}
                  </h3>
                  <p className="text-gray-300">{testimonials[currentTestimonial].role}</p>
                  <div className="flex justify-center items-center space-x-4 text-sm text-gray-400">
                    <span>📍 {testimonials[currentTestimonial].location}</span>
                    <span>•</span>
                    <span>📦 {testimonials[currentTestimonial].planUsed}</span>
                    <span>•</span>
                    <span>⏱️ {testimonials[currentTestimonial].duration}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center items-center space-x-6 mb-8">
                <button
                  onClick={() => setCurrentTestimonial(prev => prev === 0 ? testimonials.length - 1 : prev - 1)}
                  className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <div className="flex space-x-3">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentTestimonial(index)}
                      className={`w-4 h-4 rounded-full transition-all duration-300 ${
                        index === currentTestimonial 
                          ? 'bg-yellow-400 scale-125' 
                          : 'bg-white/30 hover:bg-white/50'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => setCurrentTestimonial(prev => prev === testimonials.length - 1 ? 0 : prev + 1)}
                  className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <div className="text-center">
                <button 
                  onClick={() => setIsTestimonialFormOpen(true)}
                  className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-6 py-3 rounded-full font-semibold transition-all transform hover:scale-105"
                >
                  Share Your Experience
                </button>
              </div>
            </div>

            {isTestimonialFormOpen && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-md w-full">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold text-gray-800">Share Your Testimonial</h3>
                      <button 
                        onClick={() => setIsTestimonialFormOpen(false)}
                        className="text-gray-500 hover:text-gray-700 p-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                      <input 
                        type="text"
                        value={testimonialForm.customerName}
                        onChange={(e) => setTestimonialForm({...testimonialForm, customerName: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                        placeholder="Enter your name"
                        required
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                      <textarea 
                        value={testimonialForm.reviewMessage}
                        onChange={(e) => setTestimonialForm({...testimonialForm, reviewMessage: e.target.value})}
                        rows="4"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                        placeholder="Share your experience with SEA Catering..."
                        required
                      />
                    </div>
                    
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setTestimonialForm({...testimonialForm, rating: star})}
                            className={`text-2xl ${star <= testimonialForm.rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
                          >
                            ⭐
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button 
                        type="button"
                        onClick={() => setIsTestimonialFormOpen(false)}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-6 rounded-xl font-semibold transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleTestimonialSubmit}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl font-semibold transition-colors"
                      >
                        Submit Review
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              {testimonials.filter((_, index) => index !== currentTestimonial).slice(0, 3).map((testimonial, index) => (
                <div 
                  key={testimonial.id}
                  className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                  onClick={() => setCurrentTestimonial(testimonials.findIndex(t => t.id === testimonial.id))}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="text-2xl">{testimonial.avatar}</span>
                    <div>
                      <h4 className="font-semibold text-sm">{testimonial.customerName}</h4>
                      <p className="text-xs text-gray-400">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 line-clamp-2">"{testimonial.reviewMessage}"</p>
                  <div className="flex justify-between items-center mt-3 text-xs text-gray-400">
                    <div className="flex">{renderStars(testimonial.rating).slice(0, 5)}</div>
                    <span>{testimonial.planUsed}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default SEACateringHome;
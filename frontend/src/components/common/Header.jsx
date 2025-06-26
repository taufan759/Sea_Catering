import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('home');
  // const { user, logout, isAuthenticated } = useAuth(); // Commented out karena context belum ada

  // const handleLogout = () => {
  //   if (window.confirm('Are you sure you want to logout?')) {
  //     logout();
  //   }
  // };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
    setIsMenuOpen(false);
  };

  const navItems = [
    { name: 'Home', id: 'home', href: 'hero' },
    { name: 'Meal Plans', id: 'plans', href: 'meal-plans' },
    { name: 'Features', id: 'features', href: 'features' },
    { name: 'Testimonials', id: 'testimonials', href: 'testimonials' },
    { name: 'Contact', id: 'contact', href: 'contact' }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-lg">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <button onClick={() => scrollToSection('hero')} className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">🍽️</span>
            </div>
            <div>
              <span className="text-2xl font-bold text-primary">SEA Catering</span>
              <p className="text-xs text-gray-600">Healthy Meals, Anytime, Anywhere</p>
            </div>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.href)}
                className={`font-medium transition-colors ${
                  activeNav === item.id
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-700 hover:text-primary'
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>

          {/* Auth Section - Simplified for now */}
          <div className="hidden md:flex items-center space-x-4">
            <button 
              onClick={() => window.location.href = '/login'}
              className="text-primary hover:text-primary-light font-medium transition-colors"
            >
              Login
            </button>
            <button 
              onClick={() => window.location.href = '/register'}
              className="bg-primary hover:bg-primary-light text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Get Started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-700 focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-3">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.href)}
                  className={`text-left font-medium transition-colors ${
                    activeNav === item.id ? 'text-primary' : 'text-gray-700 hover:text-primary'
                  }`}
                >
                  {item.name}
                </button>
              ))}
              
              <div className="pt-3 border-t border-gray-200 space-y-2">
                <button 
                  onClick={() => window.location.href = '/login'}
                  className="block text-center text-primary hover:text-primary-light font-medium transition-colors"
                >
                  Login
                </button>
                <button 
                  onClick={() => window.location.href = '/register'}
                  className="block bg-primary hover:bg-primary-light text-white px-6 py-2 rounded-lg font-medium transition-colors text-center"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
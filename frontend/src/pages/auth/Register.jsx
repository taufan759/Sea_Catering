import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppSettings from "../../AppSettings";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: []
  });
  
  const navigate = useNavigate();

  // Enhanced password validation according to Level 4 requirements
  const validatePassword = (password) => {
    const feedback = [];
    let score = 0;

    // Minimum 8 characters (Level 4 requirement)
    if (password.length < 8) {
      feedback.push("Password must be at least 8 characters long");
    } else {
      score += 1;
    }

    // Must include uppercase letter
    if (!/[A-Z]/.test(password)) {
      feedback.push("Password must include at least one uppercase letter");
    } else {
      score += 1;
    }

    // Must include lowercase letter
    if (!/[a-z]/.test(password)) {
      feedback.push("Password must include at least one lowercase letter");
    } else {
      score += 1;
    }

    // Must include number
    if (!/\d/.test(password)) {
      feedback.push("Password must include at least one number");
    } else {
      score += 1;
    }

    // Must include special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      feedback.push("Password must include at least one special character (!@#$%^&*)");
    } else {
      score += 1;
    }

    return { score, feedback };
  };

  const handlePasswordChange = (newPassword) => {
    setPassword(newPassword);
    const strength = validatePassword(newPassword);
    setPasswordStrength(strength);
  };

  const getPasswordStrengthColor = (score) => {
    if (score <= 1) return "bg-red-500";
    if (score <= 2) return "bg-orange-500";
    if (score <= 3) return "bg-yellow-500";
    if (score <= 4) return "bg-blue-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = (score) => {
    if (score <= 1) return "Very Weak";
    if (score <= 2) return "Weak";
    if (score <= 3) return "Fair";
    if (score <= 4) return "Good";
    return "Strong";
  };

  // XSS Prevention: Sanitize input
  const sanitizeInput = (input) => {
    return input
      .replace(/[<>]/g, '') // Remove potential script tags
      .trim();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Sanitize inputs to prevent XSS
    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = email.toLowerCase().trim();

    // Enhanced validation according to Level 4 requirements
    if (!sanitizedName || !sanitizedEmail || !password || !confirmPassword) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    // Name validation
    if (sanitizedName.length < 2) {
      setError("Name must be at least 2 characters long");
      setLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    // Password validation according to Level 4 requirements
    const passwordValidation = validatePassword(password);
    if (passwordValidation.score < 5) {
      setError("Password does not meet security requirements:\n" + passwordValidation.feedback.join("\n"));
      setLoading(false);
      return;
    }

    // Password confirmation
    if (password !== confirmPassword) {
      setError("Password and confirmation password do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${AppSettings.api}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: sanitizedName, 
          email: sanitizedEmail, 
          password, 
          confirmPassword 
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || errorData.message || "Registration failed, please try again.");
      }

      const data = await response.json();
      console.log("Registration successful:", data);
      
      setSuccess("Registration successful! Redirecting to login page...");
      
      // Clear form for security
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error) {
      console.error("Error during registration:", error);
      setError(error.message || "An error occurred during registration");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 font-sans">
      <div className="container mx-auto w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Join SEA Catering</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            <div className="whitespace-pre-line">{error}</div>
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="block mb-1 font-medium text-gray-700">
              Full Name *
            </label>
            <input 
              type="text" 
              id="name"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your full name"
              onChange={(e) => setName(e.target.value)}
              value={name}
              required
              disabled={loading}
              maxLength={100}
            />
          </div>

          <div>
            <label htmlFor="email" className="block mb-1 font-medium text-gray-700">
              Email *
            </label>
            <input 
              type="email" 
              id="email"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email address"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block mb-1 font-medium text-gray-700">
              Password *
            </label>
            <input 
              type="password" 
              id="password"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Min 8 chars with uppercase, lowercase, number & special char"
              onChange={(e) => handlePasswordChange(e.target.value)}
              value={password}
              required
              disabled={loading}
            />
            
            {/* Password Strength Indicator */}
            {password && (
              <div className="mt-2">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength.score)}`}
                      style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    ></div>
                  </div>
                  <span className={`text-xs font-medium ${passwordStrength.score >= 5 ? 'text-green-600' : 'text-red-600'}`}>
                    {getPasswordStrengthText(passwordStrength.score)}
                  </span>
                </div>
                
                {passwordStrength.feedback.length > 0 && (
                  <div className="text-xs text-red-600">
                    <ul className="list-disc list-inside space-y-1">
                      {passwordStrength.feedback.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="confirm-password" className="block mb-1 font-medium text-gray-700">
              Confirm Password *
            </label>
            <input 
              type="password" 
              id="confirm-password"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Re-enter your password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              value={confirmPassword}
              required
              disabled={loading}
            />
            
            {/* Password Match Indicator */}
            {confirmPassword && (
              <div className="mt-1">
                {password === confirmPassword ? (
                  <span className="text-xs text-green-600">✓ Passwords match</span>
                ) : (
                  <span className="text-xs text-red-600">✗ Passwords do not match</span>
                )}
              </div>
            )}
          </div>

          <button 
            type="submit"
            className="w-full bg-blue-900 hover:bg-blue-600 text-white py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || passwordStrength.score < 5}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <p className="text-center text-sm text-gray-600 mt-4">
            Already have an account? {' '}
            <Link to="/login" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </form>

        {/* Security Notice */}
        <div className="mt-6 p-4 bg-blue-50 rounded text-sm">
          <p className="text-blue-700 font-medium">🔒 Security Requirements:</p>
          <ul className="text-blue-600 text-xs mt-2 space-y-1">
            <li>• Minimum 8 characters</li>
            <li>• At least one uppercase letter (A-Z)</li>
            <li>• At least one lowercase letter (a-z)</li>
            <li>• At least one number (0-9)</li>
            <li>• At least one special character (!@#$%^&*)</li>
          </ul>
        </div>

        {/* SEA Catering Info */}
        <div className="mt-4 p-4 bg-gray-50 rounded text-sm text-center">
          <p className="text-gray-700">🍽️ <strong>SEA Catering</strong></p>
          <p className="text-gray-600">Healthy Meals, Anytime, Anywhere</p>
        </div>
      </div>
    </div>
  )
}

export default Register;
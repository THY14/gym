import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const navigate = useNavigate();

  // useAuth must return an object, not array
  const { login, error } = useAuth(); // This assumes useAuth returns { login, error }

  // Sync backend error into localError
  useEffect(() => {
    if (error) setLocalError(error);
  }, [error]);

  // Auto-clear error after 3 seconds
  useEffect(() => {
    if (localError) {
      const timer = setTimeout(() => setLocalError(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [localError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setLoading(true);
    try {
      const { user } = await login(email, password);
      const rolePaths = {
        trainer: '/trainer-dashboard',
        receptionist: '/receptionist-dashboard',
        admin: '/admin-dashboard',
        member: '/member-dashboard',
      };
      navigate(rolePaths[user.role] || '/');
    } catch (err) {
      console.error('Login failed:', err);
      setLocalError('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900 p-8 rounded-lg">
        <div className="text-center mb-4">
          <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
          <p className="mt-2 text-gray-400">Sign in to your account</p>
        </div>

        {localError && <ErrorMessage message={localError} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 bg-gray-800 rounded-lg text-white"
            required
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-gray-800 rounded-lg text-white"
            required
            disabled={loading}
          />
          <button
            type="submit"
            className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 flex items-center justify-center"
            disabled={loading}
          >
            {loading ? <LoadingSpinner size="sm" className="mr-2" /> : 'Sign In'}
          </button>
        </form>

        <p className="text-gray-400 mt-4">
          Need an account? <Link to="/register" className="text-red-500">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
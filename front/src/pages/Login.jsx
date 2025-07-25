import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    login(email, password); // Mock login
    navigate('/');

     // Redirect based on role
    const role = email.startsWith('trainer')
      ? 'trainer'
      : email.startsWith('receptionist')
      ? 'receptionist'
      : email.startsWith('admin')
      ? 'admin'
      : 'member';

    switch (role) {
      case 'trainer':
        navigate('/trainer-dashboard');
        break;
      case 'receptionist':
        navigate('/receptionist-dashboard');
        break;
      case 'admin':
        navigate('/admin-dashboard');
        break;
      default:
        navigate('/member-dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900 p-8 rounded-lg">
        <div className="text-center mb-4">
          <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
          <p className="mt-2 text-gray-400">Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 bg-gray-800 rounded-lg text-white"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-gray-800 rounded-lg text-white"
            required
          />
          <button
            type="submit"
            className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700"
          >
            Sign In
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
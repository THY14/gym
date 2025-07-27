import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, error: authError } = useAuth();
  const [localError, setLocalError] = useState('');
  const navigate = useNavigate();

  // Sync backend error into localError
  useEffect(() => {
    if (authError) setLocalError(authError);
  }, [authError]);

  // Auto-clear local error after 3 seconds
  useEffect(() => {
    if (localError) {
      const timer = setTimeout(() => {
        setLocalError('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [localError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (password !== confirmPassword) {
      return setLocalError('Passwords do not match.');
    }

    setLoading(true);
    try {
      await register({ firstName, lastName, email, phone, password, role: 'member' });
      navigate('/member-dashboard');
    } catch (err) {
      console.error('Registration failed:', err);
      // Optional: setLocalError('Registration failed.') if not handled in useAuth
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900 p-8 rounded-lg">
        <div className="text-center mb-4">
          <h2 className="text-3xl font-bold text-white">Join Gym Club</h2>
          <p className="mt-2 text-gray-400">Create your account and start your fitness journey</p>
        </div>

        {localError && <ErrorMessage message={localError} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-1/2 p-3 bg-gray-800 rounded-lg text-white" required disabled={loading} />
            <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-1/2 p-3 bg-gray-800 rounded-lg text-white" required disabled={loading} />
          </div>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 bg-gray-800 rounded-lg text-white" required disabled={loading} />
          <input type="tel" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-3 bg-gray-800 rounded-lg text-white" required disabled={loading} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 bg-gray-800 rounded-lg text-white" required disabled={loading} />
          <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full p-3 bg-gray-800 rounded-lg text-white" required disabled={loading} />
          <button type="submit" className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 flex items-center justify-center" disabled={loading}>
            {loading ? <LoadingSpinner size="sm" className="mr-2" /> : 'Create Account'}
          </button>
        </form>
        <p className="text-gray-400 mt-4">
          Already have an account? <Link to="/login" className="text-red-500">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
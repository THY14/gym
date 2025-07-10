import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="p-4 border-b border-gray-800">
      <div className="flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-red-500">Gym Club</Link>
        <div className="flex justify-center space-x-6">
          <Link to="/" className="text-gray-400 hover:text-white text-sm">
            Home
          </Link>
          <Link to="/services" className="text-gray-400 hover:text-white text-sm">
            Services
            </Link>
            <Link to="/membership" className="text-gray-400 hover:text-white text-sm">
            Membership
            </Link>
          <Link to="/about" className="text-gray-400 hover:text-white text-sm">
            About
          </Link>
          <Link to="/contact" className="text-gray-400 hover:text-white text-sm">
            Contact
          </Link>
        </div>
        <div className="flex gap-4">
          {user ? (
            <button onClick={logout} className="text-white hover:text-red-500">
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="text-white hover:text-red-500">Login</Link>
              <Link to="/register" className="text-white hover:text-red-500">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
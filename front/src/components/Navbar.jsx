import React, { useEffect, useState, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Dumbbell, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isVisible, setIsVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(currentScrollY <= lastScrollY.current || currentScrollY < 10);
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', controlNavbar);
    return () => window.removeEventListener('scroll', controlNavbar);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  const authLinkClass = ({ isActive }) =>
    `text-sm ${isActive ? 'text-red-500' : 'text-white hover:text-red-500'}`;

  const navLinkClass = ({ isActive }) =>
    `text-sm ${isActive ? 'text-white' : 'text-gray-400 hover:text-white'}`;

  const getDashboardLink = () => {
    if (!user) return null;
    const path = {
      trainer: '/trainer-dashboard',
      member: '/member-dashboard',
      receptionist: '/receptionist-dashboard',
      admin: '/admin-dashboard',
    }[user.role];

    return path ? <NavLink to={path} className={navLinkClass}>Dashboard</NavLink> : null;
  };

  return (
    <nav className={`p-4 border-b border-gray-800 fixed top-0 left-0 right-0 z-50 bg-black transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className="flex justify-between items-center">
        {/* Logo */}
        <NavLink to="/" className="flex items-center space-x-2">
          <Dumbbell className="h-8 w-8 text-red-600" />
          <span className="text-xl font-bold text-white">Gym Club</span>
        </NavLink>

        {/* Hamburger Menu (Mobile) */}
        <button className="text-white md:hidden" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex md:items-center md:space-x-6">
          <NavLink to="/" className={navLinkClass}>Home</NavLink>
          <NavLink to="/services" className={navLinkClass}>Services</NavLink>
          <NavLink to="/membership" className={navLinkClass}>Membership</NavLink>
          <NavLink to="/about" className={navLinkClass}>About</NavLink>
          <NavLink to="/contact" className={navLinkClass}>Contact</NavLink>
          {user && getDashboardLink()}
        </div>

        {/* Desktop Auth */}
        <div className="hidden md:flex gap-4">
          {user ? (
            <button onClick={logout} className="text-white hover:text-red-500">Logout</button>
          ) : (
            <>
              <NavLink to="/login" className={authLinkClass}>Login</NavLink>
              <NavLink to="/register" className={authLinkClass}>Register</NavLink>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-4 flex flex-col space-y-3 text-white border-t border-gray-700 pt-4">
          <NavLink to="/" className={navLinkClass} onClick={toggleMobileMenu}>Home</NavLink>
          <NavLink to="/services" className={navLinkClass} onClick={toggleMobileMenu}>Services</NavLink>
          <NavLink to="/membership" className={navLinkClass} onClick={toggleMobileMenu}>Membership</NavLink>
          <NavLink to="/about" className={navLinkClass} onClick={toggleMobileMenu}>About</NavLink>
          <NavLink to="/contact" className={navLinkClass} onClick={toggleMobileMenu}>Contact</NavLink>
          {user && (
            <>
              {getDashboardLink()}
              <button onClick={() => { logout(); toggleMobileMenu(); }} className="text-left text-white hover:text-red-500">Logout</button>
            </>
          )}
          {!user && (
            <>
              <NavLink to="/login" className={authLinkClass} onClick={toggleMobileMenu}>Login</NavLink>
              <NavLink to="/register" className={authLinkClass} onClick={toggleMobileMenu}>Register</NavLink>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
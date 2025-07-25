import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error('Error loading user from localStorage:', error);
    }
    setLoading(false);
    console.log('AuthProvider - Loading complete');
  }, []);

  // Update user and persist to localStorage
  const updateUser = (newUser) => {
    try {
      setUser(newUser);
      if (newUser) {
        localStorage.setItem('user', JSON.stringify(newUser));
      } else {
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }
  };

  // Fake login function with complete user object
  const login = (email, password) => {
    let role = 'member';
    if (email.endsWith('@trainer.com')) {
      role = 'trainer';
    } else if (email.endsWith('@receptionist.com')) {
      role = 'receptionist';
    } else if (email.endsWith('@admin.com')) {
      role = 'admin';
    }

    const fakeUser = {
      firstName: 'Test',
      lastName: role.charAt(0).toUpperCase() + role.slice(1),
      email,
      role,
      bio: '',
      specialties: '',
      certifications: '',
      phoneNumber: '',
      specialization: '',
      availability: '',
      profileImage: 'https://via.placeholder.com/150',
    };
    updateUser(fakeUser);
  };

  // Register a new user
  const register = (data) => {
    const newUser = {
      ...data,
      role: 'member',
      bio: data.bio || '',
      specialties: data.specialties || '',
      certifications: data.certifications || '',
      phoneNumber: data.phoneNumber || '',
      specialization: data.specialization || '',
      availability: data.availability || '',
      profileImage: data.profileImage || 'https://via.placeholder.com/150',
    };
    updateUser(newUser);
  };

  // Logout function
  const logout = () => {
    updateUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser: updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
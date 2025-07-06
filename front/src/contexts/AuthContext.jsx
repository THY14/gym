import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Mock functions (replace with real API calls later)
  const login = async (email, password) => {
    setUser({ email, role: 'member' }); // Simulate login
  };

  const register = async (userData) => {
    setUser({ email: userData.email, role: userData.role }); // Simulate registration
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
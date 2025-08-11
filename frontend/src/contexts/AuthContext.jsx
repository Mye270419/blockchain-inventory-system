import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Siempre autenticado
  const [user, setUser] = useState({ username: 'guest', rol: 'usuario' }); // Usuario por defecto
  const navigate = useNavigate();

  const login = async () => {
    // No hay lógica de login, simplemente navega al dashboard
    navigate('/dashboard');
    return { success: true };
  };

  const logout = () => {
    // No hay lógica de logout, simplemente navega al dashboard
    navigate('/dashboard');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);



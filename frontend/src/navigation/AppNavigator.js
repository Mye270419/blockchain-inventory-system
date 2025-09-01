import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from '../screens/LoadingScreen';
import AuthNavigator from './AuthNavigator';
import ClientNavigator from './ClientNavigator';
import EmployeeNavigator from './EmployeeNavigator';
import AdminNavigator from './AdminNavigator';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { isLoading, isAuthenticated, user } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <AuthNavigator />;
  }

  // Navegación basada en el rol del usuario
  const getRoleNavigator = () => {
    switch (user?.rol) {
      case 'cliente':
        return <ClientNavigator />;
      case 'empleado':
        return <EmployeeNavigator />;
      case 'administrador':
        return <AdminNavigator />;
      default:
        return <ClientNavigator />; // Por defecto, cliente
    }
  };

  return getRoleNavigator();
};

export default AppNavigator;


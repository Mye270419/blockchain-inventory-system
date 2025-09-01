import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Screens para administradores
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import UserManagementScreen from '../screens/admin/UserManagementScreen';
import ProductManagementScreen from '../screens/admin/ProductManagementScreen';
import InventoryManagementScreen from '../screens/admin/InventoryManagementScreen';
import OrderManagementScreen from '../screens/admin/OrderManagementScreen';
import ReportsScreen from '../screens/admin/ReportsScreen';
import BlockchainScreen from '../screens/admin/BlockchainScreen';
import SettingsScreen from '../screens/admin/SettingsScreen';
import ProfileScreen from '../screens/admin/ProfileScreen';

const Drawer = createDrawerNavigator();

const AdminNavigator = () => {
  return (
    <Drawer.Navigator
      screenOptions={({ route }) => ({
        drawerIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Dashboard':
              iconName = 'view-dashboard';
              break;
            case 'UserManagement':
              iconName = 'account-group';
              break;
            case 'ProductManagement':
              iconName = 'cube-outline';
              break;
            case 'InventoryManagement':
              iconName = 'package-variant';
              break;
            case 'OrderManagement':
              iconName = 'clipboard-list';
              break;
            case 'Reports':
              iconName = 'chart-line';
              break;
            case 'Blockchain':
              iconName = 'link-variant';
              break;
            case 'Settings':
              iconName = 'cog';
              break;
            case 'Profile':
              iconName = 'account';
              break;
            default:
              iconName = 'circle';
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        drawerActiveTintColor: '#2c3e50',
        drawerInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: '#2c3e50',
        },
        headerTintColor: '#fff',
      })}
    >
      <Drawer.Screen 
        name="Dashboard" 
        component={AdminDashboardScreen}
        options={{ title: 'Panel Principal' }}
      />
      <Drawer.Screen 
        name="UserManagement" 
        component={UserManagementScreen}
        options={{ title: 'Gestión de Usuarios' }}
      />
      <Drawer.Screen 
        name="ProductManagement" 
        component={ProductManagementScreen}
        options={{ title: 'Gestión de Productos' }}
      />
      <Drawer.Screen 
        name="InventoryManagement" 
        component={InventoryManagementScreen}
        options={{ title: 'Gestión de Inventario' }}
      />
      <Drawer.Screen 
        name="OrderManagement" 
        component={OrderManagementScreen}
        options={{ title: 'Gestión de Pedidos' }}
      />
      <Drawer.Screen 
        name="Reports" 
        component={ReportsScreen}
        options={{ title: 'Reportes' }}
      />
      <Drawer.Screen 
        name="Blockchain" 
        component={BlockchainScreen}
        options={{ title: 'Blockchain' }}
      />
      <Drawer.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: 'Configuración' }}
      />
      <Drawer.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Perfil' }}
      />
    </Drawer.Navigator>
  );
};

export default AdminNavigator;


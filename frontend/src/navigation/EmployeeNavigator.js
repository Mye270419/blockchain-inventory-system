import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Screens para empleados
import EmployeeDashboardScreen from '../screens/employee/EmployeeDashboardScreen';
import InventoryScreen from '../screens/employee/InventoryScreen';
import TransactionsScreen from '../screens/employee/TransactionsScreen';
import ProductsScreen from '../screens/employee/ProductsScreen';
import OrderManagementScreen from '../screens/employee/OrderManagementScreen';
import ReportsScreen from '../screens/employee/ReportsScreen';
import ProfileScreen from '../screens/employee/ProfileScreen';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

const EmployeeNavigator = () => {
  return (
    <Drawer.Navigator
      screenOptions={({ route }) => ({
        drawerIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Dashboard':
              iconName = 'view-dashboard';
              break;
            case 'Inventory':
              iconName = 'package-variant';
              break;
            case 'Transactions':
              iconName = 'swap-horizontal';
              break;
            case 'Products':
              iconName = 'cube-outline';
              break;
            case 'OrderManagement':
              iconName = 'clipboard-list';
              break;
            case 'Reports':
              iconName = 'chart-line';
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
        component={EmployeeDashboardScreen}
        options={{ title: 'Panel Principal' }}
      />
      <Drawer.Screen 
        name="Inventory" 
        component={InventoryScreen}
        options={{ title: 'Inventario' }}
      />
      <Drawer.Screen 
        name="Transactions" 
        component={TransactionsScreen}
        options={{ title: 'Transacciones' }}
      />
      <Drawer.Screen 
        name="Products" 
        component={ProductsScreen}
        options={{ title: 'Productos' }}
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
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Perfil' }}
      />
    </Drawer.Navigator>
  );
};

export default EmployeeNavigator;


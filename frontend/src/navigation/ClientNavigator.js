import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Badge } from 'react-native-paper';
import { useCart } from '../contexts/CartContext';

// Screens para clientes
import ClientHomeScreen from '../screens/client/ClientHomeScreen';
import ProductCatalogScreen from '../screens/client/ProductCatalogScreen';
import ProductDetailScreen from '../screens/client/ProductDetailScreen';
import CartScreen from '../screens/client/CartScreen';
import OrdersScreen from '../screens/client/OrdersScreen';
import OrderDetailScreen from '../screens/client/OrderDetailScreen';
import CheckoutScreen from '../screens/client/CheckoutScreen';
import PaymentScreen from '../screens/client/PaymentScreen';
import ProfileScreen from '../screens/client/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack para el catálogo de productos
const CatalogStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="ProductCatalogMain" 
      component={ProductCatalogScreen}
      options={{ title: 'Productos' }}
    />
    <Stack.Screen 
      name="ProductDetail" 
      component={ProductDetailScreen}
      options={{ title: 'Detalle del Producto' }}
    />
  </Stack.Navigator>
);

// Stack para pedidos
const OrdersStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="OrdersMain" 
      component={OrdersScreen}
      options={{ title: 'Mis Pedidos' }}
    />
    <Stack.Screen 
      name="OrderDetail" 
      component={OrderDetailScreen}
      options={{ title: 'Detalle del Pedido' }}
    />
  </Stack.Navigator>
);

// Stack para el carrito
const CartStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="CartMain" 
      component={CartScreen}
      options={{ title: 'Carrito' }}
    />
    <Stack.Screen 
      name="Checkout" 
      component={CheckoutScreen}
      options={{ title: 'Finalizar Compra' }}
    />
    <Stack.Screen 
      name="Payment" 
      component={PaymentScreen}
      options={{ title: 'Pago' }}
    />
  </Stack.Navigator>
);

const ClientNavigator = () => {
  const { itemCount } = useCart();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Catalog') {
            iconName = focused ? 'shopping' : 'shopping-outline';
          } else if (route.name === 'Cart') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'Orders') {
            iconName = focused ? 'clipboard-list' : 'clipboard-list-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'account' : 'account-outline';
          }

          const icon = <MaterialCommunityIcons name={iconName} size={size} color={color} />;
          
          // Mostrar badge en el carrito si hay items
          if (route.name === 'Cart' && itemCount > 0) {
            return (
              <div style={{ position: 'relative' }}>
                {icon}
                <Badge
                  size={18}
                  style={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    backgroundColor: '#e74c3c',
                  }}
                >
                  {itemCount}
                </Badge>
              </div>
            );
          }
          
          return icon;
        },
        tabBarActiveTintColor: '#2c3e50',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={ClientHomeScreen}
        options={{ title: 'Inicio' }}
      />
      <Tab.Screen 
        name="Catalog" 
        component={CatalogStack}
        options={{ title: 'Productos' }}
      />
      <Tab.Screen 
        name="Cart" 
        component={CartStack}
        options={{ title: 'Carrito' }}
      />
      <Tab.Screen 
        name="Orders" 
        component={OrdersStack}
        options={{ title: 'Pedidos' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Perfil' }}
      />
    </Tab.Navigator>
  );
};

export default ClientNavigator;


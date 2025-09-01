import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Card, Chip, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { orderService } from '../../services/api';

const OrdersScreen = ({ navigation }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getOrders(user.id);
      setOrders(response.orders);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pendiente': '#f39c12',
      'confirmado': '#3498db',
      'preparando': '#9b59b6',
      'en_camino': '#e67e22',
      'entregado': '#27ae60',
      'cancelado': '#e74c3c',
    };
    return colors[status] || '#95a5a6';
  };

  const getStatusText = (status) => {
    const texts = {
      'pendiente': 'Pendiente',
      'confirmado': 'Confirmado',
      'preparando': 'Preparando',
      'en_camino': 'En Camino',
      'entregado': 'Entregado',
      'cancelado': 'Cancelado',
    };
    return texts[status] || status;
  };

  const getStatusIcon = (status) => {
    const icons = {
      'pendiente': 'clock-outline',
      'confirmado': 'check-circle-outline',
      'preparando': 'chef-hat',
      'en_camino': 'truck-delivery',
      'entregado': 'check-circle',
      'cancelado': 'close-circle',
    };
    return icons[status] || 'help-circle';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleOrderPress = (order) => {
    navigation.navigate('OrderDetail', { order });
  };

  const renderOrder = ({ item }) => (
    <TouchableOpacity onPress={() => handleOrderPress(item)}>
      <Card style={styles.orderCard}>
        <Card.Content>
          <View style={styles.orderHeader}>
            <View style={styles.orderInfo}>
              <Text style={styles.orderNumber}>#{item.numero_pedido}</Text>
              <Text style={styles.orderDate}>{formatDate(item.fecha_pedido)}</Text>
            </View>
            <Chip
              icon={getStatusIcon(item.estado)}
              textStyle={{ color: getStatusColor(item.estado) }}
              style={[styles.statusChip, { borderColor: getStatusColor(item.estado) }]}
              mode="outlined"
            >
              {getStatusText(item.estado)}
            </Chip>
          </View>

          <View style={styles.orderDetails}>
            <View style={styles.orderAmount}>
              <MaterialCommunityIcons name="currency-usd" size={20} color={theme.colors.primary} />
              <Text style={styles.orderTotal}>${item.total}</Text>
            </View>
            
            {item.direccion_entrega && (
              <View style={styles.orderAddress}>
                <MaterialCommunityIcons name="map-marker" size={16} color="#7f8c8d" />
                <Text style={styles.addressText} numberOfLines={1}>
                  {item.direccion_entrega}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.orderFooter}>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#bdc3c7" />
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialCommunityIcons name="loading" size={50} color={theme.colors.primary} />
        <Text style={styles.loadingText}>Cargando pedidos...</Text>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="clipboard-list-outline" size={100} color="#bdc3c7" />
        <Text style={styles.emptyTitle}>No tienes pedidos</Text>
        <Text style={styles.emptySubtitle}>Cuando realices tu primera compra, aparecerá aquí</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.ordersList}
        refreshing={loading}
        onRefresh={loadOrders}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  ordersList: {
    padding: 15,
  },
  orderCard: {
    marginBottom: 15,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  orderDate: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  statusChip: {
    backgroundColor: 'transparent',
  },
  orderDetails: {
    marginBottom: 10,
  },
  orderAmount: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderTotal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#27ae60',
    marginLeft: 5,
  },
  orderAddress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginLeft: 5,
    flex: 1,
  },
  orderFooter: {
    alignItems: 'flex-end',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#f8f9fa',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
});

export default OrdersScreen;


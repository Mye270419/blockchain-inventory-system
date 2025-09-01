import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Card, Chip, Button, useTheme, Modal, Portal } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { orderService } from '../../services/api';

const OrderManagementScreen = ({ navigation }) => {
  const theme = useTheme();
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getAllOrders();
      setOrders(response.orders);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const orderStatuses = [
    { key: 'all', label: 'Todos', color: '#95a5a6' },
    { key: 'pendiente', label: 'Pendientes', color: '#f39c12' },
    { key: 'confirmado', label: 'Confirmados', color: '#3498db' },
    { key: 'preparando', label: 'Preparando', color: '#9b59b6' },
    { key: 'en_camino', label: 'En Camino', color: '#e67e22' },
    { key: 'entregado', label: 'Entregados', color: '#27ae60' },
    { key: 'cancelado', label: 'Cancelados', color: '#e74c3c' },
  ];

  const getFilteredOrders = () => {
    if (filterStatus === 'all') {
      return orders;
    }
    return orders.filter(order => order.estado === filterStatus);
  };

  const getStatusInfo = (status) => {
    return orderStatuses.find(s => s.key === status) || orderStatuses[0];
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

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      loadOrders();
      setModalVisible(false);
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = ['pendiente', 'confirmado', 'preparando', 'en_camino', 'entregado'];
    const currentIndex = statusFlow.indexOf(currentStatus);
    return currentIndex < statusFlow.length - 1 ? statusFlow[currentIndex + 1] : null;
  };

  const renderOrder = ({ item }) => {
    const statusInfo = getStatusInfo(item.estado);
    const nextStatus = getNextStatus(item.estado);
    const nextStatusInfo = nextStatus ? getStatusInfo(nextStatus) : null;
    
    return (
      <Card style={styles.orderCard}>
        <Card.Content>
          <View style={styles.orderHeader}>
            <View style={styles.orderInfo}>
              <Text style={styles.orderNumber}>#{item.numero_pedido}</Text>
              <Text style={styles.orderDate}>{formatDate(item.fecha_pedido)}</Text>
              <Text style={styles.customerName}>{item.cliente_nombre}</Text>
            </View>
            <Chip
              icon={getStatusIcon(item.estado)}
              textStyle={{ color: statusInfo.color }}
              style={[styles.statusChip, { borderColor: statusInfo.color }]}
              mode="outlined"
            >
              {statusInfo.label}
            </Chip>
          </View>

          <View style={styles.orderDetails}>
            <View style={styles.orderAmount}>
              <MaterialCommunityIcons name="currency-usd" size={20} color={theme.colors.primary} />
              <Text style={styles.orderTotal}>${item.total}</Text>
            </View>
            
            <View style={styles.orderAddress}>
              <MaterialCommunityIcons name="map-marker" size={16} color="#7f8c8d" />
              <Text style={styles.addressText} numberOfLines={1}>
                {item.direccion_entrega}
              </Text>
            </View>

            <View style={styles.orderContact}>
              <MaterialCommunityIcons name="phone" size={16} color="#7f8c8d" />
              <Text style={styles.contactText}>{item.telefono_contacto}</Text>
            </View>
          </View>

          <View style={styles.orderActions}>
            <Button
              mode="outlined"
              onPress={() => {
                setSelectedOrder(item);
                setModalVisible(true);
              }}
              style={styles.actionButton}
              icon="eye"
            >
              Ver Detalles
            </Button>
            
            {nextStatusInfo && item.estado !== 'entregado' && item.estado !== 'cancelado' && (
              <Button
                mode="contained"
                onPress={() => handleUpdateOrderStatus(item.id, nextStatus)}
                style={[styles.actionButton, { backgroundColor: nextStatusInfo.color }]}
                icon={getStatusIcon(nextStatus)}
              >
                {nextStatusInfo.label}
              </Button>
            )}
          </View>
        </Card.Content>
      </Card>
    );
  };

  const filteredOrders = getFilteredOrders();

  return (
    <View style={styles.container}>
      {/* Filtros de estado */}
      <View style={styles.filtersContainer}>
        <FlatList
          data={orderStatuses}
          renderItem={({ item }) => (
            <Chip
              selected={filterStatus === item.key}
              onPress={() => setFilterStatus(item.key)}
              style={styles.filterChip}
              textStyle={filterStatus === item.key ? { color: '#fff' } : { color: item.color }}
              selectedColor={item.color}
            >
              {item.label}
            </Chip>
          )}
          keyExtractor={(item) => item.key}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        />
      </View>

      {/* Estadísticas rápidas */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{orders.filter(o => o.estado === 'pendiente').length}</Text>
          <Text style={styles.statLabel}>Pendientes</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{orders.filter(o => o.estado === 'preparando').length}</Text>
          <Text style={styles.statLabel}>Preparando</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{orders.filter(o => o.estado === 'en_camino').length}</Text>
          <Text style={styles.statLabel}>En Camino</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{orders.filter(o => o.estado === 'entregado').length}</Text>
          <Text style={styles.statLabel}>Entregados</Text>
        </View>
      </View>

      {/* Lista de pedidos */}
      <FlatList
        data={filteredOrders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.ordersList}
        refreshing={loading}
        onRefresh={loadOrders}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="clipboard-list-outline" size={64} color="#bdc3c7" />
            <Text style={styles.emptyText}>No hay pedidos para mostrar</Text>
          </View>
        }
      />

      {/* Modal de detalles del pedido */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          {selectedOrder && (
            <Card>
              <Card.Content>
                <Text style={styles.modalTitle}>Detalles del Pedido</Text>
                <Text style={styles.modalSubtitle}>#{selectedOrder.numero_pedido}</Text>

                <View style={styles.modalSection}>
                  <Text style={styles.sectionTitle}>Cliente</Text>
                  <Text style={styles.sectionContent}>{selectedOrder.cliente_nombre}</Text>
                  <Text style={styles.sectionContent}>{selectedOrder.telefono_contacto}</Text>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.sectionTitle}>Dirección de Entrega</Text>
                  <Text style={styles.sectionContent}>{selectedOrder.direccion_entrega}</Text>
                </View>

                {selectedOrder.observaciones && (
                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>Observaciones</Text>
                    <Text style={styles.sectionContent}>{selectedOrder.observaciones}</Text>
                  </View>
                )}

                <View style={styles.modalSection}>
                  <Text style={styles.sectionTitle}>Total del Pedido</Text>
                  <Text style={styles.totalAmount}>${selectedOrder.total}</Text>
                </View>

                <View style={styles.statusActions}>
                  <Text style={styles.sectionTitle}>Cambiar Estado</Text>
                  <View style={styles.statusButtons}>
                    {orderStatuses.slice(1, -1).map((status) => (
                      <Button
                        key={status.key}
                        mode={selectedOrder.estado === status.key ? "contained" : "outlined"}
                        onPress={() => handleUpdateOrderStatus(selectedOrder.id, status.key)}
                        style={[
                          styles.statusButton,
                          selectedOrder.estado === status.key && { backgroundColor: status.color }
                        ]}
                        textColor={selectedOrder.estado === status.key ? '#fff' : status.color}
                        disabled={selectedOrder.estado === 'entregado' || selectedOrder.estado === 'cancelado'}
                      >
                        {status.label}
                      </Button>
                    ))}
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <Button
                    mode="outlined"
                    onPress={() => setModalVisible(false)}
                    style={styles.modalButton}
                  >
                    Cerrar
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => {
                      // Navegar a detalles completos
                      setModalVisible(false);
                    }}
                    style={[styles.modalButton, { backgroundColor: theme.colors.tertiary }]}
                    icon="open-in-new"
                  >
                    Ver Completo
                  </Button>
                </View>
              </Card.Content>
            </Card>
          )}
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  filtersContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  filtersContent: {
    paddingVertical: 5,
  },
  filterChip: {
    marginRight: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 5,
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
    marginBottom: 3,
  },
  customerName: {
    fontSize: 14,
    color: '#34495e',
    fontWeight: '500',
  },
  statusChip: {
    backgroundColor: 'transparent',
  },
  orderDetails: {
    marginBottom: 15,
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
    marginBottom: 5,
  },
  addressText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginLeft: 5,
    flex: 1,
  },
  orderContact: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginLeft: 5,
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 10,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 20,
  },
  modalSection: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  sectionContent: {
    fontSize: 14,
    color: '#34495e',
    lineHeight: 20,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  statusActions: {
    marginBottom: 20,
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statusButton: {
    marginRight: 10,
    marginBottom: 10,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
  },
});

export default OrderManagementScreen;


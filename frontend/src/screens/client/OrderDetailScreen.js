import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Chip, Button, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { orderService } from '../../services/api';

const OrderDetailScreen = ({ route, navigation }) => {
  const theme = useTheme();
  const { order } = route.params;
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrderDetails();
  }, []);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await orderService.getOrder(order.id);
      setOrderDetails(response.order);
    } catch (error) {
      console.error('Error loading order details:', error);
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

  const getStatusSteps = () => {
    const steps = [
      { key: 'pendiente', label: 'Pedido Recibido', icon: 'check-circle' },
      { key: 'confirmado', label: 'Confirmado', icon: 'check-circle' },
      { key: 'preparando', label: 'Preparando', icon: 'chef-hat' },
      { key: 'en_camino', label: 'En Camino', icon: 'truck-delivery' },
      { key: 'entregado', label: 'Entregado', icon: 'check-circle' },
    ];

    const currentIndex = steps.findIndex(step => step.key === order.estado);
    
    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      active: index === currentIndex,
    }));
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

  const statusSteps = getStatusSteps();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialCommunityIcons name="loading" size={50} color={theme.colors.primary} />
        <Text style={styles.loadingText}>Cargando detalles...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header del pedido */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.orderHeader}>
            <View>
              <Text style={styles.orderNumber}>Pedido #{order.numero_pedido}</Text>
              <Text style={styles.orderDate}>{formatDate(order.fecha_pedido)}</Text>
            </View>
            <Chip
              textStyle={{ color: getStatusColor(order.estado) }}
              style={[styles.statusChip, { borderColor: getStatusColor(order.estado) }]}
              mode="outlined"
            >
              {getStatusText(order.estado)}
            </Chip>
          </View>
        </Card.Content>
      </Card>

      {/* Seguimiento del pedido */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Seguimiento del Pedido</Text>
          <View style={styles.trackingContainer}>
            {statusSteps.map((step, index) => (
              <View key={step.key} style={styles.trackingStep}>
                <View style={styles.stepIndicator}>
                  <View style={[
                    styles.stepCircle,
                    {
                      backgroundColor: step.completed ? theme.colors.tertiary : '#ecf0f1',
                      borderColor: step.active ? theme.colors.tertiary : '#bdc3c7',
                    }
                  ]}>
                    <MaterialCommunityIcons
                      name={step.icon}
                      size={16}
                      color={step.completed ? '#fff' : '#bdc3c7'}
                    />
                  </View>
                  {index < statusSteps.length - 1 && (
                    <View style={[
                      styles.stepLine,
                      { backgroundColor: step.completed ? theme.colors.tertiary : '#ecf0f1' }
                    ]} />
                  )}
                </View>
                <Text style={[
                  styles.stepLabel,
                  { color: step.completed ? '#2c3e50' : '#bdc3c7' }
                ]}>
                  {step.label}
                </Text>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Productos del pedido */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Productos</Text>
          {orderDetails?.items?.map((item, index) => (
            <View key={index} style={styles.productItem}>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.nombre}</Text>
                <Text style={styles.productQuantity}>Cantidad: {item.cantidad}</Text>
              </View>
              <Text style={styles.productPrice}>${item.subtotal}</Text>
            </View>
          ))}
          
          <View style={styles.totalSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal:</Text>
              <Text style={styles.totalValue}>${order.subtotal}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Impuestos:</Text>
              <Text style={styles.totalValue}>${order.impuestos}</Text>
            </View>
            <View style={[styles.totalRow, styles.finalTotal]}>
              <Text style={styles.finalTotalLabel}>Total:</Text>
              <Text style={styles.finalTotalValue}>${order.total}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Información de entrega */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Información de Entrega</Text>
          <View style={styles.deliveryInfo}>
            <MaterialCommunityIcons name="map-marker" size={20} color={theme.colors.primary} />
            <Text style={styles.deliveryText}>{order.direccion_entrega}</Text>
          </View>
          <View style={styles.deliveryInfo}>
            <MaterialCommunityIcons name="phone" size={20} color={theme.colors.primary} />
            <Text style={styles.deliveryText}>{order.telefono_contacto}</Text>
          </View>
          {order.observaciones && (
            <View style={styles.deliveryInfo}>
              <MaterialCommunityIcons name="note-text" size={20} color={theme.colors.primary} />
              <Text style={styles.deliveryText}>{order.observaciones}</Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Botones de acción */}
      <View style={styles.actions}>
        {order.estado === 'entregado' && (
          <Button
            mode="outlined"
            onPress={() => {/* Implementar reordenar */}}
            style={styles.actionButton}
            labelStyle={styles.buttonLabel}
            icon="repeat"
          >
            Volver a Pedir
          </Button>
        )}
        
        <Button
          mode="contained"
          onPress={() => navigation.goBack()}
          style={[styles.actionButton, { backgroundColor: theme.colors.tertiary }]}
          labelStyle={styles.buttonLabel}
          icon="arrow-left"
        >
          Volver a Pedidos
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  card: {
    margin: 15,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderNumber: {
    fontSize: 20,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  trackingContainer: {
    paddingLeft: 10,
  },
  trackingStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  stepIndicator: {
    alignItems: 'center',
    marginRight: 15,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepLine: {
    width: 2,
    height: 20,
    marginTop: 5,
  },
  stepLabel: {
    fontSize: 14,
    flex: 1,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  productQuantity: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  totalSection: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 2,
    borderTopColor: '#ecf0f1',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: '#34495e',
  },
  totalValue: {
    fontSize: 16,
    color: '#34495e',
  },
  finalTotal: {
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    paddingTop: 10,
    marginTop: 10,
  },
  finalTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  finalTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  deliveryText: {
    fontSize: 14,
    color: '#34495e',
    marginLeft: 10,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    padding: 15,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 8,
  },
  buttonLabel: {
    fontSize: 16,
    paddingVertical: 5,
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
});

export default OrderDetailScreen;


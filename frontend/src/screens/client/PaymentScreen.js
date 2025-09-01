import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { useCart } from '../../contexts/CartContext';
import { orderService, paymentService } from '../../services/api';

const PaymentScreen = ({ route, navigation }) => {
  const theme = useTheme();
  const { clearCart } = useCart();
  const { orderData } = route.params;
  const [orderId, setOrderId] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    createOrder();
  }, []);

  const createOrder = async () => {
    try {
      setLoading(true);
      
      // Crear el pedido
      const orderResponse = await orderService.createOrder({
        subtotal: orderData.total,
        impuestos: 0,
        total: orderData.total,
        direccion_entrega: orderData.deliveryAddress,
        telefono_contacto: orderData.contactPhone,
        observaciones: orderData.observations,
        items: orderData.items.map(item => ({
          producto_id: item.id,
          cantidad: item.quantity,
          precio_unitario: item.precio_venta,
          subtotal: item.precio_venta * item.quantity,
        })),
      });

      setOrderId(orderResponse.pedido_id);

      // Si el método de pago es QR, generar código QR
      if (orderData.paymentMethod === 'qr') {
        const paymentResponse = await paymentService.createPayment({
          pedido_id: orderResponse.pedido_id,
          metodo_pago: 'qr',
          monto: orderData.total,
        });
        setQrCode(paymentResponse.qr_code);
      }

    } catch (error) {
      console.error('Error creating order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentConfirmation = async () => {
    try {
      setLoading(true);
      
      if (orderData.paymentMethod !== 'qr') {
        // Para otros métodos de pago, crear el pago
        await paymentService.createPayment({
          pedido_id: orderId,
          metodo_pago: orderData.paymentMethod,
          monto: orderData.total,
        });
      }

      setPaymentStatus('completed');
      clearCart();
      
      // Navegar a la confirmación después de un breve delay
      setTimeout(() => {
        navigation.navigate('OrderConfirmation', { orderId });
      }, 2000);

    } catch (error) {
      console.error('Error processing payment:', error);
      setPaymentStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMethodInfo = () => {
    const methods = {
      efectivo: {
        title: 'Pago en Efectivo',
        icon: 'cash',
        description: 'Paga en efectivo al momento de la entrega',
        instructions: 'Ten el monto exacto listo para el repartidor.',
      },
      tarjeta: {
        title: 'Pago con Tarjeta',
        icon: 'credit-card',
        description: 'Pago seguro con tarjeta de crédito o débito',
        instructions: 'El repartidor llevará un terminal de pago.',
      },
      qr: {
        title: 'Pago con Código QR',
        icon: 'qrcode',
        description: 'Escanea el código QR para pagar',
        instructions: 'Usa tu app bancaria para escanear el código.',
      },
      transferencia: {
        title: 'Transferencia Bancaria',
        icon: 'bank-transfer',
        description: 'Realiza una transferencia bancaria',
        instructions: 'Transfiere a la cuenta que se muestra abajo.',
      },
    };
    return methods[orderData.paymentMethod] || methods.efectivo;
  };

  const paymentInfo = getPaymentMethodInfo();

  if (paymentStatus === 'completed') {
    return (
      <View style={styles.statusContainer}>
        <MaterialCommunityIcons name="check-circle" size={100} color="#27ae60" />
        <Text style={styles.statusTitle}>¡Pago Exitoso!</Text>
        <Text style={styles.statusSubtitle}>Tu pedido ha sido confirmado</Text>
      </View>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <View style={styles.statusContainer}>
        <MaterialCommunityIcons name="alert-circle" size={100} color="#e74c3c" />
        <Text style={styles.statusTitle}>Error en el Pago</Text>
        <Text style={styles.statusSubtitle}>Inténtalo nuevamente</Text>
        <Button
          mode="contained"
          onPress={() => setPaymentStatus('pending')}
          style={[styles.retryButton, { backgroundColor: theme.colors.tertiary }]}
        >
          Reintentar
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Información del pedido */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Resumen del Pedido</Text>
          <View style={styles.orderInfo}>
            <Text style={styles.orderLabel}>Número de Pedido:</Text>
            <Text style={styles.orderValue}>#{orderId || 'Generando...'}</Text>
          </View>
          <View style={styles.orderInfo}>
            <Text style={styles.orderLabel}>Total a Pagar:</Text>
            <Text style={styles.orderTotal}>${orderData.total.toFixed(2)}</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Método de pago */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.paymentHeader}>
            <MaterialCommunityIcons 
              name={paymentInfo.icon} 
              size={30} 
              color={theme.colors.primary} 
            />
            <Text style={styles.paymentTitle}>{paymentInfo.title}</Text>
          </View>
          <Text style={styles.paymentDescription}>{paymentInfo.description}</Text>
          
          {/* Código QR para pagos QR */}
          {orderData.paymentMethod === 'qr' && qrCode && (
            <View style={styles.qrContainer}>
              <QRCode
                value={qrCode}
                size={200}
                backgroundColor="white"
                color="black"
              />
              <Text style={styles.qrCode}>Código: {qrCode}</Text>
            </View>
          )}

          {/* Información bancaria para transferencias */}
          {orderData.paymentMethod === 'transferencia' && (
            <View style={styles.bankInfo}>
              <Text style={styles.bankTitle}>Datos Bancarios:</Text>
              <Text style={styles.bankDetail}>Banco: Banco Nacional</Text>
              <Text style={styles.bankDetail}>Cuenta: 1234-5678-9012-3456</Text>
              <Text style={styles.bankDetail}>Titular: Sistema Inventario S.A.</Text>
              <Text style={styles.bankDetail}>Monto: ${orderData.total.toFixed(2)}</Text>
            </View>
          )}

          <Text style={styles.instructions}>{paymentInfo.instructions}</Text>
        </Card.Content>
      </Card>

      {/* Información de entrega */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Información de Entrega</Text>
          <View style={styles.deliveryInfo}>
            <MaterialCommunityIcons name="map-marker" size={20} color={theme.colors.primary} />
            <Text style={styles.deliveryText}>{orderData.deliveryAddress}</Text>
          </View>
          <View style={styles.deliveryInfo}>
            <MaterialCommunityIcons name="phone" size={20} color={theme.colors.primary} />
            <Text style={styles.deliveryText}>{orderData.contactPhone}</Text>
          </View>
          <View style={styles.deliveryInfo}>
            <MaterialCommunityIcons name="clock" size={20} color={theme.colors.primary} />
            <Text style={styles.deliveryText}>Tiempo estimado: 30-45 minutos</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Botones de acción */}
      <View style={styles.actions}>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          labelStyle={styles.buttonLabel}
          icon="arrow-left"
        >
          Volver
        </Button>
        <Button
          mode="contained"
          onPress={handlePaymentConfirmation}
          loading={loading}
          disabled={loading}
          style={[styles.confirmButton, { backgroundColor: theme.colors.tertiary }]}
          labelStyle={styles.buttonLabel}
          icon="check"
        >
          {loading ? 'Procesando...' : 'Confirmar Pago'}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  orderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  orderLabel: {
    fontSize: 16,
    color: '#34495e',
  },
  orderValue: {
    fontSize: 16,
    color: '#34495e',
    fontWeight: 'bold',
  },
  orderTotal: {
    fontSize: 18,
    color: '#27ae60',
    fontWeight: 'bold',
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  paymentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginLeft: 10,
  },
  paymentDescription: {
    fontSize: 16,
    color: '#34495e',
    marginBottom: 20,
  },
  qrContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  qrCode: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 10,
    textAlign: 'center',
  },
  bankInfo: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginVertical: 15,
  },
  bankTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  bankDetail: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 5,
  },
  instructions: {
    fontSize: 14,
    color: '#7f8c8d',
    fontStyle: 'italic',
    textAlign: 'center',
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
  backButton: {
    flex: 1,
    marginRight: 10,
    borderRadius: 8,
  },
  confirmButton: {
    flex: 1,
    marginLeft: 10,
    borderRadius: 8,
  },
  buttonLabel: {
    fontSize: 16,
    paddingVertical: 5,
  },
  statusContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#f8f9fa',
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 20,
    marginBottom: 10,
  },
  statusSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 30,
  },
  retryButton: {
    borderRadius: 8,
  },
});

export default PaymentScreen;


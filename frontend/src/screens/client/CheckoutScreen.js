import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, TextInput, Button, RadioButton, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

const CheckoutScreen = ({ navigation }) => {
  const theme = useTheme();
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const [deliveryAddress, setDeliveryAddress] = useState(user?.direccion || '');
  const [contactPhone, setContactPhone] = useState(user?.telefono || '');
  const [observations, setObservations] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [loading, setLoading] = useState(false);

  const paymentMethods = [
    { value: 'efectivo', label: 'Efectivo', icon: 'cash' },
    { value: 'tarjeta', label: 'Tarjeta de Crédito/Débito', icon: 'credit-card' },
    { value: 'qr', label: 'Código QR', icon: 'qrcode' },
    { value: 'transferencia', label: 'Transferencia Bancaria', icon: 'bank-transfer' },
  ];

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      // Simular procesamiento del pedido
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navegar a la pantalla de pago
      navigation.navigate('Payment', {
        orderData: {
          items,
          total,
          deliveryAddress,
          contactPhone,
          observations,
          paymentMethod,
        }
      });
    } catch (error) {
      console.error('Error placing order:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Resumen del pedido */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Resumen del Pedido</Text>
          {items.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              <Text style={styles.itemName}>{item.nombre}</Text>
              <Text style={styles.itemQuantity}>x{item.quantity}</Text>
              <Text style={styles.itemPrice}>${(item.precio_venta * item.quantity).toFixed(2)}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Información de entrega */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Información de Entrega</Text>
          <TextInput
            label="Dirección de Entrega"
            value={deliveryAddress}
            onChangeText={setDeliveryAddress}
            mode="outlined"
            style={styles.input}
            multiline
            numberOfLines={3}
            left={<TextInput.Icon icon="map-marker" />}
          />
          <TextInput
            label="Teléfono de Contacto"
            value={contactPhone}
            onChangeText={setContactPhone}
            mode="outlined"
            style={styles.input}
            keyboardType="phone-pad"
            left={<TextInput.Icon icon="phone" />}
          />
          <TextInput
            label="Observaciones (Opcional)"
            value={observations}
            onChangeText={setObservations}
            mode="outlined"
            style={styles.input}
            multiline
            numberOfLines={2}
            placeholder="Instrucciones especiales para la entrega..."
            left={<TextInput.Icon icon="note-text" />}
          />
        </Card.Content>
      </Card>

      {/* Método de pago */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Método de Pago</Text>
          <RadioButton.Group onValueChange={setPaymentMethod} value={paymentMethod}>
            {paymentMethods.map((method) => (
              <View key={method.value} style={styles.paymentMethod}>
                <View style={styles.paymentMethodContent}>
                  <MaterialCommunityIcons 
                    name={method.icon} 
                    size={24} 
                    color={theme.colors.primary} 
                    style={styles.paymentIcon}
                  />
                  <Text style={styles.paymentLabel}>{method.label}</Text>
                </View>
                <RadioButton value={method.value} />
              </View>
            ))}
          </RadioButton.Group>
        </Card.Content>
      </Card>

      {/* Información adicional */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Información Importante</Text>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="truck-delivery" size={20} color={theme.colors.primary} />
            <Text style={styles.infoText}>Tiempo de entrega: 30-45 minutos</Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="cash" size={20} color={theme.colors.primary} />
            <Text style={styles.infoText}>Envío gratis en compras mayores a $100</Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="shield-check" size={20} color={theme.colors.primary} />
            <Text style={styles.infoText}>Compra 100% segura y protegida</Text>
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
          Volver al Carrito
        </Button>
        <Button
          mode="contained"
          onPress={handlePlaceOrder}
          loading={loading}
          disabled={loading || !deliveryAddress || !contactPhone}
          style={[styles.placeOrderButton, { backgroundColor: theme.colors.tertiary }]}
          labelStyle={styles.buttonLabel}
          icon="credit-card"
        >
          {loading ? 'Procesando...' : 'Realizar Pedido'}
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
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    color: '#34495e',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#7f8c8d',
    marginHorizontal: 10,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 15,
    marginTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#ecf0f1',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  input: {
    marginBottom: 15,
  },
  paymentMethod: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentIcon: {
    marginRight: 15,
  },
  paymentLabel: {
    fontSize: 16,
    color: '#34495e',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
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
  placeOrderButton: {
    flex: 1,
    marginLeft: 10,
    borderRadius: 8,
  },
  buttonLabel: {
    fontSize: 16,
    paddingVertical: 5,
  },
});

export default CheckoutScreen;


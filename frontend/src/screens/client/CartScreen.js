import React from 'react';
import { View, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { Text, Card, Button, IconButton, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCart } from '../../contexts/CartContext';

const CartScreen = ({ navigation }) => {
  const theme = useTheme();
  const { items, total, itemCount, updateQuantity, removeFromCart, clearCart } = useCart();

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = () => {
    if (items.length > 0) {
      navigation.navigate('Checkout');
    }
  };

  const renderCartItem = ({ item }) => (
    <Card style={styles.cartItem}>
      <View style={styles.itemContent}>
        <Image 
          source={{ uri: item.imagen_url || 'https://via.placeholder.com/80' }}
          style={styles.itemImage}
        />
        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={2}>{item.nombre}</Text>
          <Text style={styles.itemCode}>Código: {item.codigo}</Text>
          <Text style={styles.itemPrice}>${item.precio_venta}</Text>
        </View>
        <View style={styles.itemActions}>
          <View style={styles.quantityControls}>
            <IconButton
              icon="minus"
              size={20}
              onPress={() => handleQuantityChange(item.id, item.quantity - 1)}
              style={styles.quantityButton}
            />
            <Text style={styles.quantityText}>{item.quantity}</Text>
            <IconButton
              icon="plus"
              size={20}
              onPress={() => handleQuantityChange(item.id, item.quantity + 1)}
              style={styles.quantityButton}
            />
          </View>
          <Text style={styles.itemTotal}>
            ${(item.precio_venta * item.quantity).toFixed(2)}
          </Text>
          <IconButton
            icon="delete"
            size={20}
            iconColor="#e74c3c"
            onPress={() => removeFromCart(item.id)}
            style={styles.deleteButton}
          />
        </View>
      </View>
    </Card>
  );

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="cart-outline" size={100} color="#bdc3c7" />
        <Text style={styles.emptyTitle}>Tu carrito está vacío</Text>
        <Text style={styles.emptySubtitle}>Agrega productos para comenzar tu compra</Text>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Catalog')}
          style={[styles.shopButton, { backgroundColor: theme.colors.tertiary }]}
          labelStyle={styles.buttonLabel}
          icon="shopping"
        >
          Ir de Compras
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header del carrito */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi Carrito</Text>
        <Text style={styles.itemCount}>{itemCount} artículo{itemCount !== 1 ? 's' : ''}</Text>
        <TouchableOpacity onPress={clearCart} style={styles.clearButton}>
          <Text style={styles.clearButtonText}>Limpiar</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de productos */}
      <FlatList
        data={items}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.cartList}
        showsVerticalScrollIndicator={false}
      />

      {/* Resumen del pedido */}
      <Card style={styles.summaryCard}>
        <Card.Content>
          <Text style={styles.summaryTitle}>Resumen del Pedido</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal:</Text>
            <Text style={styles.summaryValue}>${total.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Envío:</Text>
            <Text style={styles.summaryValue}>Gratis</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Botones de acción */}
      <View style={styles.actions}>
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('Catalog')}
          style={styles.continueButton}
          labelStyle={styles.buttonLabel}
          icon="shopping"
        >
          Seguir Comprando
        </Button>
        <Button
          mode="contained"
          onPress={handleCheckout}
          style={[styles.checkoutButton, { backgroundColor: theme.colors.tertiary }]}
          labelStyle={styles.buttonLabel}
          icon="credit-card"
        >
          Proceder al Pago
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  itemCount: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  clearButton: {
    padding: 5,
  },
  clearButtonText: {
    color: '#e74c3c',
    fontSize: 14,
  },
  cartList: {
    padding: 15,
  },
  cartItem: {
    marginBottom: 10,
    elevation: 2,
  },
  itemContent: {
    flexDirection: 'row',
    padding: 15,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  itemCode: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  itemPrice: {
    fontSize: 14,
    color: '#27ae60',
    fontWeight: 'bold',
  },
  itemActions: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    marginBottom: 5,
  },
  quantityButton: {
    margin: 0,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    minWidth: 30,
    textAlign: 'center',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 5,
  },
  deleteButton: {
    margin: 0,
  },
  summaryCard: {
    margin: 15,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#34495e',
  },
  summaryValue: {
    fontSize: 16,
    color: '#34495e',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    paddingTop: 10,
    marginTop: 10,
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
  actions: {
    flexDirection: 'row',
    padding: 15,
    paddingTop: 0,
  },
  continueButton: {
    flex: 1,
    marginRight: 10,
    borderRadius: 8,
  },
  checkoutButton: {
    flex: 1,
    marginLeft: 10,
    borderRadius: 8,
  },
  buttonLabel: {
    fontSize: 16,
    paddingVertical: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
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
    marginBottom: 30,
  },
  shopButton: {
    borderRadius: 8,
  },
});

export default CartScreen;


import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Text, Button, Card, Chip, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCart } from '../../contexts/CartContext';

const ProductDetailScreen = ({ route, navigation }) => {
  const theme = useTheme();
  const { product } = route.params;
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    navigation.goBack();
  };

  const incrementQuantity = () => {
    if (quantity < product.stock_total) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const getStockStatus = () => {
    if (product.stock_total <= 0) {
      return { text: 'Agotado', color: '#e74c3c' };
    } else if (product.stock_total <= product.stock_minimo) {
      return { text: 'Pocas unidades', color: '#f39c12' };
    } else {
      return { text: 'Disponible', color: '#27ae60' };
    }
  };

  const stockStatus = getStockStatus();

  return (
    <ScrollView style={styles.container}>
      {/* Imagen del producto */}
      <Image 
        source={{ uri: product.imagen_url || 'https://via.placeholder.com/300' }}
        style={styles.productImage}
      />

      {/* Información del producto */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.productName}>{product.nombre}</Text>
          <Chip 
            icon="package-variant"
            textStyle={{ color: stockStatus.color }}
            style={[styles.stockChip, { borderColor: stockStatus.color }]}
            mode="outlined"
          >
            {stockStatus.text}
          </Chip>
        </View>

        <Text style={styles.productCode}>Código: {product.codigo}</Text>
        <Text style={styles.productPrice}>${product.precio_venta}</Text>

        {/* Descripción */}
        <Card style={styles.descriptionCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Descripción</Text>
            <Text style={styles.productDescription}>
              {product.descripcion || 'Sin descripción disponible'}
            </Text>
          </Card.Content>
        </Card>

        {/* Información adicional */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Información del Producto</Text>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="tag" size={20} color={theme.colors.primary} />
              <Text style={styles.infoText}>Categoría: {product.categoria_nombre || 'Sin categoría'}</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="cube-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.infoText}>Unidad: {product.unidad_medida}</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="package-variant" size={20} color={theme.colors.primary} />
              <Text style={styles.infoText}>Stock disponible: {product.stock_total} unidades</Text>
            </View>
          </Card.Content>
        </Card>

        {/* Selector de cantidad */}
        {product.stock_total > 0 && (
          <Card style={styles.quantityCard}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Cantidad</Text>
              <View style={styles.quantitySelector}>
                <Button
                  mode="outlined"
                  onPress={decrementQuantity}
                  disabled={quantity <= 1}
                  style={styles.quantityButton}
                >
                  <MaterialCommunityIcons name="minus" size={20} />
                </Button>
                <Text style={styles.quantityText}>{quantity}</Text>
                <Button
                  mode="outlined"
                  onPress={incrementQuantity}
                  disabled={quantity >= product.stock_total}
                  style={styles.quantityButton}
                >
                  <MaterialCommunityIcons name="plus" size={20} />
                </Button>
              </View>
              <Text style={styles.totalPrice}>
                Total: ${(product.precio_venta * quantity).toFixed(2)}
              </Text>
            </Card.Content>
          </Card>
        )}
      </View>

      {/* Botones de acción */}
      <View style={styles.actions}>
        {product.stock_total > 0 ? (
          <Button
            mode="contained"
            onPress={handleAddToCart}
            style={[styles.addToCartButton, { backgroundColor: theme.colors.tertiary }]}
            labelStyle={styles.buttonLabel}
            icon="cart-plus"
          >
            Agregar al Carrito
          </Button>
        ) : (
          <Button
            mode="outlined"
            disabled
            style={styles.outOfStockButton}
            labelStyle={styles.buttonLabel}
          >
            Producto Agotado
          </Button>
        )}
        
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('CartMain')}
          style={styles.viewCartButton}
          labelStyle={styles.buttonLabel}
          icon="cart"
        >
          Ver Carrito
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
  productImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
    marginRight: 10,
  },
  stockChip: {
    backgroundColor: 'transparent',
  },
  productCode: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 20,
  },
  descriptionCard: {
    marginBottom: 15,
    elevation: 2,
  },
  infoCard: {
    marginBottom: 15,
    elevation: 2,
  },
  quantityCard: {
    marginBottom: 15,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  productDescription: {
    fontSize: 16,
    color: '#34495e',
    lineHeight: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 16,
    color: '#34495e',
    marginLeft: 10,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  quantityButton: {
    width: 50,
    height: 50,
  },
  quantityText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginHorizontal: 20,
    minWidth: 40,
    textAlign: 'center',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#27ae60',
    textAlign: 'center',
  },
  actions: {
    padding: 20,
    paddingTop: 0,
  },
  addToCartButton: {
    marginBottom: 10,
    borderRadius: 8,
  },
  viewCartButton: {
    borderRadius: 8,
  },
  outOfStockButton: {
    marginBottom: 10,
    borderRadius: 8,
  },
  buttonLabel: {
    fontSize: 16,
    paddingVertical: 5,
  },
});

export default ProductDetailScreen;


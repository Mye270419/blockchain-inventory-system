import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Card, Searchbar, Chip, FAB, useTheme, Modal, Portal, TextInput, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { inventoryService, productService, transactionService } from '../../services/api';

const InventoryScreen = ({ navigation }) => {
  const theme = useTheme();
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, low_stock, out_of_stock
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustmentQuantity, setAdjustmentQuantity] = useState('');
  const [adjustmentType, setAdjustmentType] = useState('entrada');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getProducts();
      setProducts(response.products);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredProducts = () => {
    let filtered = products.filter(product =>
      product.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.codigo.toLowerCase().includes(searchQuery.toLowerCase())
    );

    switch (filterType) {
      case 'low_stock':
        filtered = filtered.filter(product => 
          product.stock_total <= product.stock_minimo && product.stock_minimo > 0
        );
        break;
      case 'out_of_stock':
        filtered = filtered.filter(product => product.stock_total <= 0);
        break;
      default:
        break;
    }

    return filtered;
  };

  const getStockStatus = (product) => {
    if (product.stock_total <= 0) {
      return { text: 'Agotado', color: '#e74c3c', icon: 'alert-circle' };
    } else if (product.stock_total <= product.stock_minimo && product.stock_minimo > 0) {
      return { text: 'Stock Bajo', color: '#f39c12', icon: 'alert' };
    } else {
      return { text: 'Normal', color: '#27ae60', icon: 'check-circle' };
    }
  };

  const handleAdjustStock = (product) => {
    setSelectedProduct(product);
    setAdjustmentQuantity('');
    setModalVisible(true);
  };

  const submitAdjustment = async () => {
    try {
      if (!adjustmentQuantity || isNaN(adjustmentQuantity)) {
        return;
      }

      const transactionTypeId = adjustmentType === 'entrada' ? 3 : 4; // Ajuste Positivo/Negativo
      
      await transactionService.createTransaction({
        producto_id: selectedProduct.id,
        ubicacion_id: 1, // Almacén principal
        tipo_transaccion_id: transactionTypeId,
        cantidad: parseInt(adjustmentQuantity),
        precio_unitario: selectedProduct.precio_unitario,
        observaciones: `Ajuste de inventario - ${adjustmentType}`,
      });

      setModalVisible(false);
      loadProducts(); // Recargar productos
    } catch (error) {
      console.error('Error adjusting stock:', error);
    }
  };

  const renderProduct = ({ item }) => {
    const stockStatus = getStockStatus(item);
    
    return (
      <Card style={styles.productCard}>
        <Card.Content>
          <View style={styles.productHeader}>
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{item.nombre}</Text>
              <Text style={styles.productCode}>Código: {item.codigo}</Text>
              <Text style={styles.productCategory}>{item.categoria_nombre}</Text>
            </View>
            <Chip
              icon={stockStatus.icon}
              textStyle={{ color: stockStatus.color }}
              style={[styles.statusChip, { borderColor: stockStatus.color }]}
              mode="outlined"
            >
              {stockStatus.text}
            </Chip>
          </View>

          <View style={styles.stockInfo}>
            <View style={styles.stockItem}>
              <MaterialCommunityIcons name="package-variant" size={20} color={theme.colors.primary} />
              <Text style={styles.stockLabel}>Stock Actual:</Text>
              <Text style={styles.stockValue}>{item.stock_total}</Text>
            </View>
            <View style={styles.stockItem}>
              <MaterialCommunityIcons name="alert-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.stockLabel}>Stock Mínimo:</Text>
              <Text style={styles.stockValue}>{item.stock_minimo}</Text>
            </View>
            <View style={styles.stockItem}>
              <MaterialCommunityIcons name="currency-usd" size={20} color={theme.colors.primary} />
              <Text style={styles.stockLabel}>Precio:</Text>
              <Text style={styles.stockValue}>${item.precio_unitario}</Text>
            </View>
          </View>

          <View style={styles.productActions}>
            <Button
              mode="outlined"
              onPress={() => handleAdjustStock(item)}
              style={styles.actionButton}
              icon="pencil"
            >
              Ajustar Stock
            </Button>
            <Button
              mode="text"
              onPress={() => {/* Ver historial */}}
              textColor={theme.colors.primary}
              icon="history"
            >
              Historial
            </Button>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const filteredProducts = getFilteredProducts();

  return (
    <View style={styles.container}>
      {/* Barra de búsqueda */}
      <Searchbar
        placeholder="Buscar productos..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      {/* Filtros */}
      <View style={styles.filtersContainer}>
        <Chip
          selected={filterType === 'all'}
          onPress={() => setFilterType('all')}
          style={styles.filterChip}
        >
          Todos ({products.length})
        </Chip>
        <Chip
          selected={filterType === 'low_stock'}
          onPress={() => setFilterType('low_stock')}
          style={styles.filterChip}
        >
          Stock Bajo
        </Chip>
        <Chip
          selected={filterType === 'out_of_stock'}
          onPress={() => setFilterType('out_of_stock')}
          style={styles.filterChip}
        >
          Agotados
        </Chip>
      </View>

      {/* Lista de productos */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.productsList}
        refreshing={loading}
        onRefresh={loadProducts}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="package-variant-closed" size={64} color="#bdc3c7" />
            <Text style={styles.emptyText}>No se encontraron productos</Text>
          </View>
        }
      />

      {/* FAB para agregar producto */}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.tertiary }]}
        onPress={() => navigation.navigate('Products')}
      />

      {/* Modal de ajuste de stock */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Card>
            <Card.Content>
              <Text style={styles.modalTitle}>Ajustar Stock</Text>
              <Text style={styles.modalSubtitle}>
                {selectedProduct?.nombre} (Stock actual: {selectedProduct?.stock_total})
              </Text>

              <View style={styles.adjustmentTypeContainer}>
                <Chip
                  selected={adjustmentType === 'entrada'}
                  onPress={() => setAdjustmentType('entrada')}
                  style={styles.typeChip}
                >
                  Aumentar
                </Chip>
                <Chip
                  selected={adjustmentType === 'salida'}
                  onPress={() => setAdjustmentType('salida')}
                  style={styles.typeChip}
                >
                  Disminuir
                </Chip>
              </View>

              <TextInput
                label="Cantidad"
                value={adjustmentQuantity}
                onChangeText={setAdjustmentQuantity}
                mode="outlined"
                keyboardType="numeric"
                style={styles.quantityInput}
              />

              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={() => setModalVisible(false)}
                  style={styles.modalButton}
                >
                  Cancelar
                </Button>
                <Button
                  mode="contained"
                  onPress={submitAdjustment}
                  style={[styles.modalButton, { backgroundColor: theme.colors.tertiary }]}
                  disabled={!adjustmentQuantity}
                >
                  Confirmar
                </Button>
              </View>
            </Card.Content>
          </Card>
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
  searchBar: {
    margin: 15,
    elevation: 2,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  filterChip: {
    marginRight: 10,
  },
  productsList: {
    padding: 15,
  },
  productCard: {
    marginBottom: 15,
    elevation: 2,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  productInfo: {
    flex: 1,
    marginRight: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  productCode: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 3,
  },
  productCategory: {
    fontSize: 12,
    color: '#95a5a6',
  },
  statusChip: {
    backgroundColor: 'transparent',
  },
  stockInfo: {
    marginBottom: 15,
  },
  stockItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stockLabel: {
    fontSize: 14,
    color: '#34495e',
    marginLeft: 8,
    flex: 1,
  },
  stockValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  productActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    flex: 1,
    marginRight: 10,
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 20,
  },
  adjustmentTypeContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  typeChip: {
    marginRight: 10,
  },
  quantityInput: {
    marginBottom: 20,
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

export default InventoryScreen;


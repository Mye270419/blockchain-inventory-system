import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { Text, Card, Searchbar, Chip, FAB, useTheme, Modal, Portal, TextInput, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { productService, categoryService } from '../../services/api';

const ProductsScreen = ({ navigation }) => {
  const theme = useTheme();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    categoria_id: '',
    precio_unitario: '',
    precio_venta: '',
    stock_minimo: '',
    imagen_url: '',
    disponible_venta: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsResponse, categoriesResponse] = await Promise.all([
        productService.getProducts(),
        categoryService.getCategories(),
      ]);
      setProducts(productsResponse.products);
      setCategories(categoriesResponse.categories);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredProducts = () => {
    let filtered = products.filter(product =>
      product.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.descripcion.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (selectedCategory) {
      filtered = filtered.filter(product => product.categoria_id === selectedCategory);
    }

    return filtered;
  };

  const handleCreateProduct = async () => {
    try {
      if (!newProduct.codigo || !newProduct.nombre || !newProduct.precio_unitario) {
        return;
      }

      if (editingProduct) {
        // Actualizar producto existente
        await productService.updateProduct(editingProduct.id, newProduct);
      } else {
        // Crear nuevo producto
        await productService.createProduct(newProduct);
      }

      setModalVisible(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setNewProduct({
      codigo: product.codigo,
      nombre: product.nombre,
      descripcion: product.descripcion || '',
      categoria_id: product.categoria_id?.toString() || '',
      precio_unitario: product.precio_unitario?.toString() || '',
      precio_venta: product.precio_venta?.toString() || '',
      stock_minimo: product.stock_minimo?.toString() || '',
      imagen_url: product.imagen_url || '',
      disponible_venta: product.disponible_venta,
    });
    setModalVisible(true);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setNewProduct({
      codigo: '',
      nombre: '',
      descripcion: '',
      categoria_id: '',
      precio_unitario: '',
      precio_venta: '',
      stock_minimo: '',
      imagen_url: '',
      disponible_venta: true,
    });
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

  const renderProduct = ({ item }) => {
    const stockStatus = getStockStatus(item);
    const category = categories.find(c => c.id === item.categoria_id);
    
    return (
      <Card style={styles.productCard}>
        <Card.Content>
          <View style={styles.productHeader}>
            <Image 
              source={{ uri: item.imagen_url || 'https://via.placeholder.com/60' }}
              style={styles.productImage}
            />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{item.nombre}</Text>
              <Text style={styles.productCode}>Código: {item.codigo}</Text>
              <Text style={styles.productCategory}>{category?.nombre || 'Sin categoría'}</Text>
            </View>
            <View style={styles.productStatus}>
              <Chip
                icon={stockStatus.icon}
                textStyle={{ color: stockStatus.color }}
                style={[styles.statusChip, { borderColor: stockStatus.color }]}
                mode="outlined"
              >
                {stockStatus.text}
              </Chip>
              {!item.disponible_venta && (
                <Chip
                  icon="eye-off"
                  textStyle={{ color: '#95a5a6' }}
                  style={[styles.statusChip, { borderColor: '#95a5a6', marginTop: 5 }]}
                  mode="outlined"
                >
                  No visible
                </Chip>
              )}
            </View>
          </View>

          <View style={styles.productDetails}>
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="currency-usd" size={16} color={theme.colors.primary} />
              <Text style={styles.detailLabel}>Precio Costo:</Text>
              <Text style={styles.detailValue}>${item.precio_unitario}</Text>
            </View>
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="tag" size={16} color={theme.colors.primary} />
              <Text style={styles.detailLabel}>Precio Venta:</Text>
              <Text style={styles.detailValue}>${item.precio_venta}</Text>
            </View>
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="package-variant" size={16} color={theme.colors.primary} />
              <Text style={styles.detailLabel}>Stock:</Text>
              <Text style={styles.detailValue}>{item.stock_total} / {item.stock_minimo} mín.</Text>
            </View>
          </View>

          {item.descripcion && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.description} numberOfLines={2}>{item.descripcion}</Text>
            </View>
          )}

          <View style={styles.productActions}>
            <Button
              mode="outlined"
              onPress={() => handleEditProduct(item)}
              style={styles.actionButton}
              icon="pencil"
            >
              Editar
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

      {/* Filtros de categorías */}
      <View style={styles.filtersContainer}>
        <FlatList
          data={[{ id: null, nombre: 'Todas' }, ...categories]}
          renderItem={({ item }) => (
            <Chip
              selected={selectedCategory === item.id}
              onPress={() => setSelectedCategory(selectedCategory === item.id ? null : item.id)}
              style={styles.filterChip}
            >
              {item.nombre}
            </Chip>
          )}
          keyExtractor={(item) => item.id?.toString() || 'all'}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        />
      </View>

      {/* Lista de productos */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.productsList}
        refreshing={loading}
        onRefresh={loadData}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="cube-outline" size={64} color="#bdc3c7" />
            <Text style={styles.emptyText}>No se encontraron productos</Text>
          </View>
        }
      />

      {/* FAB para nuevo producto */}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.tertiary }]}
        onPress={() => {
          resetForm();
          setModalVisible(true);
        }}
      />

      {/* Modal de producto */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Card>
            <Card.Content>
              <Text style={styles.modalTitle}>
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </Text>

              <TextInput
                label="Código del Producto"
                value={newProduct.codigo}
                onChangeText={(text) => setNewProduct({ ...newProduct, codigo: text })}
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="barcode" />}
              />

              <TextInput
                label="Nombre del Producto"
                value={newProduct.nombre}
                onChangeText={(text) => setNewProduct({ ...newProduct, nombre: text })}
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="cube-outline" />}
              />

              <TextInput
                label="Descripción"
                value={newProduct.descripcion}
                onChangeText={(text) => setNewProduct({ ...newProduct, descripcion: text })}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={styles.input}
                left={<TextInput.Icon icon="text" />}
              />

              {/* Selector de categoría */}
              <View style={styles.categoryContainer}>
                <Text style={styles.inputLabel}>Categoría</Text>
                <View style={styles.categoriesGrid}>
                  {categories.map((category) => (
                    <Chip
                      key={category.id}
                      selected={newProduct.categoria_id === category.id.toString()}
                      onPress={() => setNewProduct({
                        ...newProduct,
                        categoria_id: category.id.toString()
                      })}
                      style={styles.categoryChip}
                    >
                      {category.nombre}
                    </Chip>
                  ))}
                </View>
              </View>

              <View style={styles.priceRow}>
                <TextInput
                  label="Precio Costo"
                  value={newProduct.precio_unitario}
                  onChangeText={(text) => setNewProduct({ ...newProduct, precio_unitario: text })}
                  mode="outlined"
                  keyboardType="numeric"
                  style={[styles.input, styles.halfInput]}
                  left={<TextInput.Icon icon="currency-usd" />}
                />
                <TextInput
                  label="Precio Venta"
                  value={newProduct.precio_venta}
                  onChangeText={(text) => setNewProduct({ ...newProduct, precio_venta: text })}
                  mode="outlined"
                  keyboardType="numeric"
                  style={[styles.input, styles.halfInput]}
                  left={<TextInput.Icon icon="tag" />}
                />
              </View>

              <TextInput
                label="Stock Mínimo"
                value={newProduct.stock_minimo}
                onChangeText={(text) => setNewProduct({ ...newProduct, stock_minimo: text })}
                mode="outlined"
                keyboardType="numeric"
                style={styles.input}
                left={<TextInput.Icon icon="alert-outline" />}
              />

              <TextInput
                label="URL de Imagen (Opcional)"
                value={newProduct.imagen_url}
                onChangeText={(text) => setNewProduct({ ...newProduct, imagen_url: text })}
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="image" />}
              />

              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Disponible para venta</Text>
                <Button
                  mode={newProduct.disponible_venta ? "contained" : "outlined"}
                  onPress={() => setNewProduct({
                    ...newProduct,
                    disponible_venta: !newProduct.disponible_venta
                  })}
                  style={styles.switchButton}
                >
                  {newProduct.disponible_venta ? "Sí" : "No"}
                </Button>
              </View>

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
                  onPress={handleCreateProduct}
                  style={[styles.modalButton, { backgroundColor: theme.colors.tertiary }]}
                  disabled={!newProduct.codigo || !newProduct.nombre || !newProduct.precio_unitario}
                >
                  {editingProduct ? 'Actualizar' : 'Crear'}
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
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  filtersContent: {
    paddingVertical: 5,
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
    marginBottom: 15,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
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
  productCode: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 3,
  },
  productCategory: {
    fontSize: 12,
    color: '#95a5a6',
  },
  productStatus: {
    alignItems: 'flex-end',
  },
  statusChip: {
    backgroundColor: 'transparent',
  },
  productDetails: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  detailLabel: {
    fontSize: 14,
    color: '#34495e',
    marginLeft: 8,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  descriptionContainer: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  description: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
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
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
  },
  input: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  categoryContainer: {
    marginBottom: 15,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryChip: {
    marginRight: 10,
    marginBottom: 10,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  switchLabel: {
    fontSize: 16,
    color: '#2c3e50',
  },
  switchButton: {
    minWidth: 60,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
  },
});

export default ProductsScreen;


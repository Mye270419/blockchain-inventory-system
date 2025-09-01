import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { Text, Card, Searchbar, Chip, FAB, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCart } from '../../contexts/CartContext';
import { productService, categoryService } from '../../services/api';

const ProductCatalogScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState(route.params?.search || '');
  const [selectedCategory, setSelectedCategory] = useState(route.params?.category_id || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [searchQuery, selectedCategory]);

  const loadCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      setCategories(response.categories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const filters = {
        available_only: true,
        search: searchQuery,
        category_id: selectedCategory,
      };
      const response = await productService.getProducts(filters);
      setProducts(response.products);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductPress = (product) => {
    navigation.navigate('ProductDetail', { product });
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    // Mostrar feedback visual (opcional)
  };

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => handleProductPress(item)}
    >
      <Card style={styles.productCardContent}>
        <Image 
          source={{ uri: item.imagen_url || 'https://via.placeholder.com/150' }}
          style={styles.productImage}
        />
        <Card.Content style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>{item.nombre}</Text>
          <Text style={styles.productDescription} numberOfLines={2}>{item.descripcion}</Text>
          <View style={styles.productFooter}>
            <View>
              <Text style={styles.productPrice}>${item.precio_venta}</Text>
              <Text style={styles.productStock}>Stock: {item.stock_total}</Text>
            </View>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: theme.colors.tertiary }]}
              onPress={() => handleAddToCart(item)}
              disabled={item.stock_total <= 0}
            >
              <MaterialCommunityIcons 
                name="plus" 
                size={20} 
                color="#fff" 
              />
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderCategoryChip = ({ item }) => (
    <Chip
      selected={selectedCategory === item.id}
      onPress={() => setSelectedCategory(selectedCategory === item.id ? null : item.id)}
      style={styles.categoryChip}
      textStyle={styles.categoryChipText}
    >
      {item.nombre}
    </Chip>
  );

  return (
    <View style={styles.container}>
      {/* Barra de búsqueda */}
      <Searchbar
        placeholder="Buscar productos..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        iconColor={theme.colors.primary}
      />

      {/* Filtros de categorías */}
      <View style={styles.filtersContainer}>
        <FlatList
          data={categories}
          renderItem={renderCategoryChip}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        />
      </View>

      {/* Lista de productos */}
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.productsContainer}
        refreshing={loading}
        onRefresh={loadProducts}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="package-variant-closed" size={64} color="#bdc3c7" />
            <Text style={styles.emptyText}>No se encontraron productos</Text>
          </View>
        }
      />

      {/* FAB para ir al carrito */}
      <FAB
        icon="cart"
        style={[styles.fab, { backgroundColor: theme.colors.tertiary }]}
        onPress={() => navigation.navigate('CartMain')}
      />
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
  categoriesContainer: {
    paddingVertical: 5,
  },
  categoryChip: {
    marginRight: 10,
  },
  categoryChipText: {
    fontSize: 12,
  },
  productsContainer: {
    padding: 15,
  },
  productCard: {
    flex: 1,
    margin: 5,
    maxWidth: '48%',
  },
  productCardContent: {
    elevation: 2,
  },
  productImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  productInfo: {
    padding: 10,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  productDescription: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 10,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  productStock: {
    fontSize: 10,
    color: '#7f8c8d',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
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
});

export default ProductCatalogScreen;


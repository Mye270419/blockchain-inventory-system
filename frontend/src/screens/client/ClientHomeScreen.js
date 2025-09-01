import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Text, Card, Button, Searchbar, Chip, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { productService, categoryService } from '../../services/api';

const ClientHomeScreen = ({ navigation }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const { itemCount } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [categoriesResponse, productsResponse] = await Promise.all([
        categoryService.getCategories(),
        productService.getProducts({ available_only: true })
      ]);
      
      setCategories(categoriesResponse.categories);
      setFeaturedProducts(productsResponse.products.slice(0, 6)); // Primeros 6 productos
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    navigation.navigate('Catalog', {
      screen: 'ProductCatalogMain',
      params: { search: searchQuery, category: selectedCategory }
    });
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category.id);
    navigation.navigate('Catalog', {
      screen: 'ProductCatalogMain',
      params: { category_id: category.id }
    });
  };

  const handleProductPress = (product) => {
    navigation.navigate('Catalog', {
      screen: 'ProductDetail',
      params: { product }
    });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header con gradiente */}
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <MaterialCommunityIcons name="account-circle" size={40} color="#fff" />
            <View style={styles.userText}>
              <Text style={styles.greeting}>¡Hola, {user?.nombre || user?.username}!</Text>
              <Text style={styles.subtitle}>¿Qué necesitas hoy?</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.cartButton}
            onPress={() => navigation.navigate('Cart')}
          >
            <MaterialCommunityIcons name="cart" size={24} color="#fff" />
            {itemCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{itemCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Barra de búsqueda */}
        <Searchbar
          placeholder="Buscar productos..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          onSubmitEditing={handleSearch}
          style={styles.searchBar}
          iconColor={theme.colors.primary}
        />
      </LinearGradient>

      {/* Categorías */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categorías</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryCard}
              onPress={() => handleCategorySelect(category)}
            >
              <View style={[styles.categoryIcon, { backgroundColor: theme.colors.secondary }]}>
                <MaterialCommunityIcons 
                  name={getCategoryIcon(category.nombre)} 
                  size={30} 
                  color="#fff" 
                />
              </View>
              <Text style={styles.categoryName}>{category.nombre}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Accesos rápidos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Accesos Rápidos</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={() => navigation.navigate('Orders')}
          >
            <MaterialCommunityIcons name="clipboard-list" size={30} color={theme.colors.primary} />
            <Text style={styles.quickActionText}>Mis Pedidos</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={() => navigation.navigate('Cart')}
          >
            <MaterialCommunityIcons name="cart" size={30} color={theme.colors.primary} />
            <Text style={styles.quickActionText}>Mi Carrito</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={() => navigation.navigate('Profile')}
          >
            <MaterialCommunityIcons name="account" size={30} color={theme.colors.primary} />
            <Text style={styles.quickActionText}>Mi Perfil</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Productos destacados */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Productos Destacados</Text>
          <Button 
            mode="text" 
            onPress={() => navigation.navigate('Catalog')}
            textColor={theme.colors.primary}
          >
            Ver todos
          </Button>
        </View>
        <View style={styles.productsGrid}>
          {featuredProducts.map((product) => (
            <TouchableOpacity
              key={product.id}
              style={styles.productCard}
              onPress={() => handleProductPress(product)}
            >
              <Card style={styles.productCardContent}>
                <Image 
                  source={{ uri: product.imagen_url || 'https://via.placeholder.com/150' }}
                  style={styles.productImage}
                />
                <Card.Content style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={2}>{product.nombre}</Text>
                  <Text style={styles.productPrice}>${product.precio_venta}</Text>
                  <Text style={styles.productStock}>Stock: {product.stock_total}</Text>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Promociones */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Promociones Especiales</Text>
        <Card style={styles.promoCard}>
          <LinearGradient
            colors={[theme.colors.tertiary, theme.colors.secondary]}
            style={styles.promoGradient}
          >
            <View style={styles.promoContent}>
              <MaterialCommunityIcons name="gift" size={40} color="#fff" />
              <View style={styles.promoText}>
                <Text style={styles.promoTitle}>¡Envío Gratis!</Text>
                <Text style={styles.promoSubtitle}>En compras mayores a $100</Text>
              </View>
            </View>
          </LinearGradient>
        </Card>
      </View>
    </ScrollView>
  );
};

const getCategoryIcon = (categoryName) => {
  const icons = {
    'Computadoras': 'laptop',
    'Muebles': 'sofa',
    'Comidas': 'food',
    'Electrónicos': 'cellphone',
  };
  return icons[categoryName] || 'package-variant';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userText: {
    marginLeft: 10,
  },
  greeting: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#ecf0f1',
    fontSize: 14,
  },
  cartButton: {
    position: 'relative',
    padding: 8,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchBar: {
    backgroundColor: '#fff',
    elevation: 2,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  categoriesContainer: {
    flexDirection: 'row',
  },
  categoryCard: {
    alignItems: 'center',
    marginRight: 20,
    width: 80,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    textAlign: 'center',
    color: '#2c3e50',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickActionCard: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    elevation: 2,
    minWidth: 80,
  },
  quickActionText: {
    marginTop: 8,
    fontSize: 12,
    color: '#2c3e50',
    textAlign: 'center',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    marginBottom: 15,
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
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 3,
  },
  productStock: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  promoCard: {
    elevation: 2,
  },
  promoGradient: {
    padding: 20,
    borderRadius: 8,
  },
  promoContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  promoText: {
    marginLeft: 15,
  },
  promoTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  promoSubtitle: {
    color: '#ecf0f1',
    fontSize: 14,
  },
});

export default ClientHomeScreen;

